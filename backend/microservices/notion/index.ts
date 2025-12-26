import express, { NextFunction, Request, Response } from "express";
import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 5014);
const BACKEND_URL = process.env.BACKEND_URL || "http://area_server:8080";
const NOTION_VERSION = process.env.NOTION_API_VERSION || "2022-06-28";

const NOTION_ACTION_TYPES = [
  "notion_new_page_created",
  "notion_database_entry_added",
  "notion_page_updated"
] as const;

type NotionActionType = typeof NOTION_ACTION_TYPES[number];

const NOTION_REACTION_TYPES = [
  "notion_create_page",
  "notion_database_add_entry",
  "notion_update_page"
] as const;

type NotionReactionType = typeof NOTION_REACTION_TYPES[number];

interface NotionJobState {
  lastCreatedTs?: number;
  lastEntryTs?: number;
  lastEditedTs?: number;
}

interface NotionJob {
  userId: string;
  areaId: string;
  actionType: NotionActionType;
  accessToken: string;
  config: Record<string, any>;
  intervalSeconds: number;
  timer: NodeJS.Timeout;
  state: NotionJobState;
}

const jobs = new Map<string, NotionJob>();

const logger = (scope: string, message: string, ...args: any[]) => {
  console.log(`[Notion][${scope}] ${message}`, ...args);
};

const createNotionClient = (accessToken: string): AxiosInstance => {
  return axios.create({
    baseURL: "https://api.notion.com/v1",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json"
    },
    timeout: 15000
  });
};

const normalizeNotionError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return typeof error.response.data.error === "string"
      ? error.response.data.error
      : JSON.stringify(error.response.data.error);
  }
  return error.message || "Unknown error";
};

const toTimestamp = (value?: string): number => {
  if (!value) return 0;
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? 0 : ts;
};

const extractTitle = (page: any): string => {
  const properties = page?.properties;
  if (!properties || typeof properties !== "object") {
    return page?.title || "Untitled";
  }

  for (const key of Object.keys(properties)) {
    const prop = properties[key];
    if (prop?.type === "title" && Array.isArray(prop.title)) {
      const text = prop.title
        .map((item: any) => item?.plain_text || "")
        .join("")
        .trim();
      if (text.length > 0) {
        return text;
      }
    }
  }

  return page?.title || "Untitled";
};

const resolvePlaceholder = (path: string, context: any): any => {
  if (!path) return undefined;
  const segments = path.split(".");
  let current = context;
  for (const segment of segments) {
    if (current == null) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
};

const applyTemplatesDeep = (input: any, context: any): any => {
  if (typeof input === "string") {
    return input.replace(/{{\s*([^}]+)\s*}}/g, (_match: string, key: string) => {
      const value = resolvePlaceholder(key, context);
      return value === undefined || value === null ? "" : String(value);
    });
  }

  if (Array.isArray(input)) {
    return input.map((item) => applyTemplatesDeep(item, context));
  }

  if (input && typeof input === "object") {
    const output: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      output[k] = applyTemplatesDeep(v, context);
    }
    return output;
  }

  return input;
};

const buildTemplateContext = (config: any, actionData: any) => ({
  ...actionData,
  ...config,
  actionData,
  config
});

const resolveStringField = (
  raw: any,
  context: any,
  fieldName: string,
  optional = false
): string | undefined => {
  if (raw === undefined || raw === null || raw === "") {
    if (optional) {
      return undefined;
    }
    throw new Error(`Missing required field "${fieldName}"`);
  }

  const resolved = applyTemplatesDeep(raw, context);

  if (resolved === undefined || resolved === null) {
    if (optional) {
      return undefined;
    }
    throw new Error(`Missing required field "${fieldName}"`);
  }

  if (typeof resolved === "string") {
    const trimmed = resolved.trim();
    if (!trimmed && !optional) {
      throw new Error(`Missing required field "${fieldName}"`);
    }
    return trimmed;
  }

  return String(resolved);
};

const parseJsonField = (
  raw: any,
  fieldName: string,
  context: any,
  optional = false
): any => {
  if (raw === undefined || raw === null || raw === "") {
    if (optional) {
      return undefined;
    }
    throw new Error(`Missing required field "${fieldName}"`);
  }

  let parsed = raw;

  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch (error: any) {
      throw new Error(`Invalid JSON for "${fieldName}": ${error.message}`);
    }
  }

  return applyTemplatesDeep(parsed, context);
};

const normalizeInterval = (value?: any): number => {
  const defaultSeconds = 60;
  const minSeconds = 15;
  const maxSeconds = 3600;
  const numeric = Number(value);

  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.min(Math.max(Math.floor(numeric), minSeconds), maxSeconds);
  }

  return defaultSeconds;
};

const requireAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.body?.accessToken;

  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Missing Notion access token"
    });
  }

  next();
};

const formatPagePayload = (page: any) => ({
  id: page?.id,
  url: page?.url,
  createdTime: page?.created_time,
  lastEditedTime: page?.last_edited_time,
  title: extractTitle(page),
  parent: page?.parent,
  properties: page?.properties
});

const triggerArea = async (job: NotionJob, payload: Record<string, any>) => {
  try {
    await axios.post(`${BACKEND_URL}/api/areas/triggers/execute`, {
      userId: job.userId,
      areaId: job.areaId,
      actionType: job.actionType,
      data: payload
    });
    logger(
      "Trigger",
      `Triggered AREA ${job.areaId} (${job.actionType}) with payload keys: ${Object.keys(
        payload
      ).join(", ")}`
    );
  } catch (error: any) {
    logger(
      "TriggerError",
      `Failed to trigger AREA ${job.areaId}: ${normalizeNotionError(error)}`,
      error.response?.data
    );
  }
};

const searchPages = async (accessToken: string, query?: string) => {
  try {
    const client = createNotionClient(accessToken);
    const body: Record<string, any> = {
      filter: {
        property: "object",
        value: "page"
      },
      sort: {
        timestamp: "last_edited_time",
        direction: "descending"
      },
      page_size: 20
    };

    if (query && typeof query === "string" && query.trim().length > 0) {
      body.query = query.trim();
    }

    const response = await client.post("/search", body);
    return response.data?.results || [];
  } catch (error: any) {
    throw new Error(`Failed to search Notion pages: ${normalizeNotionError(error)}`);
  }
};

const queryDatabase = async (accessToken: string, databaseId: string) => {
  try {
    const client = createNotionClient(accessToken);
    const response = await client.post(`/databases/${databaseId}/query`, {
      page_size: 20,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending"
        }
      ]
    });

    return response.data?.results || [];
  } catch (error: any) {
    throw new Error(`Failed to query Notion database: ${normalizeNotionError(error)}`);
  }
};

const retrievePage = async (accessToken: string, pageId: string) => {
  try {
    const client = createNotionClient(accessToken);
    const response = await client.get(`/pages/${pageId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to retrieve Notion page: ${normalizeNotionError(error)}`);
  }
};

const initializeJobState = async (job: NotionJob) => {
  switch (job.actionType) {
    case "notion_new_page_created": {
      const pages = await searchPages(job.accessToken, job.config?.search_query);
      job.state.lastCreatedTs =
        pages.length > 0
          ? Math.max(...pages.map((page: any) => toTimestamp(page.created_time)))
          : Date.now();
      break;
    }

    case "notion_database_entry_added": {
      const databaseId = job.config?.database_id;
      if (!databaseId) {
        throw new Error("Missing database_id in action configuration");
      }
      const entries = await queryDatabase(job.accessToken, databaseId);
      job.state.lastEntryTs = entries.length > 0 ? toTimestamp(entries[0].created_time) : Date.now();
      break;
    }

    case "notion_page_updated": {
      const pageId = job.config?.page_id;
      if (!pageId) {
        throw new Error("Missing page_id in action configuration");
      }
      const page = await retrievePage(job.accessToken, pageId);
      job.state.lastEditedTs = toTimestamp(page?.last_edited_time) || Date.now();
      break;
    }
  }
};

const runActionCheck = async (jobKey: string) => {
  const job = jobs.get(jobKey);
  if (!job) return;

  switch (job.actionType) {
    case "notion_new_page_created": {
      const pages = await searchPages(job.accessToken, job.config?.search_query);
      if (!pages.length) {
        return;
      }

      const reference = job.state.lastCreatedTs || 0;
      const newPages = pages.filter((page: any) => toTimestamp(page.created_time) > reference);

      if (newPages.length > 0) {
        const orderedPages = newPages.sort(
          (a: any, b: any) => toTimestamp(a.created_time) - toTimestamp(b.created_time)
        );

        for (const page of orderedPages) {
          await triggerArea(job, {
            event: "notion_new_page_created",
            page: formatPagePayload(page)
          });
        }

        const mostRecent = Math.max(
          reference,
          ...newPages.map((page: any) => toTimestamp(page.created_time))
        );
        job.state.lastCreatedTs = mostRecent;
      }

      const newest = Math.max(...pages.map((page: any) => toTimestamp(page.created_time)));
      job.state.lastCreatedTs = Math.max(job.state.lastCreatedTs || 0, newest);
      break;
    }

    case "notion_database_entry_added": {
      const databaseId = job.config?.database_id;
      if (!databaseId) {
        logger("Action", `AREA ${job.areaId} is missing database_id configuration`);
        return;
      }

      const entries = await queryDatabase(job.accessToken, databaseId);
      if (!entries.length) {
        return;
      }

      const reference = job.state.lastEntryTs || 0;
      const newEntries = entries.filter(
        (entry: any) => toTimestamp(entry.created_time) > reference
      );

      if (newEntries.length > 0) {
        const orderedEntries = newEntries.sort(
          (a: any, b: any) => toTimestamp(a.created_time) - toTimestamp(b.created_time)
        );

        for (const entry of orderedEntries) {
          await triggerArea(job, {
            event: "notion_database_entry_added",
            databaseId,
            page: formatPagePayload(entry)
          });
        }

        const mostRecent = Math.max(
          reference,
          ...newEntries.map((entry: any) => toTimestamp(entry.created_time))
        );
        job.state.lastEntryTs = mostRecent;
      }

      const newest = toTimestamp(entries[0].created_time);
      job.state.lastEntryTs = Math.max(job.state.lastEntryTs || 0, newest);
      break;
    }

    case "notion_page_updated": {
      const pageId = job.config?.page_id;
      if (!pageId) {
        logger("Action", `AREA ${job.areaId} is missing page_id configuration`);
        return;
      }

      const page = await retrievePage(job.accessToken, pageId);
      const lastEdited = toTimestamp(page?.last_edited_time);

      if (!job.state.lastEditedTs) {
        job.state.lastEditedTs = lastEdited;
        return;
      }

      if (lastEdited > job.state.lastEditedTs) {
        job.state.lastEditedTs = lastEdited;
        await triggerArea(job, {
          event: "notion_page_updated",
          page: formatPagePayload(page)
        });
      }
      break;
    }
  }
};

// ========== ROUTES ==========

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "notion-service",
    activeJobs: jobs.size,
    timestamp: new Date().toISOString()
  });
});

app.post("/auth/notion/callback", async (req: Request, res: Response) => {
  const { code, state } = req.body || {};

  if (!code || !state) {
    return res.status(400).json({
      success: false,
      error: "Missing code or state for Notion OAuth callback"
    });
  }

  try {
    const response = await axios.post(`${BACKEND_URL}/auth/oauth/notion/callback`, {
      code,
      state
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || normalizeNotionError(error),
      details: error.response?.data
    });
  }
});

app.post("/actions/start", requireAccessToken, async (req: Request, res: Response) => {
  try {
    const { userId, areaId, actionType, accessToken, config = {}, interval } = req.body;

    if (!userId || !areaId || !actionType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (userId, areaId, actionType)"
      });
    }

    if (!NOTION_ACTION_TYPES.includes(actionType)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported Notion action type: ${actionType}`
      });
    }

    const jobKey = `${userId}:${areaId}`;
    if (jobs.has(jobKey)) {
      clearInterval(jobs.get(jobKey)!.timer);
      jobs.delete(jobKey);
      logger("Actions", `Stopped existing job before restarting for AREA ${areaId}`);
    }

    const notionJob: NotionJob = {
      userId: String(userId),
      areaId: String(areaId),
      actionType,
      accessToken,
      config,
      intervalSeconds: normalizeInterval(interval ?? config?.checkInterval),
      timer: null as unknown as NodeJS.Timeout,
      state: {}
    };

    await initializeJobState(notionJob);

    const timer = setInterval(() => {
      runActionCheck(jobKey).catch((error: any) => {
        logger(
          "Actions",
          `Error while processing ${notionJob.actionType} for AREA ${notionJob.areaId}: ${normalizeNotionError(
            error
          )}`
        );
      });
    }, notionJob.intervalSeconds * 1000);

    notionJob.timer = timer;
    jobs.set(jobKey, notionJob);

    logger(
      "Actions",
      `Started action ${actionType} for AREA ${areaId} (interval ${notionJob.intervalSeconds}s)`
    );

    res.json({
      success: true,
      message: "Notion action started",
      data: {
        interval: notionJob.intervalSeconds
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to start Notion action"
    });
  }
});

app.post("/actions/stop", async (req: Request, res: Response) => {
  const { userId, areaId } = req.body;

  if (!userId || !areaId) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields (userId, areaId)"
    });
  }

  const jobKey = `${userId}:${areaId}`;
  const job = jobs.get(jobKey);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: "No active Notion action for this AREA"
    });
  }

  clearInterval(job.timer);
  jobs.delete(jobKey);

  logger("Actions", `Stopped action ${job.actionType} for AREA ${areaId}`);

  res.json({
    success: true,
    message: "Notion action stopped"
  });
});

app.post("/reactions/trigger", requireAccessToken, async (req: Request, res: Response) => {
  const { reactionType, accessToken, config = {}, actionData = {} } = req.body;

  if (!reactionType) {
    return res.status(400).json({
      success: false,
      error: "Missing reactionType"
    });
  }

  if (!NOTION_REACTION_TYPES.includes(reactionType)) {
    return res.status(400).json({
      success: false,
      error: `Unsupported Notion reaction type: ${reactionType}`
    });
  }

  const client = createNotionClient(accessToken);
  const context = buildTemplateContext(config, actionData);

  try {
    let response;

    switch (reactionType as NotionReactionType) {
      case "notion_create_page": {
        const parentId =
          resolveStringField(config.parent_id ?? actionData.parent_id, context, "parent_id") || "";
        const parentType = (
          resolveStringField(
            config.parent_type ?? actionData.parent_type,
            context,
            "parent_type",
            true
          ) || "database"
        ).toLowerCase();

        const properties = parseJsonField(
          config.properties ?? actionData.properties,
          "properties",
          context
        );

        const children = parseJsonField(
          config.children ?? actionData.children,
          "children",
          context,
          true
        );

        const body: Record<string, any> = {
          parent: parentType === "page" ? { page_id: parentId } : { database_id: parentId },
          properties
        };

        if (children) {
          body.children = children;
        }

        response = await client.post("/pages", body);
        break;
      }

      case "notion_database_add_entry": {
        const databaseId = resolveStringField(
          config.database_id ?? actionData.database_id,
          context,
          "database_id"
        );

        const properties = parseJsonField(
          config.properties ?? actionData.properties,
          "properties",
          context
        );

        const children = parseJsonField(
          config.children ?? actionData.children,
          "children",
          context,
          true
        );

        const body: Record<string, any> = {
          parent: { database_id: databaseId },
          properties
        };

        if (children) {
          body.children = children;
        }

        response = await client.post("/pages", body);
        break;
      }

      case "notion_update_page": {
        const pageId = resolveStringField(
          config.page_id ?? actionData.page_id,
          context,
          "page_id"
        );

        const properties = parseJsonField(
          config.properties ?? actionData.properties,
          "properties",
          context
        );

        response = await client.patch(`/pages/${pageId}`, {
          properties
        });
        break;
      }
    }

    res.json({
      success: true,
      data: response?.data
    });
  } catch (error: any) {
    logger("Reactions", `Error executing ${reactionType}: ${normalizeNotionError(error)}`);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || normalizeNotionError(error),
      details: error.response?.data
    });
  }
});

const shutdown = () => {
  logger("Shutdown", "Received termination signal, stopping timers...");
  jobs.forEach((job) => clearInterval(job.timer));
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(PORT, () => {
  logger("Startup", `Notion Service running on port ${PORT}`);
  logger("Startup", `Backend URL: ${BACKEND_URL}`);
});

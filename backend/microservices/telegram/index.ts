import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.TELEGRAM_SERVICE_PORT || process.env.PORT || 5009);

const TELEGRAM_API_BASE = "https://api.telegram.org";

const MIN_POLL_INTERVAL = 5;

const activePollers = new Map<string, NodeJS.Timeout>();

type TelegramActionType =
  | "new_message"
  | "new_member"
  | "bot_command"
  | "channel_post"
  | "poll_created";

type TelegramReactionType =
  | "send_message"
  | "send_photo"
  | "send_document"
  | "create_poll"
  | "pin_message"
  | "kick_user";

interface TelegramActionPayload {
  userId: string;
  actionType: TelegramActionType;
  config: Record<string, any>;
  accessToken: string;
}

interface TelegramReactionPayload {
  userId: string;
  reactionType: TelegramReactionType;
  config: Record<string, any>;
  accessToken: string;
  actionData?: Record<string, any>;
}

const telegramApiRequest = async <T = any>(
  botToken: string,
  method: string,
  params: Record<string, any>,
  httpMethod: "POST" | "GET" = "POST"
): Promise<T> => {
  const url = `${TELEGRAM_API_BASE}/bot${botToken}/${method}`;

  try {
    const response = await axios.request({
      method: httpMethod,
      url,
      data: httpMethod === "POST" ? params : undefined,
      params: httpMethod === "GET" ? params : undefined,
      timeout: 15000
    });

    if (!response.data?.ok) {
      throw new Error(response.data?.description || "Telegram API request failed");
    }

    return response.data.result as T;
  } catch (error: any) {
    const details = error.response?.data || error.message;
    console.error(`[Telegram API] ${method} error:`, details);
    throw new Error(error.response?.data?.description || error.message || "Telegram API request failed");
  }
};

const getUpdates = async (botToken: string, offset?: number) => {
  const params: Record<string, any> = {
    timeout: 0,
    limit: 25,
    allowed_updates: ["message", "channel_post", "poll", "my_chat_member", "chat_member"]
  };

  if (offset !== undefined) {
    params.offset = offset;
  }

  try {
    const response = await axios.get(`${TELEGRAM_API_BASE}/bot${botToken}/getUpdates`, {
      params,
      timeout: 15000
    });

    if (!response.data?.ok) {
      throw new Error(response.data?.description || "Failed to fetch updates");
    }

    return (response.data.result as any[]) || [];
  } catch (error: any) {
    console.error("[Telegram] getUpdates error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.description || error.message || "Failed to fetch Telegram updates");
  }
};

const normaliseChatId = (value?: any): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const str = String(value).trim();
  return str.length > 0 ? str : undefined;
};

const extractCommand = (text?: string, entity?: any) => {
  if (!text || !entity) {
    return { command: undefined, args: undefined };
  }

  const raw = text.substring(entity.offset + 1, entity.offset + entity.length);
  const [command, ...rest] = raw.split("@");
  const argsText = text.substring(entity.offset + entity.length).trim();

  return {
    command: command?.toLowerCase(),
    args: argsText.length > 0 ? argsText : undefined
  };
};

const resolvePath = (source: any, path: string) => {
  return path.split(".").reduce<any>((acc, key) => {
    if (acc === undefined || acc === null) {
      return undefined;
    }
    return acc[key];
  }, source);
};

const applyTemplate = (template: string, payload: Record<string, any> = {}) => {
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_match, key) => {
    const value = resolvePath(payload, key.trim());
    return value !== undefined && value !== null ? String(value) : "";
  });
};

const evaluateAction = (
  actionType: TelegramActionType,
  update: any,
  config: Record<string, any>
): Record<string, any> | null => {
  const targetChatId = normaliseChatId(config?.chat_id || config?.chatId);

  switch (actionType) {
    case "new_message": {
      const message = update.message;
      if (!message) {
        return null;
      }

      const messageChatId = normaliseChatId(message.chat?.id);
      if (targetChatId && messageChatId !== targetChatId) {
        return null;
      }

      if (config?.only_text && !message.text) {
        return null;
      }

      return {
        chatId: messageChatId,
        chatType: message.chat?.type,
        messageId: message.message_id,
        text: message.text || message.caption || "",
        senderId: message.from?.id,
        senderUsername: message.from?.username,
        senderFirstName: message.from?.first_name,
        senderLastName: message.from?.last_name,
        dataType: message.text ? "text" : message.photo ? "photo" : message.document ? "document" : "other",
        date: message.date,
        raw: message
      };
    }

    case "new_member": {
      const message = update.message;
      if (!message?.new_chat_members || message.new_chat_members.length === 0) {
        return null;
      }

      const messageChatId = normaliseChatId(message.chat?.id);
      if (targetChatId && messageChatId !== targetChatId) {
        return null;
      }

      const newMember = message.new_chat_members[0];
      return {
        chatId: messageChatId,
        chatTitle: message.chat?.title,
        newMemberId: newMember.id,
        newMemberUsername: newMember.username,
        newMemberFirstName: newMember.first_name,
        newMemberLastName: newMember.last_name,
        inviterId: message.from?.id,
        inviterUsername: message.from?.username,
        date: message.date
      };
    }

    case "bot_command": {
      const message = update.message;
      if (!message?.entities || !Array.isArray(message.entities)) {
        return null;
      }

      const commandEntity = message.entities.find((entity: any) => entity.type === "bot_command");
      if (!commandEntity) {
        return null;
      }

      const { command, args } = extractCommand(message.text, commandEntity);
      if (!command) {
        return null;
      }

      const configuredCommand = config?.command
        ? String(config.command).replace(/^\//, "").toLowerCase()
        : undefined;

      if (configuredCommand && configuredCommand !== command) {
        return null;
      }

      const messageChatId = normaliseChatId(message.chat?.id);
      if (targetChatId && messageChatId !== targetChatId) {
        return null;
      }

      return {
        chatId: messageChatId,
        command,
        arguments: args,
        senderId: message.from?.id,
        senderUsername: message.from?.username,
        messageId: message.message_id,
        date: message.date
      };
    }

    case "channel_post": {
      const channelPost = update.channel_post;
      if (!channelPost) {
        return null;
      }

      const configuredChannelId = normaliseChatId(config?.channel_id || config?.channelId);
      const channelId = normaliseChatId(channelPost.chat?.id);

      if (configuredChannelId && channelId !== configuredChannelId) {
        return null;
      }

      return {
        channelId,
        channelTitle: channelPost.chat?.title,
        messageId: channelPost.message_id,
        text: channelPost.text || channelPost.caption || "",
        date: channelPost.date,
        raw: channelPost
      };
    }

    case "poll_created": {
      const poll = update.poll || update.message?.poll || update.channel_post?.poll;
      if (!poll) {
        return null;
      }

      const message = update.message || update.channel_post;
      const messageChatId = normaliseChatId(message?.chat?.id);

      if (targetChatId && messageChatId && targetChatId !== messageChatId) {
        return null;
      }

      return {
        chatId: messageChatId,
        pollId: poll.id,
        question: poll.question,
        options: poll.options?.map((option: any) => ({
          text: option.text,
          voterCount: option.voter_count
        })),
        totalVoterCount: poll.total_voter_count,
        allowsMultipleAnswers: poll.allows_multiple_answers,
        raw: poll
      };
    }

    default:
      return null;
  }
};

app.post("/actions/check", async (req: Request, res: Response) => {
  try {
    const { userId, actionType, config, accessToken } = req.body as TelegramActionPayload;

    if (!userId || !actionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, actionType and accessToken are required"
      });
    }

    const parsedLastUpdateId = Number(config?.lastUpdateId);
    let lastUpdateId: number | undefined = Number.isNaN(parsedLastUpdateId)
      ? undefined
      : parsedLastUpdateId;

    const updates = await getUpdates(accessToken, lastUpdateId !== undefined ? lastUpdateId + 1 : undefined);

    let triggered = false;
    let actionData: Record<string, any> = {};
    let highestUpdateId = lastUpdateId || 0;

    for (const update of updates) {
      if (typeof update.update_id === "number" && update.update_id > highestUpdateId) {
        highestUpdateId = update.update_id;
      }

      const result = evaluateAction(actionType, update, config || {});
      if (result) {
        triggered = true;
        actionData = {
          ...result,
          lastUpdateId: highestUpdateId
        };
        break;
      }
    }

    if (!triggered && highestUpdateId && highestUpdateId !== lastUpdateId) {
      actionData = { lastUpdateId: highestUpdateId };
    } else if (!triggered && lastUpdateId) {
      actionData = { lastUpdateId };
    }

    res.json({
      success: true,
      triggered,
      data: actionData
    });
  } catch (error: any) {
    console.error("[Telegram] Action check error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to check Telegram action",
      details: error.message
    });
  }
});

app.post("/reactions/trigger", async (req: Request, res: Response) => {
  try {
    const { userId, reactionType, config, accessToken, actionData } = req.body as TelegramReactionPayload;

    if (!userId || !reactionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, reactionType and accessToken are required"
      });
    }

    const payload = config || {};
    const templateContext = actionData || {};
    let result: any;

    switch (reactionType) {
      case "send_message": {
        const chatId = normaliseChatId(payload.chat_id || payload.chatId || templateContext.chatId);
        const message = payload.message || payload.text;
        const parseMode = payload.parse_mode || payload.parseMode;

        if (!chatId || !message) {
          return res.status(400).json({
            success: false,
            error: "chat_id and message are required to send a message"
          });
        }

        result = await telegramApiRequest(accessToken, "sendMessage", {
          chat_id: chatId,
          text: applyTemplate(String(message), templateContext),
          parse_mode: parseMode
        });
        break;
      }

      case "send_photo": {
        const chatId = normaliseChatId(payload.chat_id || payload.chatId || templateContext.chatId);
        const photo = payload.photo || payload.photo_url || templateContext.photoUrl;
        const caption = payload.caption;

        if (!chatId || !photo) {
          return res.status(400).json({
            success: false,
            error: "chat_id and photo_url are required to send a photo"
          });
        }

        result = await telegramApiRequest(accessToken, "sendPhoto", {
          chat_id: chatId,
          photo,
          caption: caption ? applyTemplate(String(caption), templateContext) : undefined
        });
        break;
      }

      case "send_document": {
        const chatId = normaliseChatId(payload.chat_id || payload.chatId || templateContext.chatId);
        const document = payload.document || payload.document_url || templateContext.documentUrl;
        const caption = payload.caption;

        if (!chatId || !document) {
          return res.status(400).json({
            success: false,
            error: "chat_id and document_url are required to send a document"
          });
        }

        result = await telegramApiRequest(accessToken, "sendDocument", {
          chat_id: chatId,
          document,
          caption: caption ? applyTemplate(String(caption), templateContext) : undefined
        });
        break;
      }

      case "create_poll": {
        const chatId = normaliseChatId(payload.chat_id || payload.chatId || templateContext.chatId);
        const question = payload.question;
        const rawOptions = payload.options;

        if (!chatId || !question || !rawOptions) {
          return res.status(400).json({
            success: false,
            error: "chat_id, question and options are required to create a poll"
          });
        }

        let options: string[] = [];
        if (Array.isArray(rawOptions)) {
          options = rawOptions.map((opt) => String(opt).trim()).filter(Boolean);
        } else {
          options = String(rawOptions)
            .split(/\r?\n|,/)
            .map((opt) => opt.trim())
            .filter(Boolean);
        }

        if (options.length < 2) {
          return res.status(400).json({
            success: false,
            error: "At least two options are required to create a poll"
          });
        }

        result = await telegramApiRequest(accessToken, "sendPoll", {
          chat_id: chatId,
          question: applyTemplate(String(question), templateContext),
          options
        });
        break;
      }

      case "pin_message": {
        const chatId = normaliseChatId(payload.chat_id || payload.chatId || templateContext.chatId);
        const messageId = payload.message_id || payload.messageId || templateContext.messageId;

        if (!chatId || !messageId) {
          return res.status(400).json({
            success: false,
            error: "chat_id and message_id are required to pin a message"
          });
        }

        await telegramApiRequest(accessToken, "pinChatMessage", {
          chat_id: chatId,
          message_id: Number(messageId)
        });

        result = {
          chatId,
          messageId
        };
        break;
      }

      case "kick_user": {
        const chatId = normaliseChatId(payload.chat_id || payload.chatId || templateContext.chatId);
        const userId = payload.user_id || payload.userId || templateContext.userId;
        const untilDate = payload.until_date || payload.untilDate;

        if (!chatId || !userId) {
          return res.status(400).json({
            success: false,
            error: "chat_id and user_id are required to kick a user"
          });
        }

        await telegramApiRequest(accessToken, "banChatMember", {
          chat_id: chatId,
          user_id: Number(userId),
          until_date: untilDate ? Number(untilDate) : undefined
        });

        result = {
          chatId,
          userId
        };
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown reaction type: ${reactionType}`
        });
    }

    res.json({
      success: true,
      data: result,
      message: `Telegram reaction ${reactionType} executed`
    });
  } catch (error: any) {
    console.error("[Telegram] Reaction error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to execute Telegram reaction",
      details: error.response?.data
    });
  }
});

app.post("/actions/start", async (req: Request, res: Response) => {
  try {
    const { userId, areaId, actionType, interval, config, accessToken } = req.body;

    if (!userId || !areaId || !actionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, areaId, actionType and accessToken are required"
      });
    }

    const pollerKey = `${userId}:${areaId}`;
    if (activePollers.has(pollerKey)) {
      return res.status(400).json({
        success: false,
        error: "Poller already active for this AREA"
      });
    }

    const pollInterval = Math.max(Number(interval) || 20, MIN_POLL_INTERVAL) * 1000;
    let currentConfig = { ...(config || {}) };

    const executeCheck = async () => {
      try {
        const response = await axios.post(`http://localhost:${PORT}/actions/check`, {
          userId,
          actionType,
          config: currentConfig,
          accessToken
        });

        if (response.data?.data) {
          currentConfig = { ...currentConfig, ...response.data.data };
        }

        if (response.data?.triggered) {
          await axios.post(
            `${process.env.BACKEND_API || "http://area_server:8080"}/api/areas/triggers/execute`,
            {
              userId,
              areaId,
              actionType,
              data: response.data.data
            }
          );
        }
      } catch (error: any) {
        console.error(`[Telegram] Poller error for AREA ${areaId}:`, error.response?.data || error.message);
      }
    };

    const poller = setInterval(executeCheck, pollInterval);
    activePollers.set(pollerKey, poller);

    // Prime the poller once immediately to register offsets
    executeCheck().catch((error) => {
      console.error(`[Telegram] Initial poller run failed for AREA ${areaId}:`, error.message);
    });

    res.json({
      success: true,
      message: "Telegram poller started"
    });
  } catch (error: any) {
    console.error("[Telegram] Failed to start poller:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to start Telegram poller"
    });
  }
});

app.post("/actions/stop", async (req: Request, res: Response) => {
  try {
    const { userId, areaId } = req.body;
    const pollerKey = `${userId}:${areaId}`;

    if (activePollers.has(pollerKey)) {
      clearInterval(activePollers.get(pollerKey)!);
      activePollers.delete(pollerKey);
      console.log(`[Telegram] Poller stopped for AREA ${areaId}`);
    }

    res.json({
      success: true,
      message: "Telegram poller stopped"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to stop Telegram poller"
    });
  }
});

app.get("/actions/status", (_req: Request, res: Response) => {
  const activeAreas = Array.from(activePollers.keys());
  res.json({
    success: true,
    activePollers: activeAreas.length,
    areas: activeAreas
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    service: "telegram",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Telegram service listening on port ${PORT}`);
});

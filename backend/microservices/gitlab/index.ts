import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.GITLAB_SERVICE_PORT || 5013;
const GITLAB_URL = process.env.GITLAB_URL || 'https://gitlab.com';

// ==================== INTERFACES ====================

interface GitLabActionPayload {
  userId: string;
  actionType: string;
  config: any;
}

interface GitLabReactionPayload {
  userId: string;
  reactionType: string;
  config: any;
  accessToken: string;
}

interface OAuthCallbackPayload {
  code: string;
  userId: string;
}

// ==================== HELPER FUNCTIONS ====================

// Rate limiting for GitLab API
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // Minimum 1 second between requests

const rateLimitDelay = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delayTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delayTime));
  }
  lastRequestTime = Date.now();
};

// Encode projectId for use in GitLab API URLs
// GitLab accepts either numeric ID or URL-encoded path (group/project -> group%2Fproject)
const encodeProjectId = (projectId: string): string => {
  // If it's a numeric ID, return as-is
  if (/^\d+$/.test(projectId)) {
    return projectId;
  }
  // Otherwise, URL-encode it (replace / with %2F)
  return encodeURIComponent(projectId);
};

const makeGitLabRequest = async (
  endpoint: string,
  accessToken: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  data?: any,
  retries: number = 3
) => {
  // Apply rate limiting
  await rateLimitDelay();

  try {
    const response = await axios({
      method,
      url: `${GITLAB_URL}/api/v4${endpoint}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data
    });
    return response.data;
  } catch (error: any) {
    // Handle rate limiting (429) with exponential backoff
    if (error.response?.status === 429 && retries > 0) {
      const retryAfter = error.response.headers['retry-after'];
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, 4 - retries) * 1000;

      console.warn(`[GitLab API] Rate limited on ${endpoint}. Retrying in ${waitTime}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      return makeGitLabRequest(endpoint, accessToken, method, data, retries - 1);
    }

    console.error(`[GitLab API] Error on ${endpoint}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'GitLab API request failed');
  }
};

// ==================== OAUTH2 ====================

app.post("/auth/gitlab/callback", async (req, res) => {
  try {
    const { code, userId } = req.body as OAuthCallbackPayload;

    if (!code || !userId) {
      return res.status(400).json({
        success: false,
        error: "code and userId are required"
      });
    }

    const clientId = process.env.GITLAB_CLIENT_ID;
    const clientSecret = process.env.GITLAB_CLIENT_SECRET;
    const redirectUri = process.env.GITLAB_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({
        success: false,
        error: "GitLab OAuth credentials not configured"
      });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(`${GITLAB_URL}/oauth/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user info
    const userInfo = await makeGitLabRequest('/user', access_token);

    return res.json({
      success: true,
      data: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        userInfo: {
          id: userInfo.id,
          username: userInfo.username,
          name: userInfo.name,
          email: userInfo.email,
          avatar_url: userInfo.avatar_url
        }
      }
    });

  } catch (error: any) {
    console.error(`[GitLab OAuth] Error:`, error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error_description || error.message || "OAuth authentication failed"
    });
  }
});

app.post("/auth/gitlab/refresh", async (req, res) => {
  try {
    const { refreshToken, userId } = req.body;

    if (!refreshToken || !userId) {
      return res.status(400).json({
        success: false,
        error: "refreshToken and userId are required"
      });
    }

    const clientId = process.env.GITLAB_CLIENT_ID;
    const clientSecret = process.env.GITLAB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        error: "GitLab OAuth credentials not configured"
      });
    }

    const tokenResponse = await axios.post(`${GITLAB_URL}/oauth/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    return res.json({
      success: true,
      data: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in
      }
    });

  } catch (error: any) {
    console.error(`[GitLab OAuth] Refresh error:`, error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error_description || error.message || "Token refresh failed"
    });
  }
});

// ==================== ACTIONS (Triggers) ====================

app.post("/actions/check", async (req, res) => {
  try {
    const { userId, actionType, config, accessToken } = req.body as GitLabActionPayload & { accessToken: string };

    if (!userId || !actionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, actionType and accessToken are required"
      });
    }

    let triggered = false;
    let actionData = {};

    switch (actionType) {
      case "new_issue": {
        const { projectId } = config;
        if (!projectId) {
          return res.status(400).json({ success: false, error: "projectId is required" });
        }

        const encodedProjectId = encodeProjectId(projectId);
        const issues = await makeGitLabRequest(
          `/projects/${encodedProjectId}/issues?state=opened&order_by=created_at&sort=desc&per_page=5`,
          accessToken
        );

        if (issues && issues.length > 0) {
          const latestIssue = issues[0];
          const issueCreatedAt = new Date(latestIssue.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - issueCreatedAt.getTime();

          // Consider it new if created in the last 2 minutes
          if (timeDiff < 120000) {
            triggered = true;
            actionData = {
              issue_iid: latestIssue.iid,
              issue_id: latestIssue.id,
              issue_title: latestIssue.title,
              issue_description: latestIssue.description,
              issue_url: latestIssue.web_url,
              author: latestIssue.author.username,
              author_name: latestIssue.author.name,
              created_at: latestIssue.created_at,
              labels: latestIssue.labels
            };
          }
        }
        break;
      }

      case "merge_request_merged": {
        const { projectId } = config;
        if (!projectId) {
          return res.status(400).json({ success: false, error: "projectId is required" });
        }

        const mergeRequests = await makeGitLabRequest(
          `/projects/${encodeProjectId(projectId)}/merge_requests?state=merged&order_by=updated_at&sort=desc&per_page=5`,
          accessToken
        );

        if (mergeRequests && mergeRequests.length > 0) {
          const latestMR = mergeRequests[0];
          const mergedAt = new Date(latestMR.merged_at);
          const now = new Date();
          const timeDiff = now.getTime() - mergedAt.getTime();

          // Consider it new if merged in the last 2 minutes
          if (timeDiff < 120000) {
            triggered = true;
            actionData = {
              mr_iid: latestMR.iid,
              mr_id: latestMR.id,
              mr_title: latestMR.title,
              mr_description: latestMR.description,
              mr_url: latestMR.web_url,
              author: latestMR.author.username,
              author_name: latestMR.author.name,
              merged_by: latestMR.merged_by?.username,
              merged_by_name: latestMR.merged_by?.name,
              merged_at: latestMR.merged_at,
              source_branch: latestMR.source_branch,
              target_branch: latestMR.target_branch,
              labels: latestMR.labels
            };
          }
        }
        break;
      }

      case "new_merge_request": {
        const { projectId } = config;
        if (!projectId) {
          return res.status(400).json({ success: false, error: "projectId is required" });
        }

        const mergeRequests = await makeGitLabRequest(
          `/projects/${encodeProjectId(projectId)}/merge_requests?state=opened&order_by=created_at&sort=desc&per_page=5`,
          accessToken
        );

        if (mergeRequests && mergeRequests.length > 0) {
          const latestMR = mergeRequests[0];
          const mrCreatedAt = new Date(latestMR.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - mrCreatedAt.getTime();

          if (timeDiff < 120000) {
            triggered = true;
            actionData = {
              mr_iid: latestMR.iid,
              mr_id: latestMR.id,
              mr_title: latestMR.title,
              mr_description: latestMR.description,
              mr_url: latestMR.web_url,
              author: latestMR.author.username,
              author_name: latestMR.author.name,
              created_at: latestMR.created_at,
              source_branch: latestMR.source_branch,
              target_branch: latestMR.target_branch
            };
          }
        }
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action type: ${actionType}`
        });
    }

    return res.json({
      success: true,
      triggered,
      data: actionData
    });

  } catch (error: any) {
    console.error(`[GitLab Actions] Error:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
});

// ==================== REACTIONS ====================

app.post("/reactions/trigger", async (req, res) => {
  try {
    const { userId, reactionType, config, accessToken, actionData } = req.body as GitLabReactionPayload & { actionData?: any };

    console.log('[GitLab Microservice] Received request:', {
      userId,
      reactionType,
      config,
      hasAccessToken: !!accessToken
    });

    if (!userId || !reactionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, reactionType and accessToken are required"
      });
    }

    let reactionResult = {};

    switch (reactionType) {
      case "create_issue": {
        const { projectId, title, description, labels, assigneeIds } = config;
        console.log('[GitLab create_issue] Extracted params:', { projectId, title, description, labels, assigneeIds });
        if (!projectId || !title) {
          console.log('[GitLab create_issue] Validation failed:', { projectId, title });
          return res.status(400).json({ success: false, error: "projectId and title are required" });
        }

        const issueData: any = {
          title,
          description: description || ""
        };

        if (labels) {
          issueData.labels = labels;
        }

        if (assigneeIds) {
          issueData.assignee_ids = Array.isArray(assigneeIds) ? assigneeIds : [assigneeIds];
        }

        const issue = await makeGitLabRequest(
          `/projects/${encodeProjectId(projectId)}/issues`,
          accessToken,
          'POST',
          issueData
        );

        reactionResult = {
          issue_iid: issue.iid,
          issue_id: issue.id,
          issue_url: issue.web_url
        };
        break;
      }

      case "comment_merge_request": {
        const { projectId, mergeRequestIid, body } = config;

        // Allow using mr_iid from actionData if not provided in config
        const finalMrIid = mergeRequestIid || actionData?.mr_iid;

        if (!projectId || !finalMrIid || !body) {
          return res.status(400).json({
            success: false,
            error: "projectId, mergeRequestIid (or mr_iid from action) and body are required"
          });
        }

        const note = await makeGitLabRequest(
          `/projects/${encodeProjectId(projectId)}/merge_requests/${finalMrIid}/notes`,
          accessToken,
          'POST',
          { body }
        );

        reactionResult = {
          note_id: note.id,
          note_body: note.body,
          created_at: note.created_at
        };
        break;
      }

      case "add_label": {
        const { projectId, issueIid, labels } = config;

        // Allow using issue_iid from actionData if not provided in config
        const finalIssueIid = issueIid || actionData?.issue_iid;

        if (!projectId || !finalIssueIid || !labels) {
          return res.status(400).json({
            success: false,
            error: "projectId, issueIid (or issue_iid from action) and labels are required"
          });
        }

        // Get current labels
        const issue = await makeGitLabRequest(
          `/projects/${encodeProjectId(projectId)}/issues/${finalIssueIid}`,
          accessToken
        );

        const currentLabels = issue.labels || [];
        const newLabels = Array.isArray(labels) ? labels : labels.split(',').map((l: string) => l.trim());
        const updatedLabels = [...new Set([...currentLabels, ...newLabels])];

        const updatedIssue = await makeGitLabRequest(
          `/projects/${encodeProjectId(projectId)}/issues/${finalIssueIid}`,
          accessToken,
          'PUT',
          { labels: updatedLabels.join(',') }
        );

        reactionResult = {
          issue_iid: updatedIssue.iid,
          labels: updatedIssue.labels
        };
        break;
      }

      case "close_issue": {
        const { projectId, issueIid } = config;

        // Allow using issue_iid from actionData if not provided in config
        const finalIssueIid = issueIid || actionData?.issue_iid;

        if (!projectId || !finalIssueIid) {
          return res.status(400).json({
            success: false,
            error: "projectId and issueIid (or issue_iid from action) are required"
          });
        }

        const issue = await makeGitLabRequest(
          `/projects/${encodeProjectId(projectId)}/issues/${finalIssueIid}`,
          accessToken,
          'PUT',
          { state_event: 'close' }
        );

        reactionResult = {
          issue_iid: issue.iid,
          issue_url: issue.web_url,
          state: issue.state
        };
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown reaction type: ${reactionType}`
        });
    }

    return res.json({
      success: true,
      data: reactionResult
    });

  } catch (error: any) {
    console.error(`[GitLab Reactions] Error:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
});

// ==================== POLLING MANAGEMENT ====================

interface PollingJob {
  userId: string;
  areaId: string;
  actionType: string;
  config: any;
  accessToken: string;
  interval: NodeJS.Timeout;
}

const activePolls: Map<string, PollingJob> = new Map();

app.post("/actions/start", async (req, res) => {
  try {
    const { userId, areaId, actionType, interval, config, accessToken } = req.body;

    if (!userId || !areaId || !actionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, areaId, actionType and accessToken are required"
      });
    }

    // Minimum 2 minutes to respect GitLab rate limits (300 req/min)
    const pollInterval = Math.max(interval || 120000, 120000); // Default 120 seconds, minimum 120 seconds
    const pollKey = `${userId}-${areaId}`;

    // Stop existing poll if any
    if (activePolls.has(pollKey)) {
      clearInterval(activePolls.get(pollKey)!.interval);
    }

    // Start new polling
    const intervalId = setInterval(async () => {
      try {
        console.log(`[GitLab Polling] Checking ${actionType} for area ${areaId}`);

        const checkResponse = await axios.post('http://localhost:' + PORT + '/actions/check', {
          userId,
          actionType,
          config,
          accessToken
        });

        if (checkResponse.data.triggered) {
          console.log(`[GitLab Polling] Action triggered for area ${areaId}`, checkResponse.data.data);

          // Notify the main backend
          const BACKEND_URL = process.env.BACKEND_URL || 'http://area_server:8080';
          const payload = {
            userId,
            areaId,
            data: checkResponse.data.data
          };

          console.log(`[GitLab Polling] Calling backend ${BACKEND_URL}/api/areas/triggers/execute with:`, payload);

          const response = await axios.post(`${BACKEND_URL}/api/areas/triggers/execute`, payload);
          console.log(`[GitLab Polling] Backend response:`, response.status, response.data);
        }
      } catch (error: any) {
        console.error(`[GitLab Polling] Error for area ${areaId}:`, error.message);
        if (error.response) {
          console.error(`[GitLab Polling] Error status:`, error.response.status);
          console.error(`[GitLab Polling] Error data:`, error.response.data);
        }
      }
    }, pollInterval);

    activePolls.set(pollKey, {
      userId,
      areaId,
      actionType,
      config,
      accessToken,
      interval: intervalId
    });

    console.log(`[GitLab Polling] Started polling for area ${areaId} every ${pollInterval}ms`);

    return res.json({
      success: true,
      message: `Polling started for area ${areaId}`,
      interval: pollInterval
    });

  } catch (error: any) {
    console.error(`[GitLab Polling] Error starting poll:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/actions/stop", async (req, res) => {
  try {
    const { userId, areaId } = req.body;

    if (!userId || !areaId) {
      return res.status(400).json({
        success: false,
        error: "userId and areaId are required"
      });
    }

    const pollKey = `${userId}-${areaId}`;

    if (activePolls.has(pollKey)) {
      const job = activePolls.get(pollKey)!;
      clearInterval(job.interval);
      activePolls.delete(pollKey);

      console.log(`[GitLab Polling] Stopped polling for area ${areaId}`);

      return res.json({
        success: true,
        message: `Polling stopped for area ${areaId}`
      });
    } else {
      return res.json({
        success: true,
        message: `No active polling found for area ${areaId}`
      });
    }

  } catch (error: any) {
    console.error(`[GitLab Polling] Error stopping poll:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "gitlab",
    activePolls: activePolls.size,
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`[GitLab Service] Running on port ${PORT}`);
  console.log(`[GitLab Service] GitLab URL: ${GITLAB_URL}`);
});

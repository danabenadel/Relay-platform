import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.GITHUB_SERVICE_PORT || 5006;

const normalizeBranchName = (branch?: string, fallback = "main") => {
  if (!branch) return fallback;
  const trimmed = String(branch).trim();
  if (!trimmed) return fallback;
  const colonIndex = trimmed.indexOf(":");
  const cleaned = colonIndex !== -1 ? trimmed.slice(colonIndex + 1).trim() : trimmed;
  return cleaned || fallback;
};

const sanitizeActionConfig = (actionType: string, config: any = {}) => {
  if (!config || typeof config !== "object") {
    return {};
  }

  switch (actionType) {
    case "new_commit":
      return {
        ...config,
        branch: normalizeBranchName(config.branch)
      };
    default:
      return config;
  }
};

// ==================== INTERFACES ====================

interface GitHubActionPayload {
  userId: string;
  actionType: string;
  config: any;
}

interface GitHubReactionPayload {
  userId: string;
  reactionType: string;
  config: any;
  accessToken: string;
}

// ==================== HELPER FUNCTIONS ====================

const makeGitHubRequest = async (
  endpoint: string,
  accessToken: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  data?: any
) => {
  try {
    const response = await axios({
      method,
      url: `https://api.github.com${endpoint}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      data
    });

    const remaining = response.headers['x-ratelimit-remaining'];
    const resetTime = response.headers['x-ratelimit-reset'];
    if (remaining && parseInt(remaining) < 100) {
      console.warn(`[GitHub API] Rate limit warning: ${remaining} requests remaining until ${new Date(parseInt(resetTime) * 1000)}`);
    }

    return response.data;
  } catch (error: any) {
    // GitHub returns both 403 and 429 for rate limiting
    if ((error.response?.status === 403 || error.response?.status === 429) &&
        (error.response?.data?.message?.includes('rate limit') || error.response?.status === 429)) {
      const resetTime = error.response.headers['x-ratelimit-reset'];
      const resetDate = new Date(parseInt(resetTime) * 1000);
      console.error(`[GitHub API] Rate limit exceeded. Resets at: ${resetDate}`);
      throw new Error(`Rate limit exceeded. API will reset at ${resetDate.toISOString()}`);
    }

    console.error(`[GitHub API] Error on ${endpoint}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'GitHub API request failed');
  }
};

// ==================== ACTIONS (Triggers) ====================

app.post("/actions/check", async (req, res) => {
  try {
    const { userId, actionType, config: rawConfig, accessToken } = req.body as GitHubActionPayload & { accessToken: string };

    if (!userId || !actionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, actionType and accessToken are required"
      });
    }

    const config = sanitizeActionConfig(actionType, rawConfig);

    let triggered = false;
    let actionData = {};

    switch (actionType) {
      case "new_issue": {
        const { owner, repo } = config;
        if (!owner || !repo) {
          return res.status(400).json({ success: false, error: "owner and repo are required" });
        }

        const issues = await makeGitHubRequest(
          `/repos/${owner}/${repo}/issues?state=open&sort=created&direction=desc&per_page=1`,
          accessToken
        );

        if (issues && issues.length > 0) {
          const latestIssue = issues[0];

          // Check if this is a new issue we haven't seen before
          if (!config.lastIssueNumber) {
            // First check - initialize with current latest issue, but don't trigger
            console.log(`[GitHub] Initializing lastIssueNumber for area with issue #${latestIssue.number}`);
            actionData = {
              lastIssueNumber: latestIssue.number
            };
          } else if (latestIssue.number === config.lastIssueNumber) {
            // Same issue as before, don't trigger
            actionData = {
              lastIssueNumber: config.lastIssueNumber
            };
          } else if (latestIssue.number > config.lastIssueNumber) {
            // New issue detected!
            console.log(`[GitHub] New issue detected: #${latestIssue.number} (previous: #${config.lastIssueNumber})`);
            triggered = true;
            actionData = {
              issue_number: latestIssue.number,
              issue_title: latestIssue.title,
              issue_body: latestIssue.body,
              issue_url: latestIssue.html_url,
              author: latestIssue.user.login,
              created_at: latestIssue.created_at,
              lastIssueNumber: latestIssue.number
            };
          } else {
            // Current issue number is lower than stored one (shouldn't happen normally)
            console.log(`[GitHub] Issue number lower than stored (${latestIssue.number} < ${config.lastIssueNumber}), updating stored value`);
            actionData = {
              lastIssueNumber: latestIssue.number
            };
          }
        }
        break;
      }

      case "new_pull_request": {
        const { owner, repo } = config;
        if (!owner || !repo) {
          return res.status(400).json({ success: false, error: "owner and repo are required" });
        }

        const prs = await makeGitHubRequest(
          `/repos/${owner}/${repo}/pulls?state=open&sort=created&direction=desc&per_page=5`,
          accessToken
        );

        if (prs && prs.length > 0) {
          const latestPR = prs[0];
          const prCreatedAt = new Date(latestPR.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - prCreatedAt.getTime();

          if (timeDiff < 120000) {
            triggered = true;
            actionData = {
              pr_number: latestPR.number,
              pr_title: latestPR.title,
              pr_body: latestPR.body,
              pr_url: latestPR.html_url,
              author: latestPR.user.login,
              branch: latestPR.head.ref,
              created_at: latestPR.created_at
            };
          }
        }
        break;
      }

      case "pull_request_merged": {
        const { owner, repo } = config;
        if (!owner || !repo) {
          return res.status(400).json({ success: false, error: "owner and repo are required" });
        }

        const prs = await makeGitHubRequest(
          `/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=5`,
          accessToken
        );

        if (prs && prs.length > 0) {
          for (const pr of prs) {
            if (pr.merged_at) {
              const mergedAt = new Date(pr.merged_at);
              const now = new Date();
              const timeDiff = now.getTime() - mergedAt.getTime();

              if (timeDiff < 120000) {
                triggered = true;
                actionData = {
                  pr_number: pr.number,
                  pr_title: pr.title,
                  pr_url: pr.html_url,
                  author: pr.user.login,
                  merged_by: pr.merged_by?.login,
                  merged_at: pr.merged_at
                };
                break;
              }
            }
          }
        }
        break;
      }

      case "new_star": {
        const { owner, repo } = config;
        if (!owner || !repo) {
          return res.status(400).json({ success: false, error: "owner and repo are required" });
        }

        const stargazers = await makeGitHubRequest(
          `/repos/${owner}/${repo}/stargazers?per_page=5`,
          accessToken
        );

        const repoInfo = await makeGitHubRequest(
          `/repos/${owner}/${repo}`,
          accessToken
        );

        if (stargazers && stargazers.length > 0) {
          const latestStargazer = stargazers[0];
          triggered = true;
          actionData = {
            total_stars: repoInfo.stargazers_count,
            latest_stargazer: latestStargazer.login,
            repo_url: repoInfo.html_url
          };
        }
        break;
      }

      case "new_commit": {
        const { owner, repo, branch } = config;
        if (!owner || !repo) {
          return res.status(400).json({ success: false, error: "owner and repo are required" });
        }

        const branchName = branch || 'main';
        const commits = await makeGitHubRequest(
          `/repos/${owner}/${repo}/commits?sha=${branchName}&per_page=1`,
          accessToken
        );

        if (commits && commits.length > 0) {
          const latestCommit = commits[0];
          const commitDate = new Date(latestCommit.commit.author.date);
          const now = new Date();
          const timeDiff = now.getTime() - commitDate.getTime();

          if (timeDiff < 120000) {
            triggered = true;
            actionData = {
              sha: latestCommit.sha,
              message: latestCommit.commit.message,
              author: latestCommit.commit.author.name,
              author_username: latestCommit.author?.login,
              url: latestCommit.html_url,
              branch: branchName,
              date: latestCommit.commit.author.date
            };
          }
        }
        break;
      }

      case "new_release": {
        const { owner, repo } = config;
        if (!owner || !repo) {
          return res.status(400).json({ success: false, error: "owner and repo are required" });
        }

        const releases = await makeGitHubRequest(
          `/repos/${owner}/${repo}/releases?per_page=5`,
          accessToken
        );

        if (releases && releases.length > 0) {
          const latestRelease = releases[0];
          const publishedAt = new Date(latestRelease.published_at);
          const now = new Date();
          const timeDiff = now.getTime() - publishedAt.getTime();

          if (timeDiff < 120000) {
            triggered = true;
            actionData = {
              tag_name: latestRelease.tag_name,
              name: latestRelease.name,
              body: latestRelease.body,
              url: latestRelease.html_url,
              author: latestRelease.author?.login,
              published_at: latestRelease.published_at
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
    console.error(`[GitHub Actions] Error:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
});

// ==================== REACTIONS ====================

app.post("/reactions/trigger", async (req, res) => {
  try {
    const { userId, reactionType, config, accessToken, actionData } = req.body as GitHubReactionPayload & { actionData?: any };

    if (!userId || !reactionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, reactionType and accessToken are required"
      });
    }

    let reactionResult = {};

    switch (reactionType) {
      case "create_issue": {
        const { owner, repo, title, body, labels } = config;
        if (!owner || !repo || !title) {
          return res.status(400).json({ success: false, error: "owner, repo and title are required" });
        }

        const issueData: any = {
          title,
          body: body || ""
        };

        if (labels) {
          issueData.labels = labels.split(',').map((l: string) => l.trim());
        }

        const issue = await makeGitHubRequest(
          `/repos/${owner}/${repo}/issues`,
          accessToken,
          'POST',
          issueData
        );

        reactionResult = {
          issue_number: issue.number,
          issue_url: issue.html_url
        };
        break;
      }

      case "create_comment": {
        const { owner, repo, issueNumber, body } = config;
        if (!owner || !repo || !issueNumber || !body) {
          return res.status(400).json({
            success: false,
            error: "owner, repo, issueNumber and body are required"
          });
        }

        const comment = await makeGitHubRequest(
          `/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
          accessToken,
          'POST',
          { body }
        );

        reactionResult = {
          comment_id: comment.id,
          comment_url: comment.html_url
        };
        break;
      }

      case "star_repository": {
        const { owner, repo } = config;
        if (!owner || !repo) {
          return res.status(400).json({ success: false, error: "owner and repo are required" });
        }

        // GitHub API requires a specific endpoint and empty body for starring
        try {
          await axios({
            method: 'PUT',
            url: `https://api.github.com/user/starred/${owner}/${repo}`,
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github+json',
              'Content-Length': '0',
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });

          reactionResult = {
            message: `Successfully starred ${owner}/${repo}`
          };
        } catch (error: any) {
          console.error(`[GitHub API] Star error:`, error.response?.data || error.message);
          throw new Error(error.response?.data?.message || 'Failed to star repository');
        }
        break;
      }

      case "create_branch": {
        const { owner, repo, branchName, fromBranch } = config;
        if (!owner || !repo || !branchName) {
          return res.status(400).json({
            success: false,
            error: "owner, repo and branchName are required"
          });
        }

        const sourceBranch = fromBranch || 'main';

        // Get the SHA of the source branch
        let refData;
        try {
          refData = await makeGitHubRequest(
            `/repos/${owner}/${repo}/git/refs/heads/${sourceBranch}`,
            accessToken
          );
        } catch (error: any) {
          // If 'main' doesn't exist, try 'master'
          if (sourceBranch === 'main' && !fromBranch) {
            try {
              console.log(`[GitHub] Branch 'main' not found, trying 'master' for ${owner}/${repo}`);
              refData = await makeGitHubRequest(
                `/repos/${owner}/${repo}/git/refs/heads/master`,
                accessToken
              );
            } catch (masterError: any) {
              throw new Error(`Source branch not found. Repository ${owner}/${repo} has no 'main' or 'master' branch. The repository might be empty or you need to specify an existing branch in 'fromBranch'.`);
            }
          } else {
            throw new Error(`Source branch '${sourceBranch}' not found in ${owner}/${repo}. Please verify the branch exists or leave 'fromBranch' empty to use the default branch.`);
          }
        }

        // Create the new branch
        const newBranch = await makeGitHubRequest(
          `/repos/${owner}/${repo}/git/refs`,
          accessToken,
          'POST',
          {
            ref: `refs/heads/${branchName}`,
            sha: refData.object.sha
          }
        );

        reactionResult = {
          branch_name: branchName,
          ref: newBranch.ref,
          sha: newBranch.object.sha
        };
        break;
      }

      case "close_issue": {
        const { owner, repo, issueNumber } = config;
        if (!owner || !repo || !issueNumber) {
          return res.status(400).json({
            success: false,
            error: "owner, repo and issueNumber are required"
          });
        }

        const issue = await makeGitHubRequest(
          `/repos/${owner}/${repo}/issues/${issueNumber}`,
          accessToken,
          'PATCH',
          { state: 'closed' }
        );

        reactionResult = {
          issue_number: issue.number,
          issue_url: issue.html_url,
          state: issue.state
        };
        break;
      }

      case "add_label": {
        const { owner, repo, issueNumber, labels } = config;
        if (!owner || !repo || !issueNumber || !labels) {
          return res.status(400).json({
            success: false,
            error: "owner, repo, issueNumber and labels are required"
          });
        }

        const labelArray = labels.split(',').map((l: string) => l.trim());

        const updatedLabels = await makeGitHubRequest(
          `/repos/${owner}/${repo}/issues/${issueNumber}/labels`,
          accessToken,
          'POST',
          { labels: labelArray }
        );

        reactionResult = {
          issue_number: issueNumber,
          labels: updatedLabels.map((l: any) => l.name)
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
    console.error(`[GitHub Reactions] Error:`, error.message);
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

// Global rate limit tracking
let globalRateLimitResetTime: Date | null = null;

const isRateLimited = (): boolean => {
  if (!globalRateLimitResetTime) return false;
  const now = new Date();
  if (now < globalRateLimitResetTime) {
    console.log(`[GitHub] Still rate limited. Cooldown until ${globalRateLimitResetTime.toISOString()}`);
    return true;
  }
  // Reset time has passed
  globalRateLimitResetTime = null;
  return false;
};

app.post("/actions/start", async (req, res) => {
  try {
    const { userId, areaId, actionType, interval, config: rawConfig, accessToken } = req.body;

    if (!userId || !areaId || !actionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, areaId, actionType and accessToken are required"
      });
    }

    const config = sanitizeActionConfig(actionType, rawConfig);

    // Enforce a minimum poll interval of 10 seconds (10000 ms)
    const MIN_POLL_INTERVAL = 10000;
    const pollInterval = Math.max(interval || MIN_POLL_INTERVAL, MIN_POLL_INTERVAL); // Minimum 10 seconds
    const pollKey = `${userId}-${areaId}`;

    // Stop existing poll if any
    if (activePolls.has(pollKey)) {
      clearInterval(activePolls.get(pollKey)!.interval);
    }

    // Start new polling
    const intervalId = setInterval(async () => {
      try {
        // Skip if globally rate limited
        if (isRateLimited()) {
          console.log(`[GitHub Polling] Skipping check for area ${areaId} due to global rate limit`);
          return;
        }

        console.log(`[GitHub Polling] Checking ${actionType} for area ${areaId}`);

        const checkResponse = await axios.post('http://localhost:' + PORT + '/actions/check', {
          userId,
          actionType,
          config,
          accessToken
        });

        // Always update config first (for tracking purposes like lastIssueNumber)
        if (checkResponse.data.data && Object.keys(checkResponse.data.data).length > 0) {
          const job = activePolls.get(`${userId}-${areaId}`);
          if (job && checkResponse.data.data.lastIssueNumber !== undefined) {
            job.config.lastIssueNumber = checkResponse.data.data.lastIssueNumber;
            console.log(`[GitHub Polling] Updated lastIssueNumber for area ${areaId}: ${checkResponse.data.data.lastIssueNumber}`);
          }
        }

        if (checkResponse.data.triggered) {
          console.log(`[GitHub Polling] Action triggered for area ${areaId}`, checkResponse.data.data);

          // Notify the main backend with updated config
          const BACKEND_URL = process.env.BACKEND_URL || 'http://area_server:8080';
          await axios.post(`${BACKEND_URL}/api/areas/triggers/execute`, {
            userId,
            areaId,
            data: checkResponse.data.data,
            // Include the updated config to persist the lastIssueNumber
            updatedConfig: activePolls.get(`${userId}-${areaId}`)?.config
          });
        }
      } catch (error: any) {
        console.error(`[GitHub Polling] Error for area ${areaId}:`, error.message);

        // If rate limited, set global cooldown
        if (error.message?.includes('Rate limit exceeded')) {
          // Extract reset time from error message or use default 15 minutes
          const resetMatch = error.message.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
          if (resetMatch) {
            globalRateLimitResetTime = new Date(resetMatch[1]);
            console.error(`[GitHub Polling] Global rate limit set. All polling paused until ${globalRateLimitResetTime.toISOString()}`);
          } else {
            // Default to 15 minutes if we can't parse the reset time
            globalRateLimitResetTime = new Date(Date.now() + 15 * 60 * 1000);
            console.error(`[GitHub Polling] Global rate limit set. All polling paused for 15 minutes until ${globalRateLimitResetTime.toISOString()}`);
          }
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

    console.log(`[GitHub Polling] Started polling for area ${areaId} every ${pollInterval}ms`);

    return res.json({
      success: true,
      message: `Polling started for area ${areaId}`,
      interval: pollInterval
    });

  } catch (error: any) {
    console.error(`[GitHub Polling] Error starting poll:`, error.message);
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

      console.log(`[GitHub Polling] Stopped polling for area ${areaId}`);

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
    console.error(`[GitHub Polling] Error stopping poll:`, error.message);
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
    service: "github",
    activePolls: activePolls.size,
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`[GitHub Service] Running on port ${PORT}`);
});

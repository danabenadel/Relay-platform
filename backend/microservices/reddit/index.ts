import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.REDDIT_SERVICE_PORT || 5005;

// ==================== INTERFACES ====================

interface RedditActionPayload {
  userId: string;
  actionType: string;
  config: any;
}

interface RedditReactionPayload {
  userId: string;
  reactionType: string;
  config: any;
  accessToken: string;
}

// ==================== HELPER FUNCTIONS ====================

const makeRedditRequest = async (
  endpoint: string,
  accessToken: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
) => {
  try {
    const userAgent = `web:${process.env.REDDIT_CLIENT_ID || 'AREA-App'}:1.0.0 (by /u/Additional_Ad_3901)`;

    const contentType = method === 'POST' ? 'application/x-www-form-urlencoded' : 'application/json';

    let requestData = data;
    if (method === 'POST' && data) {
      requestData = new URLSearchParams(data).toString();
    }

    console.log(`[Reddit API] ${method} ${endpoint} with User-Agent: ${userAgent}`);

    const response = await axios({
      method,
      url: `https://oauth.reddit.com${endpoint}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': contentType,
        'User-Agent': userAgent
      },
      data: requestData
    });
    return response.data;
  } catch (error: any) {
    console.error(`[Reddit API] Error on ${endpoint}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Reddit API request failed');
  }
};

// ==================== ACTIONS (Triggers) ====================

app.post("/actions/check", async (req, res) => {
  try {
    const { userId, actionType, config, accessToken } = req.body as RedditActionPayload & { accessToken: string };

    if (!userId || !actionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, actionType et accessToken sont requis"
      });
    }

    let triggered = false;
    let actionData = {};

    switch (actionType) {
      case "new_post_in_subreddit": {
        // Support both old format (subreddit) and new format (watchSubreddit)
        const subreddit = config.watchSubreddit || config.subreddit;
        if (!subreddit) {
          return res.status(400).json({ success: false, error: "watchSubreddit or subreddit requis" });
        }

        const posts = await makeRedditRequest(
          `/r/${subreddit}/new.json?limit=1`,
          accessToken
        );

        if (posts.data?.children && posts.data.children.length > 0) {
          const latestPost = posts.data.children[0].data;

          // First check - initialize lastPostId without triggering
          if (!config.lastPostId) {
            console.log(`[Reddit] Initializing lastPostId for area with post ${latestPost.id}`);
            actionData = {
              lastPostId: latestPost.id
            };
          } else if (latestPost.id === config.lastPostId) {
            // Same post as before, don't trigger
            actionData = {
              lastPostId: config.lastPostId
            };
          } else {
            // New post detected!
            console.log(`[Reddit] New post detected: ${latestPost.id} (previous: ${config.lastPostId})`);
            triggered = true;
            actionData = {
              postId: latestPost.id,
              postTitle: latestPost.title,
              postAuthor: latestPost.author,
              postUrl: latestPost.url,
              postPermalink: `https://reddit.com${latestPost.permalink}`,
              postScore: latestPost.score,
              postCreated: latestPost.created_utc,
              lastPostId: latestPost.id
            };
          }
        }
        break;
      }

      case "new_comment_on_post": {
        const postId = config.postId;
        if (!postId) {
          return res.status(400).json({ success: false, error: "postId requis" });
        }

        const comments = await makeRedditRequest(
          `/comments/${postId}.json?limit=1&sort=new`,
          accessToken
        );

        if (comments[1]?.data?.children && comments[1].data.children.length > 0) {
          const latestComment = comments[1].data.children[0].data;

          // First check - initialize lastCommentId without triggering
          if (!config.lastCommentId) {
            console.log(`[Reddit] Initializing lastCommentId for post ${postId} with comment ${latestComment.id}`);
            actionData = {
              lastCommentId: latestComment.id
            };
          } else if (latestComment.id === config.lastCommentId) {
            // Same comment as before, don't trigger
            actionData = {
              lastCommentId: config.lastCommentId
            };
          } else {
            // New comment detected!
            console.log(`[Reddit] New comment detected: ${latestComment.id} (previous: ${config.lastCommentId})`);
            triggered = true;
            actionData = {
              commentId: latestComment.id,
              commentBody: latestComment.body,
              commentAuthor: latestComment.author,
              commentScore: latestComment.score,
              commentCreated: latestComment.created_utc,
              commentPermalink: `https://reddit.com${latestComment.permalink}`,
              postId: postId, // Add the post ID so reactions can use it
              lastCommentId: latestComment.id
            };
          }
        }
        break;
      }

      case "new_message": {
        const messages = await makeRedditRequest(
          `/message/inbox.json?limit=1`,
          accessToken
        );

        if (messages.data?.children && messages.data.children.length > 0) {
          const latestMessage = messages.data.children[0].data;

          // First check - initialize lastMessageId without triggering
          if (!config.lastMessageId) {
            console.log(`[Reddit] Initializing lastMessageId with message ${latestMessage.id}`);
            actionData = {
              lastMessageId: latestMessage.id
            };
          } else if (latestMessage.id === config.lastMessageId) {
            // Same message as before, don't trigger
            actionData = {
              lastMessageId: config.lastMessageId
            };
          } else {
            // New message detected!
            console.log(`[Reddit] New message detected: ${latestMessage.id} (previous: ${config.lastMessageId})`);
            triggered = true;
            actionData = {
              messageId: latestMessage.id,
              messageSubject: latestMessage.subject,
              messageBody: latestMessage.body,
              messageAuthor: latestMessage.author,
              messageCreated: latestMessage.created_utc,
              messageNew: latestMessage.new,
              lastMessageId: latestMessage.id
            };
          }
        }
        break;
      }

      case "post_score_threshold": {
        const postId = config.postId;
        const threshold = config.threshold;

        if (!postId || threshold === undefined) {
          return res.status(400).json({ success: false, error: "postId et threshold requis" });
        }

        const postData = await makeRedditRequest(
          `/api/info.json?id=t3_${postId}`,
          accessToken
        );

        if (postData.data?.children && postData.data.children.length > 0) {
          const post = postData.data.children[0].data;
          if (post.score >= threshold && !config.triggered) {
            triggered = true;
            actionData = {
              postId: post.id,
              postTitle: post.title,
              postScore: post.score,
              postUrl: post.url,
              postPermalink: `https://reddit.com${post.permalink}`,
              triggeredThreshold: true  // Mark as triggered so it doesn't trigger again
            };
          }
        }
        break;
      }

      case "new_subscriber_milestone": {
        const subreddit = config.subreddit;
        const milestone = config.milestone;

        if (!subreddit || !milestone) {
          return res.status(400).json({ success: false, error: "subreddit et milestone requis" });
        }

        const subredditData = await makeRedditRequest(
          `/r/${subreddit}/about.json`,
          accessToken
        );

        if (subredditData.data) {
          const subscribers = subredditData.data.subscribers;
          if (subscribers >= milestone && !config.triggered) {
            triggered = true;
            actionData = {
              subreddit: subredditData.data.display_name,
              subscribers: subscribers,
              milestone: milestone
            };
          }
        }
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Action type inconnu: ${actionType}`
        });
    }

    res.json({
      success: true,
      triggered,
      data: actionData
    });

  } catch (error: any) {
    console.error("Erreur Reddit Action:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la vérification de l'action Reddit",
      details: error.message
    });
  }
});

// ==================== REACTIONS ====================

app.post("/reactions/trigger", async (req, res) => {
  try {
    const { userId, reactionType, config, accessToken, actionData } = req.body as RedditReactionPayload & { actionData?: any };

    if (!userId || !reactionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, reactionType et accessToken sont requis"
      });
    }

    let result: any = {};

    switch (reactionType) {
      case "submit_post": {
        // Support both old format (subreddit) and new format (targetSubreddit)
        const subreddit = config.targetSubreddit || config.subreddit;
        const title = config.title || actionData?.title || "Nouveau post via AREA";
        const text = config.text || actionData?.text || "";
        const kind = config.kind || "self";

        if (!subreddit) {
          return res.status(400).json({ success: false, error: "targetSubreddit or subreddit requis" });
        }

        console.log(`[submit_post] Creating post in r/${subreddit}:`, { title, text, kind });

        const payload: any = {
          sr: subreddit,
          kind: kind,
          title: title,
          api_type: 'json'
        };

        if (kind === 'self') {
          payload.selftext = text;
        } else if (kind === 'link') {
          payload.url = text;
        }

        console.log(`[submit_post] Reddit API Payload:`, payload);

        const postResponse = await makeRedditRequest(
          `/api/submit`,
          accessToken,
          'POST',
          payload
        );

        console.log(`[submit_post] Reddit API Response:`, JSON.stringify(postResponse, null, 2));

        result = {
          message: "Post créé avec succès",
          postUrl: postResponse.json?.data?.url,
          postId: postResponse.json?.data?.id,
          fullResponse: postResponse
        };
        break;
      }

      case "submit_comment": {
        let thingId = config.thingId || (actionData?.postId || null);
        const text = config.text || actionData?.commentText || "Commentaire via AREA";

        // Ensure thingId has the t3_ prefix for posts (or t1_ for comments)
        if (thingId && !thingId.startsWith('t3_') && !thingId.startsWith('t1_')) {
          thingId = `t3_${thingId}`;
        }

        console.log(`[submit_comment] DEBUG - config.thingId:`, config.thingId);
        console.log(`[submit_comment] DEBUG - actionData?.postId:`, actionData?.postId);
        console.log(`[submit_comment] DEBUG - final thingId:`, thingId);
        console.log(`[submit_comment] DEBUG - text:`, text);

        if (!thingId) {
          return res.status(400).json({ success: false, error: "thingId (post ou comment ID) requis" });
        }

        const commentResponse = await makeRedditRequest(
          `/api/comment`,
          accessToken,
          'POST',
          {
            thing_id: thingId,
            text: text,
            api_type: 'json'
          }
        );

        result = {
          message: "Commentaire posté avec succès",
          commentId: commentResponse.json?.data?.things?.[0]?.data?.id
        };
        break;
      }

      case "upvote": {
        // Try to get thingId from config or build from actionData
        let thingId = config.thingId;
        if (!thingId && actionData) {
          if (actionData.postId) thingId = `t3_${actionData.postId}`;
          else if (actionData.commentId) thingId = `t1_${actionData.commentId}`;
          else if (actionData.messageId) thingId = `t4_${actionData.messageId}`;
        }

        if (!thingId) {
          return res.status(400).json({ success: false, error: "thingId requis (post, comment ou message)" });
        }

        await makeRedditRequest(
          `/api/vote`,
          accessToken,
          'POST',
          {
            id: thingId,
            dir: 1
          }
        );

        result = { message: "Upvote effectué", thingId };
        break;
      }

      case "save_post": {
        // Try to get thingId from config or build from actionData
        let thingId = config.thingId;
        if (!thingId && actionData) {
          if (actionData.postId) thingId = `t3_${actionData.postId}`;
          else if (actionData.commentId) thingId = `t1_${actionData.commentId}`;
          else if (actionData.messageId) thingId = `t4_${actionData.messageId}`;
        }

        if (!thingId) {
          return res.status(400).json({ success: false, error: "thingId requis (post, comment ou message)" });
        }

        await makeRedditRequest(
          `/api/save`,
          accessToken,
          'POST',
          { id: thingId }
        );

        result = { message: "Post sauvegardé", thingId };
        break;
      }

      case "subscribe_subreddit": {
        const subreddit = config.subreddit;

        if (!subreddit) {
          return res.status(400).json({ success: false, error: "subreddit requis" });
        }

        await makeRedditRequest(
          `/api/subscribe`,
          accessToken,
          'POST',
          {
            action: 'sub',
            sr_name: subreddit
          }
        );

        result = { message: `Abonné à r/${subreddit}`, subreddit };
        break;
      }

      case "unsubscribe_subreddit": {
        const subreddit = config.subreddit;

        if (!subreddit) {
          return res.status(400).json({ success: false, error: "subreddit requis" });
        }

        await makeRedditRequest(
          `/api/subscribe`,
          accessToken,
          'POST',
          {
            action: 'unsub',
            sr_name: subreddit
          }
        );

        result = { message: `Désabonné de r/${subreddit}`, subreddit };
        break;
      }

      case "send_message": {
        const to = config.to;
        const subject = config.subject || "Message via AREA";
        const text = config.text || actionData?.messageText || "";

        if (!to) {
          return res.status(400).json({ success: false, error: "destinataire (to) requis" });
        }

        await makeRedditRequest(
          `/api/compose`,
          accessToken,
          'POST',
          {
            to: to,
            subject: subject,
            text: text,
            api_type: 'json'
          }
        );

        result = { message: `Message envoyé à u/${to}`, to, subject };
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Reaction type inconnu: ${reactionType}`
        });
    }

    console.log(`[Reddit Reaction] ${reactionType} exécuté pour l'utilisateur ${userId}`);

    res.json({
      success: true,
      message: "Reaction Reddit exécutée avec succès",
      data: result
    });

  } catch (error: any) {
    console.error("Erreur Reddit Reaction:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'exécution de la reaction Reddit",
      details: error.message
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

    const pollInterval = interval || 30000; // Default 30 seconds
    const pollKey = `${userId}-${areaId}`;

    // Stop existing poll if any
    if (activePolls.has(pollKey)) {
      clearInterval(activePolls.get(pollKey)!.interval);
    }

    // Start new polling
    const intervalId = setInterval(async () => {
      try {
        console.log(`[Reddit Polling] Checking ${actionType} for area ${areaId}`);

        const job = activePolls.get(pollKey);
        const checkResponse = await axios.post('http://localhost:' + PORT + '/actions/check', {
          userId,
          actionType,
          config: job?.config || config,
          accessToken
        });

        // Debug: log the response
        console.log(`[Reddit Polling] Check response for area ${areaId}:`, JSON.stringify(checkResponse.data));

        // Always update config first (for tracking purposes like lastPostId, lastCommentId, lastMessageId, triggeredThreshold)
        if (checkResponse.data.data && Object.keys(checkResponse.data.data).length > 0) {
          const job = activePolls.get(pollKey);
          if (job) {
            if (checkResponse.data.data.lastPostId !== undefined) {
              job.config.lastPostId = checkResponse.data.data.lastPostId;
              console.log(`[Reddit Polling] Updated lastPostId for area ${areaId}: ${checkResponse.data.data.lastPostId}`);
            }
            if (checkResponse.data.data.lastCommentId !== undefined) {
              job.config.lastCommentId = checkResponse.data.data.lastCommentId;
              console.log(`[Reddit Polling] Updated lastCommentId for area ${areaId}: ${checkResponse.data.data.lastCommentId}`);
            }
            if (checkResponse.data.data.lastMessageId !== undefined) {
              job.config.lastMessageId = checkResponse.data.data.lastMessageId;
              console.log(`[Reddit Polling] Updated lastMessageId for area ${areaId}: ${checkResponse.data.data.lastMessageId}`);
            }
            if (checkResponse.data.data.triggeredThreshold !== undefined) {
              job.config.triggered = checkResponse.data.data.triggeredThreshold;
              console.log(`[Reddit Polling] Updated triggered flag for area ${areaId}: ${checkResponse.data.data.triggeredThreshold}`);
            }
          }
        } else {
          console.log(`[Reddit Polling] No data to update for area ${areaId}`);
        }

        if (checkResponse.data.triggered) {
          console.log(`[Reddit Polling] Action triggered for area ${areaId}`, checkResponse.data.data);

          // Notify the main backend
          const BACKEND_URL = process.env.BACKEND_URL || 'http://area_server:8080';
          await axios.post(`${BACKEND_URL}/api/areas/triggers/execute`, {
            userId,
            areaId,
            data: checkResponse.data.data,
            updatedConfig: activePolls.get(pollKey)?.config
          });
        }
      } catch (error: any) {
        console.error(`[Reddit Polling] Error for area ${areaId}:`, error.message);
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

    console.log(`[Reddit Polling] Started polling for area ${areaId} every ${pollInterval}ms`);

    return res.json({
      success: true,
      message: `Polling started for area ${areaId}`,
      interval: pollInterval
    });

  } catch (error: any) {
    console.error(`[Reddit Polling] Error starting poll:`, error.message);
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

      console.log(`[Reddit Polling] Stopped polling for area ${areaId}`);

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
    console.error(`[Reddit Polling] Error stopping poll:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "reddit",
    activePolls: activePolls.size
  });
});

// ==================== SERVER ====================

app.listen(PORT, () => {
  console.log(`Reddit service en ligne sur le port ${PORT}`);
});

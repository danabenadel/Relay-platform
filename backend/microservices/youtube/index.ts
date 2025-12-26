import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { YouTubeServiceAdapter } from './youtube-adapter';
import { getActions } from './actions';
import { getReactions } from './reactions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5008;
const BACKEND_URL = process.env.BACKEND_URL || 'http://area_server:8080';

const MIN_INTERVAL_SECONDS = 60;
const MAX_INTERVAL_SECONDS = 21600;
const DEFAULT_INTERVAL_SECONDS = Math.min(
  Math.max(Number(process.env.YOUTUBE_DEFAULT_INTERVAL ?? 60), MIN_INTERVAL_SECONDS),
  MAX_INTERVAL_SECONDS
);

app.use(express.json());

interface PollingJob {
  userId: string;
  areaId: string;
  accessToken: string;
  refreshToken?: string;
  config: any;
  actionType: string;
  lastItemId?: string;
  interval: NodeJS.Timeout;
}

const pollingJobs = new Map<string, PollingJob>();

async function createTokenRefreshCallback(userId: string, areaId: string) {
  return async (newToken: string, expiresAt: Date) => {
    try {
      console.log(`[YouTube] Token refreshed for user ${userId}, area ${areaId}`);
      await axios.post(`${BACKEND_URL}/api/oauth/update-token`, {
        userId,
        serviceName: 'google',
        accessToken: newToken,
        expiresAt: expiresAt.toISOString(),
      });

      const jobKey = `${userId}-${areaId}`;
      const job = pollingJobs.get(jobKey);
      if (job) {
        job.accessToken = newToken;
      }
    } catch (error: any) {
      console.error('[YouTube] Error updating refreshed token:', error.message);
    }
  };
}

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'youtube',
    timestamp: new Date().toISOString(),
    activePollingJobs: pollingJobs.size,
  });
});

app.post('/videos/list', async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, channelId, query, maxResults, order, publishedAfter } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const adapter = new YouTubeServiceAdapter({
      accessToken,
      refreshToken,
    });

    const videos = await adapter.listVideos({
      channelId,
      query,
      maxResults: maxResults || 10,
      order: order || 'date',
      publishedAfter,
    });

    return res.json({ success: true, videos });
  } catch (error: any) {
    console.error('[YouTube] Error listing videos:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/videos/get/:videoId', async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken } = req.body;
    const { videoId } = req.params;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const adapter = new YouTubeServiceAdapter({
      accessToken,
      refreshToken,
    });

    const video = await adapter.getVideo(videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    return res.json({ success: true, video });
  } catch (error: any) {
    console.error('[YouTube] Error getting video:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/comments/list', async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, videoId, maxResults, order } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const adapter = new YouTubeServiceAdapter({
      accessToken,
      refreshToken,
    });

    const comments = await adapter.getComments({
      videoId,
      maxResults: maxResults || 20,
      order: order || 'time',
    });

    return res.json({ success: true, comments });
  } catch (error: any) {
    console.error('[YouTube] Error getting comments:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/playlists/list', async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, channelId, mine, maxResults } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const adapter = new YouTubeServiceAdapter({
      accessToken,
      refreshToken,
    });

    const playlists = await adapter.getPlaylists({
      channelId,
      mine: mine !== undefined ? mine : true,
      maxResults: maxResults || 25,
    });

    return res.json({ success: true, playlists });
  } catch (error: any) {
    console.error('[YouTube] Error getting playlists:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/subscriptions/list', async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, maxResults, order } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const adapter = new YouTubeServiceAdapter({
      accessToken,
      refreshToken,
    });

    const subscriptions = await adapter.getSubscriptions({
      maxResults: maxResults || 25,
      order: order || 'relevance',
    });

    return res.json({ success: true, subscriptions });
  } catch (error: any) {
    console.error('[YouTube] Error getting subscriptions:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/test/trigger-reaction', async (req: Request, res: Response) => {
  try {
    const { userId, areaId } = req.body;

    if (!userId || !areaId) {
      return res.status(400).json({ error: 'userId and areaId are required' });
    }

    const mockActionData = {
      subscriptionId: 'test-sub-123',
      channelId: 'UCtest123',
      channelTitle: 'Test Channel',
      description: 'Test channel description',
      publishedAt: new Date().toISOString(),
      thumbnails: { default: 'https://example.com/thumb.jpg' },
      channelUrl: 'https://youtube.com/channel/UCtest123'
    };

    await axios.post(`${BACKEND_URL}/api/areas/triggers/execute`, {
      userId,
      areaId,
      actionType: 'youtube_new_subscriber',
      data: mockActionData,
    });

    return res.json({ success: true, message: 'Test trigger sent', data: mockActionData });
  } catch (error: any) {
    console.error('[YouTube] Error in test trigger:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/reactions/trigger', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      reactionType,
      config,
      accessToken,
      refreshToken,
      actionData,
    } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    if (!reactionType) {
      return res.status(400).json({ error: 'Reaction type is required' });
    }

    const adapter = new YouTubeServiceAdapter({
      accessToken,
      refreshToken,
      onTokenRefresh: await createTokenRefreshCallback(userId, 'reaction'),
    });

    const reactions = getReactions(adapter);
    const reaction = reactions[reactionType as keyof typeof reactions];

    if (!reaction) {
      return res.status(400).json({ error: `Unknown reaction type: ${reactionType}` });
    }

    const result = await reaction.execute(config, actionData);

    return res.json(result);
  } catch (error: any) {
    console.error('[YouTube] Error executing reaction:', error.message);
    return res.status(500).json({ error: error.message, success: false });
  }
});

app.post('/polling/start', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      areaId,
      accessToken,
      refreshToken,
      config,
      actionType,
    } = req.body;

    if (!userId || !areaId || !accessToken || !actionType) {
      return res.status(400).json({
        error: 'userId, areaId, accessToken, and actionType are required',
      });
    }

    const jobKey = `${userId}-${areaId}`;

    if (pollingJobs.has(jobKey)) {
      const existingJob = pollingJobs.get(jobKey)!;
      clearInterval(existingJob.interval);
      pollingJobs.delete(jobKey);
      console.log(`[YouTube] Stopped existing polling job: ${jobKey}`);
    }

    const adapter = new YouTubeServiceAdapter({
      accessToken,
      refreshToken,
      onTokenRefresh: await createTokenRefreshCallback(userId, areaId),
    });

    const actions = getActions(adapter);
    const action = actions[actionType as keyof typeof actions];

    if (!action) {
      return res.status(400).json({ error: `Unknown action type: ${actionType}` });
    }

    const intervalSecondsRaw =
      typeof config.checkInterval === 'number'
        ? config.checkInterval
        : DEFAULT_INTERVAL_SECONDS;

    const intervalSeconds = Math.min(
      Math.max(intervalSecondsRaw, MIN_INTERVAL_SECONDS),
      MAX_INTERVAL_SECONDS
    );

    const checkInterval = intervalSeconds * 1000;

    let lastItemId: string | undefined;

    const normalizedConfig = {
      ...(config || {}),
      checkInterval: intervalSeconds,
    };

    const pollingFunction = async () => {
      try {
        console.log(`[YouTube] Polling ${actionType} for user ${userId}, area ${areaId}`);

        const checkResult = await action.check(normalizedConfig, lastItemId);
        const results = Array.isArray(checkResult)
          ? checkResult
          : (checkResult?.items ?? []);
        const cursor = Array.isArray(checkResult)
          ? undefined
          : checkResult?.cursor;

        if (cursor) {
          lastItemId = cursor;
          const job = pollingJobs.get(jobKey);
          if (job) {
            job.lastItemId = cursor;
          }
        }

        if (results.length > 0) {
          console.log(`[YouTube] Found ${results.length} new item(s) for ${actionType}`);

          const job = pollingJobs.get(jobKey);
          if (job) {
            job.lastItemId = lastItemId;
          }

          for (const result of results) {
            try {
              await axios.post(`${BACKEND_URL}/api/areas/triggers/execute`, {
                userId,
                areaId,
                actionType,
                data: result,
              });
              console.log(`[YouTube] Triggered backend for ${actionType}`);
            } catch (error: any) {
              console.error('[YouTube] Error triggering backend:', error.message);
            }
          }
        }
      } catch (error: any) {
        console.error(`[YouTube] Error in polling function for ${actionType}:`, error.message);
      }
    };

    try {
      await pollingFunction();
    } catch (error: any) {
      console.error(`[YouTube] Initial polling error for ${actionType}:`, error.message);
    }

    const interval = setInterval(pollingFunction, checkInterval);

    pollingJobs.set(jobKey, {
      userId,
      areaId,
      accessToken,
      refreshToken,
      config: normalizedConfig,
      actionType,
      lastItemId,
      interval,
    });

    console.log(`[YouTube] Started polling job: ${jobKey} (interval: ${intervalSeconds}s)`);

    return res.json({
      success: true,
      message: 'Polling started',
      jobKey,
      checkInterval: intervalSeconds,
    });
  } catch (error: any) {
    console.error('[YouTube] Error starting polling:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/polling/stop', async (req: Request, res: Response) => {
  try {
    const { userId, areaId } = req.body;

    if (!userId || !areaId) {
      return res.status(400).json({ error: 'userId and areaId are required' });
    }

    const jobKey = `${userId}-${areaId}`;

    if (!pollingJobs.has(jobKey)) {
      return res.status(404).json({ error: 'Polling job not found' });
    }

    const job = pollingJobs.get(jobKey)!;
    clearInterval(job.interval);
    pollingJobs.delete(jobKey);

    console.log(`[YouTube] Stopped polling job: ${jobKey}`);

    return res.json({ success: true, message: 'Polling stopped' });
  } catch (error: any) {
    console.error('[YouTube] Error stopping polling:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/polling/status', (req: Request, res: Response) => {
  const jobs = Array.from(pollingJobs.entries()).map(([key, job]) => ({
    jobKey: key,
    userId: job.userId,
    areaId: job.areaId,
    actionType: job.actionType,
    lastItemId: job.lastItemId,
    config: job.config,
  }));

  res.json({
    success: true,
    activeJobs: jobs.length,
    jobs,
  });
});

process.on('SIGTERM', () => {
  console.log('[YouTube] SIGTERM received, cleaning up polling jobs...');
  pollingJobs.forEach((job, key) => {
    clearInterval(job.interval);
    console.log(`[YouTube] Cleared polling job: ${key}`);
  });
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[YouTube] SIGINT received, cleaning up polling jobs...');
  pollingJobs.forEach((job, key) => {
    clearInterval(job.interval);
    console.log(`[YouTube] Cleared polling job: ${key}`);
  });
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`[YouTube] Service running on port ${PORT}`);
  console.log(`[YouTube] Backend URL: ${BACKEND_URL}`);
});

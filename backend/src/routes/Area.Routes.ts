import { Router } from "express";
import axios from "axios";
import { authenticateToken } from "../middleware/auth";
import prisma from "../config/database";
import { SpotifyTokenService } from "../services/spotify.token.service";
import { EncryptionUtil } from "../utils/encryption";
import { RedditTokenService } from "../services/reddit.token.service";
import { DiscordTokenService } from "../services/discord.token.service";
import { GitHubTokenService } from "../services/github.token.service";
import { GitLabTokenService } from "../services/gitlab.token.service";
import { OneDriveTokenService } from "../services/onedrive.token.service";
import { TelegramTokenService } from "../services/telegram.token.service";
import { NotionTokenService } from "../services/notion.token.service";

const router = Router();
const spotifyTokenService = new SpotifyTokenService();
const redditTokenService = new RedditTokenService();
const discordTokenService = new DiscordTokenService();
const githubTokenService = new GitHubTokenService();
const gitlabTokenService = new GitLabTokenService();
const onedriveTokenService = new OneDriveTokenService();
const telegramTokenService = new TelegramTokenService();
const notionTokenService = new NotionTokenService();

const TIMER_SERVICE_URL = process.env.TIMER_SERVICE_URL || "http://area_timer_service:5001";
const CONSOLE_SERVICE_URL = process.env.CONSOLE_SERVICE_URL || "http://area_console_service:5002";
const DISCORD_SERVICE_URL = process.env.DISCORD_SERVICE_URL || "http://area_discord_service:5003";
const SPOTIFY_SERVICE_URL = process.env.SPOTIFY_SERVICE_URL || "http://area_spotify_service:5004";
const GOOGLE_SERVICE_URL = process.env.GOOGLE_SERVICE_URL || "http://area_google_service:5002";
const REDDIT_SERVICE_URL = process.env.REDDIT_SERVICE_URL || "http://localhost:5005";
const GITHUB_SERVICE_URL = process.env.GITHUB_SERVICE_URL || "http://area_github_service:5006";
const GITLAB_SERVICE_URL = process.env.GITLAB_SERVICE_URL || "http://area_gitlab_service:5013";
const ONEDRIVE_SERVICE_URL = process.env.ONEDRIVE_SERVICE_URL || "http://area_onedrive_service:5010";
const OPENAI_SERVICE_URL = process.env.OPENAI_SERVICE_URL || "http://area_openai_service:5007";
const YOUTUBE_SERVICE_URL = process.env.YOUTUBE_SERVICE_URL || "http://area_youtube_service:5008";
const TELEGRAM_SERVICE_URL = process.env.TELEGRAM_SERVICE_URL || "http://area_telegram_service:5009";
const NOTION_SERVICE_URL = process.env.NOTION_SERVICE_URL || "http://area_notion_service:5014";

const SPOTIFY_ID_KEYS = new Set([
  "playlist_id",
  "playlistid",
  "playlist_uri",
  "playlisturi",
  "track_id",
  "trackid",
  "track_uri",
  "trackuri"
]);

const DISCORD_ID_KEYS = new Set(["channelid", "messageid", "guildid"]);

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const isPlainObject = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const ensureTrimmedString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseSpotifyId = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    const last = parts[parts.length - 1];
    if (/^[A-Za-z0-9]{22}$/.test(last)) {
      return last;
    }
  }

  const clean = trimmed.split("?")[0];
  const match = clean.match(/[A-Za-z0-9]{22}/);
  if (match) {
    return match[0];
  }

  return trimmed;
};

const resolveInterval = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
};

const GOOGLE_POLLING_ACTIONS = new Set([
  "google_new_email_received",
  "google_email_from_sender",
  "google_email_with_attachment",
  "google_new_drive_file"
]);

const asyncStopAreaServices = async (area: any, userId: string) => {
  const areaId = area.id.toString();
  const serviceName = area.action.service.name;
  const actionName = area.action.name;

  if (serviceName === "timer") {
    await axios.post(`${TIMER_SERVICE_URL}/stop`, {
      userId,
      areaId
    });
  }

  if (serviceName === "google" && GOOGLE_POLLING_ACTIONS.has(actionName)) {
    await axios.post(`${GOOGLE_SERVICE_URL}/polling/stop`, {
      userId,
      areaId
    });
  }

  if (serviceName === "spotify") {
    await axios.post(`${SPOTIFY_SERVICE_URL}/actions/stop`, {
      userId,
      areaId
    });
  }

  if (serviceName === "discord") {
    await axios.post(`${DISCORD_SERVICE_URL}/actions/stop`, {
      userId,
      areaId
    });
  }

  if (serviceName === "telegram") {
    await axios.post(`${TELEGRAM_SERVICE_URL}/actions/stop`, {
      userId,
      areaId
    });
  }

  if (serviceName === "github") {
    await axios.post(`${GITHUB_SERVICE_URL}/actions/stop`, {
      userId,
      areaId
    });
  }

  if (serviceName === "gitlab") {
    await axios.post(`${GITLAB_SERVICE_URL}/actions/stop`, {
      userId,
      areaId
    });
  }

  if (serviceName === "onedrive") {
    await axios.post(`${ONEDRIVE_SERVICE_URL}/stop`, {
      userId,
      areaId
    });
  }

  if (serviceName === "notion") {
    await axios.post(`${NOTION_SERVICE_URL}/actions/stop`, {
      userId,
      areaId
    });
  }

  if (serviceName === "youtube") {
    await axios.post(`${YOUTUBE_SERVICE_URL}/polling/stop`, {
      userId,
      areaId
    });
  }

  if (serviceName === "reddit") {
    await axios.post(`${REDDIT_SERVICE_URL}/actions/stop`, {
      userId,
      areaId
    });
  }
};

const asyncStartAreaServices = async (
  area: any,
  userId: string,
  normalizedConfig: Record<string, any>
) => {
  const areaId = area.id.toString();
  const serviceName = area.action.service.name;
  const actionName = area.action.name;

  if (serviceName === "timer") {
    await axios.post(`${TIMER_SERVICE_URL}/start`, {
      userId,
      areaId,
      interval: normalizedConfig.checkInterval || 60,
      type: normalizedConfig.timerType || "time",
      config: {
        targetDate: normalizedConfig.targetDate,
        targetTime: normalizedConfig.targetTime,
        daysUntil: normalizedConfig.daysUntil,
        targetDay: normalizedConfig.targetDay
      }
    });
    return;
  }

  if (serviceName === "google" && GOOGLE_POLLING_ACTIONS.has(actionName)) {
    const googleToken = await prisma.oAuthToken.findFirst({
      where: {
        userId,
        serviceName: "google"
      }
    });

    if (!googleToken) {
      throw new HttpError(400, "Google account not connected");
    }

    const decryptedAccessToken = EncryptionUtil.decrypt(googleToken.accessToken);
    const decryptedRefreshToken = googleToken.refreshToken
      ? EncryptionUtil.decrypt(googleToken.refreshToken)
      : undefined;

    await axios.post(`${GOOGLE_SERVICE_URL}/polling/start`, {
      userId,
      areaId,
      accessToken: decryptedAccessToken,
      refreshToken: decryptedRefreshToken,
      actionType: actionName,
      config: normalizedConfig || {}
    });
    return;
  }

  if (serviceName === "spotify") {
    const spotifyToken = await spotifyTokenService.getValidAccessToken(userId);

    if (!spotifyToken) {
      throw new HttpError(400, "Spotify account not connected");
    }

    const spotifyInterval = resolveInterval(
      normalizedConfig.checkInterval,
      30
    );

    await axios.post(`${SPOTIFY_SERVICE_URL}/actions/start`, {
      userId,
      areaId,
      actionType: actionName,
      interval: spotifyInterval,
      config: normalizedConfig,
      accessToken: spotifyToken
    });
    return;
  }

  if (serviceName === "discord") {
    const discordToken = await discordTokenService.getValidAccessToken(userId);

    if (!discordToken) {
      throw new HttpError(400, "Discord account not connected");
    }

    await axios.post(`${DISCORD_SERVICE_URL}/actions/start`, {
      userId,
      areaId,
      actionType: actionName,
      interval: normalizedConfig.checkInterval || 30,
      config: normalizedConfig,
      accessToken: discordToken
    });
    return;
  }

  if (serviceName === "telegram") {
    const botToken = await telegramTokenService.getBotToken(userId);

    if (!botToken) {
      throw new HttpError(400, "Telegram bot not configured");
    }

    const telegramInterval = resolveInterval(
      normalizedConfig.checkInterval,
      20
    );

    await axios.post(`${TELEGRAM_SERVICE_URL}/actions/start`, {
      userId,
      areaId,
      actionType: actionName,
      interval: telegramInterval,
      config: normalizedConfig,
      accessToken: botToken
    });
    return;
  }

  if (serviceName === "github") {
    const githubToken = await githubTokenService.getValidAccessToken(userId);

    if (!githubToken) {
      throw new HttpError(400, "GitHub account not connected");
    }

    const githubInterval = resolveInterval(
      normalizedConfig.checkInterval,
      60
    );

    await axios.post(`${GITHUB_SERVICE_URL}/actions/start`, {
      userId,
      areaId,
      actionType: actionName,
      interval: githubInterval,
      config: normalizedConfig,
      accessToken: githubToken
    });
    return;
  }

  if (serviceName === "gitlab") {
    const gitlabToken = await gitlabTokenService.getValidAccessToken(userId);

    if (!gitlabToken) {
      throw new HttpError(400, "GitLab account not connected");
    }

    const gitlabInterval = resolveInterval(
      normalizedConfig.checkInterval,
      60
    );

    await axios.post(`${GITLAB_SERVICE_URL}/actions/start`, {
      userId,
      areaId,
      actionType: actionName,
      interval: gitlabInterval,
      config: normalizedConfig,
      accessToken: gitlabToken
    });
    return;
  }

  if (serviceName === "onedrive") {
    const onedriveToken = await onedriveTokenService.getValidAccessToken(userId);

    if (!onedriveToken) {
      throw new HttpError(400, "OneDrive account not connected. Please connect your OneDrive account first.");
    }

    await axios.post(`${ONEDRIVE_SERVICE_URL}/start`, {
      userId,
      areaId,
      actionType: actionName,
      config: normalizedConfig,
      accessToken: onedriveToken
    });
    return;
  }

  if (serviceName === "notion") {
    const notionAccessToken = await notionTokenService.getValidAccessToken(userId);

    if (!notionAccessToken) {
      throw new HttpError(400, "Notion account not connected. Please connect your Notion account first.");
    }

    const notionInterval = resolveInterval(
      normalizedConfig.checkInterval,
      60
    );

    await axios.post(`${NOTION_SERVICE_URL}/actions/start`, {
      userId,
      areaId,
      actionType: actionName,
      interval: notionInterval,
      config: normalizedConfig || {},
      accessToken: notionAccessToken
    });
    return;
  }

  if (serviceName === "youtube") {
    const googleToken = await prisma.oAuthToken.findFirst({
      where: {
        userId,
        serviceName: "google"
      }
    });

    if (!googleToken) {
      throw new HttpError(400, "Google account not connected for YouTube access");
    }

    const decryptedAccessToken = EncryptionUtil.decrypt(googleToken.accessToken);
    const decryptedRefreshToken = googleToken.refreshToken
      ? EncryptionUtil.decrypt(googleToken.refreshToken)
      : undefined;

    await axios.post(`${YOUTUBE_SERVICE_URL}/polling/start`, {
      userId,
      areaId,
      accessToken: decryptedAccessToken,
      refreshToken: decryptedRefreshToken,
      actionType: actionName,
      config: normalizedConfig || {}
    });
    return;
  }

  if (serviceName === "reddit") {
    const redditToken = await redditTokenService.getValidAccessToken(userId);

    if (!redditToken) {
      throw new HttpError(400, "Reddit account not connected");
    }

    const redditIntervalSeconds = resolveInterval(
      normalizedConfig.checkInterval,
      30
    );

    await axios.post(`${REDDIT_SERVICE_URL}/actions/start`, {
      userId,
      areaId,
      actionType: actionName,
      interval: redditIntervalSeconds * 1000,
      config: normalizedConfig,
      accessToken: redditToken
    });
    return;
  }
};

const normalizeConfig = (
  actionServiceName?: string,
  reactionServiceName?: string,
  originalConfig?: any
): Record<string, any> => {
  if (!isPlainObject(originalConfig)) {
    if (originalConfig && typeof originalConfig === "object") {
      return { ...(originalConfig as Record<string, any>) };
    }
    return {};
  }

  const normalized: Record<string, any> = { ...originalConfig };
  const actionService = (actionServiceName || "").toLowerCase();
  const reactionService = (reactionServiceName || "").toLowerCase();
  const isSpotify = actionService === "spotify" || reactionService === "spotify";
  const isDiscord = actionService === "discord" || reactionService === "discord";

  if (isSpotify) {
    Object.keys(normalized).forEach((key) => {
      const lowerKey = key.toLowerCase();
      const trimmedValue = ensureTrimmedString(normalized[key]);

      if (trimmedValue === undefined) {
        normalized[key] = trimmedValue;
        return;
      }

      if (SPOTIFY_ID_KEYS.has(lowerKey)) {
        const id = parseSpotifyId(trimmedValue);
        normalized[key] = id;

        if (lowerKey.includes("track")) {
          normalized.trackId = id;
          normalized.track_id = id;
          const trackUri = `spotify:track:${id}`;
          normalized.trackUri = trackUri;
          normalized.track_uri = trackUri;
        }

        if (lowerKey.includes("playlist")) {
          normalized.playlistId = id;
          normalized.playlist_id = id;
          const playlistUri = `spotify:playlist:${id}`;
          normalized.playlistUri = playlistUri;
          normalized.playlist_uri = playlistUri;
        }

        return;
      }

      if (lowerKey.endsWith("uri") && (lowerKey.includes("track") || lowerKey.includes("playlist"))) {
        const id = parseSpotifyId(trimmedValue);
        const type = lowerKey.includes("playlist") ? "playlist" : "track";
        const uri = `spotify:${type}:${id}`;
        normalized[key] = uri;

        if (type === "track") {
          normalized.trackId = id;
          normalized.track_id = id;
          normalized.trackUri = uri;
          normalized.track_uri = uri;
        } else {
          normalized.playlistId = id;
          normalized.playlist_id = id;
          normalized.playlistUri = uri;
          normalized.playlist_uri = uri;
        }
      }
    });
  }

  if (isDiscord) {
    Object.keys(normalized).forEach((key) => {
      const lowerKey = key.toLowerCase();
      if (DISCORD_ID_KEYS.has(lowerKey)) {
        const value = ensureTrimmedString(normalized[key]);
        if (value !== undefined) {
          normalized[key] = value;
        }
      }
    });
  }

  return normalized;
};

router.get("/services", authenticateToken, async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        actions: true,
        reactions: true
      }
    });

    const ACTION_PARAM_OVERRIDES: Record<string, any[]> = {
      google_new_email_received: [
        {
          name: "label",
          description: "Gmail label to monitor (leave empty for inbox)",
          type: "string",
          required: false,
        },
      ],
      google_email_from_sender: [
        {
          name: "sender_email",
          description: "Sender email address to monitor",
          type: "string",
          required: true,
        },
        {
          name: "label",
          description: "Gmail label to filter (optional)",
          type: "string",
          required: false,
        },
      ],
      google_email_with_attachment: [
        {
          name: "label",
          description: "Gmail label to filter (optional)",
          type: "string",
          required: false,
        },
        {
          name: "min_attachment_size",
          description: "Minimum attachment size in KB (optional)",
          type: "number",
          required: false,
        },
      ],
      google_new_drive_file: [
        {
          name: "folder_id",
          description: "Google Drive folder ID (leave empty for entire Drive)",
          type: "string",
          required: false,
        },
        {
          name: "mime_type",
          description: "Filter by MIME type (example: application/pdf)",
          type: "string",
          required: false,
        },
      ],
      timer_time: [
        {
          name: "target_time",
          description: "Trigger time in HH:MM format",
          type: "string",
          required: true,
        },
      ],
      timer_date: [
        {
          name: "target_date",
          description: "Trigger date in DD/MM format",
          type: "string",
          required: true,
        },
      ],
    };

    const REACTION_PARAM_OVERRIDES: Record<string, any[]> = {
      google_send_email: [
        {
          name: "recipient",
          description: "Recipient email address",
          type: "string",
          required: true,
        },
        {
          name: "subject",
          description: "Email subject",
          type: "string",
          required: true,
        },
        {
          name: "body",
          description: "Email body",
          type: "string",
          required: true,
        },
      ],
      google_reply_to_email: [
        {
          name: "thread_id",
          description: "Gmail thread ID to reply to",
          type: "string",
          required: true,
        },
        {
          name: "message",
          description: "Reply message",
          type: "string",
          required: true,
        },
      ],
      google_save_attachment_to_drive: [
        {
          name: "thread_id",
          description: "Gmail thread ID containing the attachment",
          type: "string",
          required: true,
        },
        {
          name: "folder_id",
          description: "Drive folder ID where the attachment will be saved (optional)",
          type: "string",
          required: false,
        },
        {
          name: "file_name",
          description: "Rename the saved file (optional)",
          type: "string",
          required: false,
        },
      ],
    };

    const enrichedServices = services.map((service) => ({
      ...service,
      actions: service.actions.map((action) => ({
        ...action,
        params:
          ACTION_PARAM_OVERRIDES[action.name] ?? (Array.isArray(action.params) ? action.params : []),
      })),
      reactions: service.reactions.map((reaction) => ({
        ...reaction,
        params:
          REACTION_PARAM_OVERRIDES[reaction.name] ?? (Array.isArray(reaction.params) ? reaction.params : []),
      })),
    }));

    res.json({
      success: true,
      data: enrichedServices,
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { actionId, reactionId, config } = req.body;

    console.log('[Create AREA] Request body:', JSON.stringify(req.body, null, 2));
    console.log('[Create AREA] userId:', userId);
    console.log('[Create AREA] actionId:', actionId, 'type:', typeof actionId);
    console.log('[Create AREA] reactionId:', reactionId, 'type:', typeof reactionId);

    if (!userId || !actionId || !reactionId) {
      console.error('[Create AREA] Missing fields - userId:', userId, 'actionId:', actionId, 'reactionId:', reactionId);
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        details: {
          userId: !!userId,
          actionId: !!actionId,
          reactionId: !!reactionId
        }
      });
    }

    console.log('[Create AREA] userId:', userId, 'type:', typeof userId);
    console.log('[Create AREA] actionId:', actionId, 'reactionId:', reactionId);

    const actionData = await prisma.action.findUnique({
      where: { id: parseInt(actionId) },
      include: { service: true }
    });

    const reactionData = await prisma.reaction.findUnique({
      where: { id: parseInt(reactionId) },
      include: { service: true }
    });

    if (!actionData || !reactionData) {
      return res.status(404).json({
        success: false,
        error: "Action or Reaction not found"
      });
    }

    const normalizedConfig = normalizeConfig(
      actionData.service.name,
      reactionData.service.name,
      config
    );

    const area = await prisma.area.create({
      data: {
        userId: String(userId),
        actionId: parseInt(actionId),
        reactionId: parseInt(reactionId),
        config: normalizedConfig,
        isActive: true
      }
    });

    if (actionData.service.name === 'timer') {
      try {
        await axios.post(`${TIMER_SERVICE_URL}/start`, {
          userId: String(userId),
          areaId: area.id.toString(),
          interval: normalizedConfig.checkInterval || 60,
          type: normalizedConfig.timerType || 'time',
          config: {
            targetDate: normalizedConfig.targetDate,
            targetTime: normalizedConfig.targetTime,
            daysUntil: normalizedConfig.daysUntil,
            targetDay: normalizedConfig.targetDay
          }
        });

        console.log(`Timer started for AREA ${area.id}`);
      } catch (error) {
        console.error('Error starting timer:', error);
      }
    }

    if (actionData.service.name === 'google' &&
        (actionData.name === 'google_new_email_received' ||
         actionData.name === 'google_email_from_sender' ||
         actionData.name === 'google_email_with_attachment' ||
         actionData.name === 'google_new_drive_file')) {
      try {
        const googleToken = await prisma.oAuthToken.findFirst({
          where: {
            userId: String(userId),
            serviceName: 'google'
          }
        });

        if (googleToken) {
          const decryptedAccessToken = EncryptionUtil.decrypt(googleToken.accessToken);
          const decryptedRefreshToken = googleToken.refreshToken
            ? EncryptionUtil.decrypt(googleToken.refreshToken)
            : undefined;

          await axios.post(`${GOOGLE_SERVICE_URL}/polling/start`, {
            userId: String(userId),
            areaId: area.id.toString(),
            accessToken: decryptedAccessToken,
            refreshToken: decryptedRefreshToken,
            actionType: actionData.name,
            config: normalizedConfig || {}
          });

          console.log(`Google polling started for AREA ${area.id} (action: ${actionData.name})`);
        } else {
          console.warn(`No Google token found for user ${userId}, polling not started`);
        }
      } catch (error) {
        console.error('Error starting Google polling:', error);
      }
    }

    if (actionData.service.name === 'spotify') {
      try {
        const spotifyToken = await spotifyTokenService.getValidAccessToken(String(userId));

        if (!spotifyToken) {
          console.error('No Spotify token found for user');
          return res.status(400).json({
            success: false,
            error: "Spotify account not connected"
          });
        }

        const spotifyInterval = resolveInterval(
          normalizedConfig.checkInterval ?? config?.checkInterval,
          30
        );

        await axios.post(`${SPOTIFY_SERVICE_URL}/actions/start`, {
          userId: String(userId),
          areaId: area.id.toString(),
          actionType: actionData.name,
          interval: spotifyInterval,
          config: normalizedConfig,
          accessToken: spotifyToken
        });

        console.log(`Spotify action started for AREA ${area.id}, type: ${actionData.name}`);
      } catch (error: any) {
        console.error('Error starting Spotify action:', error.response?.data || error.message);
      }
    }

    if (actionData.service.name === 'discord') {
      try {
        const discordToken = await discordTokenService.getValidAccessToken(String(userId));

        if (!discordToken) {
          console.error('No Discord token found for user');
          return res.status(400).json({
            success: false,
            error: "Discord account not connected"
          });
        }

        await axios.post(`${DISCORD_SERVICE_URL}/actions/start`, {
          userId: String(userId),
          areaId: area.id.toString(),
          actionType: actionData.name,
          interval: normalizedConfig.checkInterval || 30,
          config: normalizedConfig,
          accessToken: discordToken
        });

        console.log(`Discord action started for AREA ${area.id}, type: ${actionData.name}`);
      } catch (error: any) {
        console.error('Error starting Discord action:', error.response?.data || error.message);
      }
    }

    if (actionData.service.name === 'telegram') {
      try {
        const botToken = await telegramTokenService.getBotToken(String(userId));

        if (!botToken) {
          console.error('No Telegram bot token found for user');
          return res.status(400).json({
            success: false,
            error: "Telegram bot not configured"
          });
        }

        const telegramInterval = resolveInterval(
          normalizedConfig.checkInterval ?? config?.checkInterval,
          20
        );

        await axios.post(`${TELEGRAM_SERVICE_URL}/actions/start`, {
          userId: String(userId),
          areaId: area.id.toString(),
          actionType: actionData.name,
          interval: telegramInterval,
          config: normalizedConfig,
          accessToken: botToken
        });

        console.log(`Telegram action started for AREA ${area.id}, type: ${actionData.name}`);
      } catch (error: any) {
        console.error('Error starting Telegram action:', error.response?.data || error.message);
      }
    }

    if (actionData.service.name === 'github') {
      try {
        const githubToken = await githubTokenService.getValidAccessToken(String(userId));

        if (!githubToken) {
          console.error('No GitHub token found for user');
          return res.status(400).json({
            success: false,
            error: "GitHub account not connected"
          });
        }

        const githubInterval = resolveInterval(
          normalizedConfig.checkInterval ?? config?.checkInterval,
          60
        );

        await axios.post(`${GITHUB_SERVICE_URL}/actions/start`, {
          userId: String(userId),
          areaId: area.id.toString(),
          actionType: actionData.name,
          interval: githubInterval,
          config: normalizedConfig,
          accessToken: githubToken
        });

        console.log(`GitHub action started for AREA ${area.id}, type: ${actionData.name}`);
      } catch (error: any) {
        console.error('Error starting GitHub action:', error.response?.data || error.message);
      }
    }

    if (actionData.service.name === 'gitlab') {
      try {
        const gitlabToken = await gitlabTokenService.getValidAccessToken(String(userId));

        if (!gitlabToken) {
          console.error('No GitLab token found for user');
          return res.status(400).json({
            success: false,
            error: "GitLab account not connected"
          });
        }

        const gitlabInterval = resolveInterval(
          normalizedConfig.checkInterval ?? config?.checkInterval,
          60
        );

        await axios.post(`${GITLAB_SERVICE_URL}/actions/start`, {
          userId: String(userId),
          areaId: area.id.toString(),
          actionType: actionData.name,
          interval: gitlabInterval,
          config: normalizedConfig,
          accessToken: gitlabToken
        });

        console.log(`GitLab action started for AREA ${area.id}, type: ${actionData.name}`);
      } catch (error: any) {
        console.error('Error starting GitLab action:', error.response?.data || error.message);
      }
    }

    if (actionData.service.name === 'onedrive') {
      try {
        console.log('[ONEDRIVE AREA] Starting OneDrive AREA setup');
        console.log('[ONEDRIVE AREA] User ID:', userId);
        console.log('[ONEDRIVE AREA] AREA ID:', area.id);
        console.log('[ONEDRIVE AREA] Action type:', actionData.name);
        console.log('[ONEDRIVE AREA] Config:', JSON.stringify(normalizedConfig, null, 2));

        const onedriveToken = await onedriveTokenService.getValidAccessToken(String(userId));

        if (!onedriveToken) {
          console.error('[ONEDRIVE AREA] ERROR - No OneDrive token found for user');
          return res.status(400).json({
            success: false,
            error: "OneDrive account not connected. Please connect your OneDrive account first."
          });
        }

        console.log('[ONEDRIVE AREA] OneDrive token obtained successfully');
        console.log('[ONEDRIVE AREA] Token preview:', onedriveToken.substring(0, 20) + '...');

        console.log('[ONEDRIVE AREA] Starting auto-check every 30s');

        try {
          await axios.post(`${ONEDRIVE_SERVICE_URL}/start`, {
            userId: String(userId),
            areaId: area.id.toString(),
            actionType: actionData.name,
            config: normalizedConfig,
            accessToken: onedriveToken
          });

          console.log('[ONEDRIVE AREA] Auto-check started successfully');
        } catch (pollError: any) {
          console.error('[ONEDRIVE AREA] ERROR - Failed to start auto-check:', pollError.message);
          console.error('[ONEDRIVE AREA] Is OneDrive service running on port 5007?');
        }

        console.log('[ONEDRIVE AREA] OneDrive AREA', area.id, 'created and auto-check started');
      } catch (error: any) {
        console.error('[ONEDRIVE AREA] ERROR - Setup failed:', error.response?.data || error.message);
        console.error('[ONEDRIVE AREA] Stack trace:', error.stack);
      }
    }
    if (actionData.service.name === 'notion') {
      try {
        const notionAccessToken = await notionTokenService.getValidAccessToken(String(userId));

        const notionInterval = resolveInterval(
          normalizedConfig.checkInterval ?? config?.checkInterval,
          60
        );

        await axios.post(`${NOTION_SERVICE_URL}/actions/start`, {
          userId: String(userId),
          areaId: area.id.toString(),
          actionType: actionData.name,
          interval: notionInterval,
          config: normalizedConfig || {},
          accessToken: notionAccessToken
        });

        console.log(`[Notion AREA] Action ${actionData.name} started for AREA ${area.id}`);
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';

        if (errorMessage.includes('Notion tokens') || errorMessage.includes('Notion account not connected')) {
          return res.status(400).json({
            success: false,
            error: "Notion account not connected. Please connect your Notion account first."
          });
        }

        console.error('[Notion AREA] Error starting Notion action:', error.response?.data || errorMessage);
      }
    }
    if (actionData.service.name === 'youtube') {
      try {
        const googleToken = await prisma.oAuthToken.findFirst({
          where: {
            userId: String(userId),
            serviceName: 'google'
          }
        });

        if (!googleToken) {
          console.error('No Google token found for user');
          return res.status(400).json({
            success: false,
            error: "Google account not connected for YouTube access"
          });
        }

        const decryptedAccessToken = EncryptionUtil.decrypt(googleToken.accessToken);
        const decryptedRefreshToken = googleToken.refreshToken
          ? EncryptionUtil.decrypt(googleToken.refreshToken)
          : undefined;

        await axios.post(`${YOUTUBE_SERVICE_URL}/polling/start`, {
          userId: String(userId),
          areaId: area.id.toString(),
          accessToken: decryptedAccessToken,
          refreshToken: decryptedRefreshToken,
          actionType: actionData.name,
          config: normalizedConfig || {}
        });

        console.log(`YouTube polling started for AREA ${area.id}, type: ${actionData.name}`);
      } catch (error: any) {
        console.error('Error starting YouTube polling:', error.response?.data || error.message);
      }
    }

    if (actionData.service.name === 'reddit') {
      try {
        const redditToken = await redditTokenService.getValidAccessToken(String(userId));

        if (!redditToken) {
          console.error('No Reddit token found for user');
          return res.status(400).json({
            success: false,
            error: "Reddit account not connected"
          });
        }

        const redditIntervalSeconds = resolveInterval(
          normalizedConfig.checkInterval ?? config?.checkInterval,
          30
        );

        await axios.post(`${REDDIT_SERVICE_URL}/actions/start`, {
          userId: String(userId),
          areaId: area.id.toString(),
          actionType: actionData.name,
          interval: redditIntervalSeconds * 1000,
          config: normalizedConfig,
          accessToken: redditToken
        });

        console.log(`Reddit action started for AREA ${area.id}, type: ${actionData.name}`);
      } catch (error: any) {
        console.error('Error starting Reddit action:', error.response?.data || error.message);
      }
    }

    res.status(201).json({
      success: true,
      data: area,
      message: "AREA created successfully"
    });
  } catch (error: any) {
    console.error('Error creating AREA:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const areaId = parseInt(req.params.id);

    const area = await prisma.area.findFirst({
      where: {
        id: areaId,
        userId: String(userId)
      },
      include: {
        action: {
          include: { service: true }
        }
      }
    });

    if (!area) {
      return res.status(404).json({
        success: false,
        error: "AREA not found"
      });
    }

    if (area.action.service.name === 'timer') {
      try {
        await axios.post(`${TIMER_SERVICE_URL}/stop`, {
          userId: String(userId),
          areaId: areaId.toString()
        });
        console.log(`Timer stopped for AREA ${areaId}`);
      } catch (error) {
        console.error('Error stopping timer:', error);
      }
    }

    if (area.action.service.name === 'google' &&
        (area.action.name === 'google_new_email_received' ||
         area.action.name === 'google_email_from_sender' ||
         area.action.name === 'google_email_with_attachment' ||
         area.action.name === 'google_new_drive_file')) {
      try {
        await axios.post(`${GOOGLE_SERVICE_URL}/polling/stop`, {
          userId: String(userId),
          areaId: areaId.toString()
        });
        console.log(`Google polling stopped for AREA ${areaId}`);
      } catch (error) {
        console.error('Error stopping Google polling:', error);
      }
    }

    if (area.action.service.name === 'spotify') {
      try {
        await axios.post(`${SPOTIFY_SERVICE_URL}/actions/stop`, {
          userId: String(userId),
          areaId: areaId.toString()
        });
        console.log(`Spotify action stopped for AREA ${areaId}`);
      } catch (error) {
        console.error('Error stopping Spotify action:', error);
      }
    }

    if (area.action.service.name === 'discord') {
      try {
        await axios.post(`${DISCORD_SERVICE_URL}/actions/stop`, {
          userId: String(userId),
          areaId: areaId.toString()
        });
        console.log(`Discord action stopped for AREA ${areaId}`);
      } catch (error) {
        console.error('Error stopping Discord action:', error);
      }
    }

    if (area.action.service.name === 'telegram') {
      try {
        await axios.post(`${TELEGRAM_SERVICE_URL}/actions/stop`, {
          userId: String(userId),
          areaId: areaId.toString()
        });
        console.log(`Telegram action stopped for AREA ${areaId}`);
      } catch (error) {
        console.error('Error stopping Telegram action:', error);
      }
    }

    if (area.action.service.name === 'github') {
      try {
        await axios.post(`${GITHUB_SERVICE_URL}/actions/stop`, {
          userId: String(userId),
          areaId: areaId.toString()
        });
        console.log(`GitHub action stopped for AREA ${areaId}`);
      } catch (error) {
        console.error('Error stopping GitHub action:', error);
      }
    }

    if (area.action.service.name === 'onedrive') {
      try {
        await axios.post(`${ONEDRIVE_SERVICE_URL}/stop`, {
          userId: String(userId),
          areaId: areaId.toString()
        });
        console.log(`[ONEDRIVE AREA] Auto-check stopped for AREA ${areaId}`);
      } catch (error) {
        console.error('[ONEDRIVE AREA] Error stopping auto-check:', error);
      }
    }

    if (area.action.service.name === 'notion') {
      try {
        await axios.post(`${NOTION_SERVICE_URL}/actions/stop`, {
          userId: String(userId),
          areaId: areaId.toString()
        });
        console.log(`Notion action stopped for AREA ${areaId}`);
      } catch (error) {
        console.error('Error stopping Notion action:', error);
      }
    }

    if (area.action.service.name === 'youtube') {
      try {
        await axios.post(`${YOUTUBE_SERVICE_URL}/polling/stop`, {
          userId: String(userId),
          areaId: areaId.toString()
        });
        console.log(`YouTube polling stopped for AREA ${areaId}`);
      } catch (error) {
        console.error('Error stopping YouTube polling:', error);
      }
    }

    await prisma.area.delete({
      where: { id: areaId }
    });

    res.json({
      success: true,
      message: "AREA deleted successfully"
    });
  } catch (error: any) {
    console.error('Error deleting AREA:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post("/triggers/execute", async (req, res) => {
  try {
    const { userId, areaId, actionType, data } = req.body;

    console.log(`[Triggers Execute] Received request:`, { userId, areaId, actionType, data });

    if (!userId || !areaId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    const searchCriteria = {
      id: parseInt(areaId),
      userId: String(userId),
      isActive: true
    };
    console.log(`[Triggers Execute] Searching for AREA with:`, searchCriteria);

    const area = await prisma.area.findFirst({
      where: searchCriteria,
      include: {
        reaction: {
          include: { service: true }
        }
      }
    });

    console.log(`[Triggers Execute] AREA found:`, area ? `Yes (ID: ${area.id})` : 'No');

    if (!area) {
      return res.status(404).json({
        success: false,
        error: "AREA not found or inactive"
      });
    }

    let reactionResult;
    const config = area.config as any;
    
    switch (area.reaction.service.name) {
      case 'console':
        reactionResult = await axios.post(
          `${CONSOLE_SERVICE_URL}/trigger`,
          {
            message: `Timer triggered: ${data.type} at ${data.timestamp}`
          }
        );
        console.log('Console reaction executed');
        break;
      
      case 'discord':
        if (area.reaction.name === 'discord_webhook') {
          const webhookUrl = process.env.DISCORD_WEBHOOK_URL || config.discordWebhookUrl;

          if (!webhookUrl) {
            return res.status(400).json({
              success: false,
              error: "Discord webhook URL not configured in .env or AREA config"
            });
          }

          const parisTime = new Date().toLocaleString('fr-FR', {
            timeZone: 'Europe/Paris',
            dateStyle: 'full',
            timeStyle: 'medium'
          });

          reactionResult = await axios.post(
            `${DISCORD_SERVICE_URL}/trigger`,
            {
              webhookUrl: webhookUrl,
              message: `**Timer déclenché!**\n\n**Type:** ${data.type}\n**Date et heure:** ${parisTime}`,
              title: config.discordTitle || "Notification AREA",
              color: config.discordColor || 3066993
            }
          );
          console.log('Discord webhook reaction executed');
        } else {
          try {
            const discordAccessToken = await discordTokenService.getValidAccessToken(String(userId));

            reactionResult = await axios.post(
              `${DISCORD_SERVICE_URL}/reactions/trigger`,
              {
                userId: String(userId),
                reactionType: area.reaction.name,
                config: config,
                accessToken: discordAccessToken,
                actionData: data
              }
            );
            console.log('Discord API reaction executed:', area.reaction.name);
          } catch (error: any) {
            console.error('Discord reaction error:', error.message);
            console.error('Discord reaction error details:', error.response?.data || error);
            return res.status(400).json({
              success: false,
              error: error.message || 'Failed to execute Discord reaction. Please connect your Discord account.',
              details: error.response?.data
            });
          }
        }
        break;

      case 'telegram':
        try {
          const telegramBotToken = await telegramTokenService.getBotToken(String(userId));

          reactionResult = await axios.post(
            `${TELEGRAM_SERVICE_URL}/reactions/trigger`,
            {
              userId: String(userId),
              reactionType: area.reaction.name,
              config: config,
              accessToken: telegramBotToken,
              actionData: data
            }
          );
          console.log('Telegram reaction executed');
        } catch (error: any) {
          console.error('Telegram reaction error:', error.message);
          console.error('Telegram reaction error details:', error.response?.data || error);
          return res.status(400).json({ 
            success: false,
            error: error.message || 'Failed to execute Telegram reaction. Please configure your Telegram bot.',
            details: error.response?.data
          });
        }
        break;

      case 'spotify':
        try {
          const spotifyAccessToken = await spotifyTokenService.getValidAccessToken(String(userId));

          reactionResult = await axios.post(
            `${SPOTIFY_SERVICE_URL}/reactions/trigger`,
            {
              userId: String(userId),
              reactionType: area.reaction.name,
              config: config,
              accessToken: spotifyAccessToken,
              actionData: data
            }
          );
          console.log('Spotify reaction executed');
        } catch (error: any) {
          console.error('Spotify reaction error:', error.message);
          console.error('Spotify reaction error details:', error.response?.data || error);
          return res.status(400).json({
            success: false,
            error: error.message || 'Failed to execute Spotify reaction. Please connect your Spotify account.',
            details: error.response?.data
          });
        }
        break;

      case 'google':
        try {
          const googleToken = await prisma.oAuthToken.findFirst({
            where: {
              userId: String(userId),
              serviceName: 'google'
            }
          });

          if (!googleToken) {
            return res.status(400).json({
              success: false,
              error: 'Please connect your Google account first'
            });
          }

          const decryptedAccessToken = EncryptionUtil.decrypt(googleToken.accessToken);
          const decryptedRefreshToken = googleToken.refreshToken
            ? EncryptionUtil.decrypt(googleToken.refreshToken)
            : undefined;

          reactionResult = await axios.post(
            `${GOOGLE_SERVICE_URL}/reactions/trigger`,
            {
              userId: String(userId),
              reactionType: area.reaction.name,
              config: config,
              accessToken: decryptedAccessToken,
              refreshToken: decryptedRefreshToken,
              actionData: data
            }
          );
          console.log('Google reaction executed');

          if (reactionResult.data.newAccessToken && reactionResult.data.newExpiresAt) {
            const encryptedNewAccessToken = EncryptionUtil.encrypt(reactionResult.data.newAccessToken);
            await prisma.oAuthToken.update({
              where: { id: googleToken.id },
              data: {
                accessToken: encryptedNewAccessToken,
                expiresAt: new Date(reactionResult.data.newExpiresAt)
              }
            });
            console.log('Google access token refreshed and saved');
          }
        } catch (error: any) {
          console.error('Google reaction error:', error.message);
          console.error('Google reaction error details:', error.response?.data || error);
          return res.status(400).json({
            success: false,
            error: error.message || 'Failed to execute Google reaction. Please connect your Google account.',
            details: error.response?.data
          });
        }
        break;

      case 'reddit':
        try {
          const redditAccessToken = await redditTokenService.getValidAccessToken(String(userId));

          reactionResult = await axios.post(
            `${REDDIT_SERVICE_URL}/reactions/trigger`,
            {
              userId: String(userId),
              reactionType: area.reaction.name,
              config: config,
              accessToken: redditAccessToken,
              actionData: data
            }
          );
          console.log('Reddit reaction executed');
        } catch (error: any) {
          console.error('Reddit reaction error:', error.message);
          console.error('Reddit reaction error details:', error.response?.data || error);
          return res.status(400).json({
            success: false,
            error: error.message || 'Failed to execute Reddit reaction. Please connect your Reddit account.',
            details: error.response?.data
          });
        }
        break;

      case 'github':
        try {
          const githubAccessToken = await githubTokenService.getValidAccessToken(String(userId));

          reactionResult = await axios.post(
            `${GITHUB_SERVICE_URL}/reactions/trigger`,
            {
              userId: String(userId),
              reactionType: area.reaction.name,
              config: config,
              accessToken: githubAccessToken,
              actionData: data
            }
          );
          console.log('GitHub reaction executed');
        } catch (error: any) {
          console.error('GitHub reaction error:', error.message);
          console.error('GitHub reaction error details:', error.response?.data || error);
          return res.status(400).json({
            success: false,
            error: error.message || 'Failed to execute GitHub reaction. Please connect your GitHub account.',
            details: error.response?.data
          });
        }
        break;

      case 'gitlab':
        try {
          const gitlabAccessToken = await gitlabTokenService.getValidAccessToken(String(userId));

          reactionResult = await axios.post(
            `${GITLAB_SERVICE_URL}/reactions/trigger`,
            {
              userId: String(userId),
              reactionType: area.reaction.name,
              config: config,
              accessToken: gitlabAccessToken,
              actionData: data
            }
          );
          console.log('GitLab reaction executed');
        } catch (error: any) {
          console.error('GitLab reaction error:', error.message);
          console.error('GitLab reaction error details:', error.response?.data || error);
          return res.status(400).json({
            success: false,
            error: error.message || 'Failed to execute GitLab reaction. Please connect your GitLab account.',
            details: error.response?.data
          });
        }
        break;

      case 'onedrive':
        try {
          console.log(`\n🔵 [ONEDRIVE REACTION] Executing OneDrive reaction`);
          console.log(`[ONEDRIVE REACTION] Reaction type: ${area.reaction.name}`);
          console.log(`[ONEDRIVE REACTION] Config:`, JSON.stringify(config, null, 2));
          console.log(`[ONEDRIVE REACTION] Action data:`, JSON.stringify(data, null, 2));

          const onedriveAccessToken = await onedriveTokenService.getValidAccessToken(String(userId));

          console.log(`✅ [ONEDRIVE REACTION] Token obtained`);
          console.log(`[ONEDRIVE REACTION] Calling microservice: ${ONEDRIVE_SERVICE_URL}/reactions/${area.reaction.name}`);

          reactionResult = await axios.post(
            `${ONEDRIVE_SERVICE_URL}/reactions/${area.reaction.name}`,
            {
              accessToken: onedriveAccessToken,
              file_path: config.file_path,
              content: config.content || `Triggered at ${new Date().toISOString()}\n${JSON.stringify(data, null, 2)}`,
              url: config.url
            }
          );

          console.log(`✅ [ONEDRIVE REACTION] Reaction executed successfully:`, reactionResult.data);
        } catch (error: any) {
          console.error('❌ [ONEDRIVE REACTION] Error:', error.message);
          console.error('[ONEDRIVE REACTION] Error details:', error.response?.data || error);
          return res.status(400).json({
            success: false,
            error: error.message || 'Failed to execute OneDrive reaction. Please connect your OneDrive account.',
            details: error.response?.data
          });
        }
        break;

      case 'notion':
        try {
          const notionAccessToken = await notionTokenService.getValidAccessToken(String(userId));

          reactionResult = await axios.post(
            `${NOTION_SERVICE_URL}/reactions/trigger`,
            {
              userId: String(userId),
              reactionType: area.reaction.name,
              config: config,
              accessToken: notionAccessToken,
              actionData: data
            }
          );
          console.log('Notion reaction executed:', area.reaction.name);
        } catch (error: any) {
          console.error('Notion reaction error:', error.message);
          console.error('Notion reaction error details:', error.response?.data || error);
          return res.status(400).json({
            success: false,
            error: error.message || 'Failed to execute Notion reaction. Please connect your Notion account.',
            details: error.response?.data
          });
        }
        break;

      case 'openai':
        try {
          reactionResult = await axios.post(
            `${OPENAI_SERVICE_URL}/reactions/trigger`,
            {
              userId: String(userId),
              reactionType: area.reaction.name,
              config: config,
              actionData: data
            }
          );
        } catch (error: any) {
          return res.status(400).json({
            success: false,
            error: error.message || 'Failed to execute OpenAI reaction.',
            details: error.response?.data
          });
        }
        break;

      case 'youtube':
        try {
          console.log('[YouTube Reaction] Config from DB:', JSON.stringify(config, null, 2));
          console.log('[YouTube Reaction] Action data:', JSON.stringify(data, null, 2));

          const googleToken = await prisma.oAuthToken.findFirst({
            where: {
              userId: String(userId),
              serviceName: 'google'
            }
          });

          if (!googleToken) {
            return res.status(400).json({
              success: false,
              error: 'Please connect your Google account for YouTube access'
            });
          }

          const decryptedAccessToken = EncryptionUtil.decrypt(googleToken.accessToken);
          const decryptedRefreshToken = googleToken.refreshToken
            ? EncryptionUtil.decrypt(googleToken.refreshToken)
            : undefined;

          let transformedConfig = { ...config };
          if (area.reaction.name === 'youtube_create_playlist') {
            transformedConfig = {
              title: config.playlistName || config.title,
              description: config.playlistDescription || config.description,
              privacyStatus: config.privacyStatus || config.playlistPrivacy || 'private',
              useTemplates: config.useTemplates !== false
            };
          } else if (area.reaction.name === 'youtube_post_comment') {
            transformedConfig = {
              videoId: config.videoId,
              comment: config.commentText || config.comment
            };
          } else if (area.reaction.name === 'youtube_like_video') {
            transformedConfig = {
              videoId: config.videoId
            };
          } else if (area.reaction.name === 'youtube_add_to_playlist') {
            transformedConfig = {
              playlistId: config.playlistId,
              videoId: config.videoId
            };
          } else if (area.reaction.name === 'youtube_subscribe_channel') {
            transformedConfig = {
              channelId: config.channelId
            };
          }

          console.log('[YouTube Reaction] Transformed config:', JSON.stringify(transformedConfig, null, 2));

          reactionResult = await axios.post(
            `${YOUTUBE_SERVICE_URL}/reactions/trigger`,
            {
              userId: String(userId),
              reactionType: area.reaction.name,
              config: transformedConfig,
              accessToken: decryptedAccessToken,
              refreshToken: decryptedRefreshToken,
              actionData: data
            }
          );
          console.log('YouTube reaction executed:', area.reaction.name);
        } catch (error: any) {
          console.error('YouTube reaction error:', error.message);
          console.error('YouTube reaction error details:', error.response?.data || error);
          return res.status(400).json({
            success: false,
            error: error.message || 'Failed to execute YouTube reaction. Please connect your Google account.',
            details: error.response?.data
          });
        }
        break;

      default:
        console.log(`Reaction ${area.reaction.name} not yet implemented`);
        return res.status(501).json({
          success: false,
          error: `Reaction ${area.reaction.service.name} not implemented`
        });
    }

    await prisma.area.update({
      where: { id: area.id },
      data: { lastTriggeredAt: new Date() }
    });

    res.json({
      success: true,
      message: "Reaction executed successfully",
      data: reactionResult?.data
    });
  } catch (error: any) {
    console.error('Error executing trigger:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;

    const areas = await prisma.area.findMany({
      where: { userId: String(userId) },
      include: {
        action: {
          include: { service: true }
        },
        reaction: {
          include: { service: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: areas
    });
  } catch (error: any) {
    console.error('Error fetching areas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const areaId = parseInt(req.params.id);
    const { isActive } = req.body;

    const area = await prisma.area.findFirst({
      where: {
        id: areaId,
        userId: String(userId)
      },
      include: {
        action: {
          include: { service: true }
        },
        reaction: {
          include: { service: true }
        }
      }
    });

    if (!area) {
      return res.status(404).json({
        success: false,
        error: "AREA not found"
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "isActive must be a boolean"
      });
    }

    const currentlyActive = Boolean(area.isActive);

    if (currentlyActive === isActive) {
      return res.json({
        success: true,
        data: area,
        message: `AREA is already ${isActive ? 'active' : 'inactive'}`
      });
    }

    const normalizedConfig = normalizeConfig(
      area.action.service.name,
      area.reaction?.service?.name,
      area.config
    );

    const userIdString = String(userId);

    if (!isActive && currentlyActive) {
      try {
        await asyncStopAreaServices(area, userIdString);
      } catch (error: any) {
        console.error('Error stopping AREA services:', error.response?.data || error.message || error);
        const status = error instanceof HttpError ? error.status : 500;
        const message = error instanceof HttpError ? error.message : 'Failed to pause AREA services';
        return res.status(status).json({
          success: false,
          error: message
        });
      }
    }

    if (isActive && !currentlyActive) {
      try {
        await asyncStartAreaServices(area, userIdString, normalizedConfig);
      } catch (error: any) {
        console.error('Error starting AREA services:', error.response?.data || error.message || error);
        const status = error instanceof HttpError ? error.status : 500;
        const message = error instanceof HttpError ? error.message : 'Failed to activate AREA services';
        return res.status(status).json({
          success: false,
          error: message
        });
      }
    }

    const updatedArea = await prisma.area.update({
      where: { id: areaId },
      data: { isActive },
      include: {
        action: {
          include: { service: true }
        },
        reaction: {
          include: { service: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedArea,
      message: `AREA ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error: any) {
    console.error('Error updating AREA:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

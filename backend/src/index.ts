import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { globalLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/Auth.Routes";
import areaRoutes from "./routes/Area.Routes";
import telegramRoutes from "./routes/Telegram.Routes";
import prisma from "./config/database";

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(helmet());


const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:8081",
  "http://localhost:8080",
  "http://10.0.2.2:8080",
  "http://127.0.0.1:8080",
];


const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      
      if (process.env.NODE_ENV === "development") {
        console.warn(`CORS: Origin ${origin} not in whitelist but allowed in dev mode`);
        return callback(null, true);
      }
      
      const msg = `CORS policy: Origin ${origin} is not allowed`;
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.use(cookieParser());
app.set("trust proxy", 1);

app.use(globalLimiter);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "AREA Backend",
  });
});

app.get("/client.apk", (req, res) => {
  const apkPath = path.join(__dirname, "../apk/area-client.apk");

  console.log(`[APK Download] Looking for APK at: ${apkPath}`);
  console.log(`[APK Download] __dirname: ${__dirname}`);
  console.log(`[APK Download] File exists: ${require("fs").existsSync(apkPath)}`);

  if (!require("fs").existsSync(apkPath)) {
    return res.status(404).json({
      success: false,
      error: "APK not found. Please build the mobile client first.",
      path: apkPath,
    });
  }

  res.download(apkPath, "area-client.apk", (err) => {
    if (err) {
      console.error("Error downloading APK:", err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Failed to download APK",
        });
      }
    }
  });
});

app.get("/about.json", async (req, res) => {
  const clientHost = req.ip || req.socket.remoteAddress || "unknown";

  try {
    const services = await prisma.service.findMany({
      include: {
        actions: {
          select: {
            name: true,
            description: true,
            params: true
          }
        },
        reactions: {
          select: {
            name: true,
            description: true,
            params: true
          }
        }
      }
    });

    res.json({
      client: { host: clientHost },
      server: {
        current_time: Math.floor(Date.now() / 1000),
        services: services.map((service: any) => ({
          name: service.name,
          type: service.type,
          description: service.description || '',
          actions: service.actions,
          reactions: service.reactions
        }))
      }
    });
  } catch (error) {
    console.error('Error loading services for /about.json:', error);
    res.json({
      client: { host: clientHost },
      server: {
        current_time: Math.floor(Date.now() / 1000),
        services: [
        {
          name: "timer",
          type: "internal",
          description: "Time-based triggers and scheduling",
          actions: [
            {
              name: "timer_time",
              description: "Triggers at a specific time (HH:MM)",
            },
            {
              name: "timer_date",
              description: "Triggers at a specific date (DD/MM)",
            },
          ],
          reactions: [],
        },
        {
          name: "console",
          type: "internal",
          description: "Console logging for debugging",
          actions: [],
          reactions: [
            {
              name: "console_log",
              description: "Logs a message to console",
            },
          ],
        },
        {
          name: "discord",
          type: "webhook",
          description: "Discord messaging via webhooks",
          actions: [],
          reactions: [
            {
              name: "discord_webhook",
              description: "Send a message via Discord webhook",
            },
          ],
        },
        {
          name: "telegram",
          type: "bot",
          description: "Telegram bot automation service",
          actions: [
            {
              name: "new_message",
              description: "Triggers when a new message is received in a selected chat",
            },
            {
              name: "new_member",
              description: "Triggers when a new member joins a group",
            },
            {
              name: "bot_command",
              description: "Triggers when the bot receives a specific command",
            },
            {
              name: "channel_post",
              description: "Triggers when a new post is published in a channel",
            },
            {
              name: "poll_created",
              description: "Triggers when a poll is created in a monitored chat",
            },
          ],
          reactions: [
            {
              name: "send_message",
              description: "Send a text message to a chat",
            },
            {
              name: "send_photo",
              description: "Send a photo with optional caption",
            },
            {
              name: "send_document",
              description: "Send a document or file to a chat",
            },
            {
              name: "create_poll",
              description: "Create a poll in a chat",
            },
            {
              name: "pin_message",
              description: "Pin a message in a chat",
            },
            {
              name: "kick_user",
              description: "Remove a user from a group",
            },
          ],
        },
        {
          name: "spotify",
          type: "oauth",
          description: "Spotify music streaming service",
          actions: [
            {
              name: "new_track_in_playlist",
              description: "Triggers when a new track is added to a specific playlist",
            },
            {
              name: "new_saved_track",
              description: "Triggers when user saves a new track to their library",
            },
            {
              name: "song_playing",
              description: "Triggers when a specific song is currently playing",
            },
            {
              name: "playlist_updated",
              description: "Triggers when a playlist is modified",
            },
          ],
          reactions: [
            {
              name: "play_track",
              description: "Play a specific track",
            },
            {
              name: "add_to_playlist",
              description: "Add a track to a playlist",
            },
            {
              name: "create_playlist",
              description: "Create a new playlist",
            },
            {
              name: "save_track",
              description: "Save a track to user library",
            },
            {
              name: "pause_playback",
              description: "Pause current playback",
            },
            {
              name: "resume_playback",
              description: "Resume playback",
            },
            {
              name: "next_track",
              description: "Skip to next track",
            },
            {
              name: "previous_track",
              description: "Go to previous track",
            },
            {
              name: "set_volume",
              description: "Set playback volume (0-100)",
            },
            {
              name: "shuffle_toggle",
              description: "Toggle shuffle mode",
            },
          ],
        },
        {
          name: "notion",
          type: "oauth",
          description: "Notion workspace automation",
          actions: [
            {
              name: "notion_new_page_created",
              description: "Triggers when a new page is created in the workspace",
            },
            {
              name: "notion_database_entry_added",
              description: "Triggers when a new entry is added to a database",
            },
            {
              name: "notion_page_updated",
              description: "Triggers when an existing page is updated",
            },
          ],
          reactions: [
            {
              name: "notion_create_page",
              description: "Create a new page in Notion",
            },
            {
              name: "notion_database_add_entry",
              description: "Add a new entry to a Notion database",
            },
            {
              name: "notion_update_page",
              description: "Update properties of a Notion page",
            },
          ],
        },
        {
          name: "google",
          type: "oauth",
          description: "Google services integration (Gmail & Drive)",
          actions: [
            {
              name: "google_new_email_received",
              description: "Triggers when a new email is received in Gmail",
            },
            {
              name: "google_email_from_sender",
              description: "Triggers when an email is received from specific senders",
            },
            {
              name: "google_email_with_attachment",
              description: "Triggers when an email with attachments is received",
            },
            {
              name: "google_new_drive_file",
              description: "Triggers when a new file is created in Google Drive",
            },
          ],
          reactions: [
            {
              name: "google_send_email",
              description: "Send an email via Gmail",
            },
            {
              name: "google_reply_to_email",
              description: "Reply to an email in Gmail",
            },
            {
              name: "google_save_attachment_to_drive",
              description: "Save email attachments to Google Drive",
            },
          ],
        },
        {
          name: "reddit",
          type: "oauth",
          description: "Reddit social platform integration",
          actions: [
            {
              name: "new_post_in_subreddit",
              description: "Triggers when a new post is published in a subreddit",
            },
            {
              name: "new_comment_on_post",
              description: "Triggers when a new comment is added to a post",
            },
            {
              name: "new_message",
              description: "Triggers when a new private message is received",
            },
            {
              name: "post_score_threshold",
              description: "Triggers when a post reaches a certain score",
            },
            {
              name: "user_mentioned",
              description: "Triggers when the user is mentioned in a comment",
            },
            {
              name: "new_subscriber_milestone",
              description: "Triggers when a subreddit reaches a subscriber milestone",
            },
          ],
          reactions: [
            {
              name: "submit_post",
              description: "Create a new post in a subreddit",
            },
            {
              name: "submit_comment",
              description: "Post a comment on a post or another comment",
            },
            {
              name: "upvote",
              description: "Upvote a post or comment",
            },
            {
              name: "downvote",
              description: "Downvote a post or comment",
            },
            {
              name: "save_post",
              description: "Save a post to favorites",
            },
            {
              name: "subscribe_subreddit",
              description: "Subscribe to a subreddit",
            },
            {
              name: "unsubscribe_subreddit",
              description: "Unsubscribe from a subreddit",
            },
            {
              name: "send_message",
              description: "Send a private message to a user",
            },
            {
              name: "edit_user_flair",
              description: "Edit user flair in a subreddit",
            },
            {
              name: "report_content",
              description: "Report inappropriate content",
            },
          ],
        },
        {
          name: "github",
          type: "oauth",
          description: "GitHub repository and collaboration platform",
          actions: [
            {
              name: "new_issue",
              description: "Triggers when a new issue is opened in a repository",
            },
            {
              name: "new_pull_request",
              description: "Triggers when a new pull request is opened",
            },
            {
              name: "pull_request_merged",
              description: "Triggers when a pull request is merged",
            },
            {
              name: "new_star",
              description: "Triggers when repository receives a new star",
            },
            {
              name: "new_commit",
              description: "Triggers when a new commit is pushed to a branch",
            },
            {
              name: "new_release",
              description: "Triggers when a new release is published",
            },
          ],
          reactions: [
            {
              name: "create_issue",
              description: "Create a new issue in a repository",
            },
            {
              name: "create_comment",
              description: "Add a comment to an issue or pull request",
            },
            {
              name: "star_repository",
              description: "Star a repository",
            },
            {
              name: "create_branch",
              description: "Create a new branch in a repository",
            },
            {
              name: "close_issue",
              description: "Close an issue",
            },
            {
              name: "add_label",
              description: "Add labels to an issue or pull request",
            },
          ],
        },
        {
          name: "gitlab",
          type: "oauth",
          description: "GitLab DevOps platform for version control and CI/CD",
          actions: [
            {
              name: "new_issue",
              description: "Triggers when a new issue is created in a project",
            },
            {
              name: "merge_request_merged",
              description: "Triggers when a merge request is merged",
            },
            {
              name: "pipeline_completed",
              description: "Triggers when a CI/CD pipeline completes (success or failure)",
            },
            {
              name: "new_merge_request",
              description: "Triggers when a new merge request is opened",
            },
          ],
          reactions: [
            {
              name: "create_issue",
              description: "Create a new issue in a project",
            },
            {
              name: "comment_merge_request",
              description: "Add a comment to a merge request",
            },
            {
              name: "add_label",
              description: "Add labels to an issue",
            },
            {
              name: "close_issue",
              description: "Close an issue",
            },
            {
              name: "create_merge_request",
              description: "Create a new merge request",
            },
            {
              name: "trigger_pipeline",
              description: "Trigger a CI/CD pipeline for a branch",
            },
          ],
        },
        {
          name: "onedrive",
          type: "oauth",
          description: "Microsoft OneDrive cloud storage",
          actions: [
            {
              name: "new_file_in_folder",
              description: "Triggers every time a new file is created in the folder you specify",
            },
            {
              name: "new_photo_in_folder",
              description: "Triggers every time a new photo is created in the folder you specify",
            },
          ],
          reactions: [
            {
              name: "create_text_file",
              description: "Create a new text file at the path you specify",
            },
            {
              name: "append_to_text_file",
              description: "Append to a text file as defined by the file name and folder path you specify",
            },
            {
              name: "add_file_from_url",
              description: "Download a file at a given URL and add it to OneDrive at the path you specify (30 MB limit)",
            },
          ],
        },
        {
          name: "openai",
          type: "api",
          description: "OpenAI AI/ML integration for text generation and processing",
          actions: [],
          reactions: [
            {
              name: "generate_text",
              description: "Generate text based on a prompt using GPT",
            },
            {
              name: "summarize_text",
              description: "Summarize long text into a concise version",
            },
            {
              name: "answer_question",
              description: "Answer a question with optional context",
            },
            {
              name: "code_review",
              description: "Review code for bugs, security, and best practices",
            },
            {
              name: "translate_text",
              description: "Translate text between languages",
            },
            {
              name: "generate_creative",
              description: "Generate creative content (poem, story, email, joke, slogan)",
            },
            {
              name: "explain_concept",
              description: "Explain a concept at different complexity levels",
            },
            {
              name: "generate_ideas",
              description: "Generate creative ideas about a topic",
            },
          ],
        },
      ],
    },
  });
  }
});

app.use("/auth", authRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/telegram", telegramRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", error);
    res.status(error.status || 500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:8081"}`);
  console.log("\nCORS Configuration:");
  console.log(`   Allowed origins: ${allowedOrigins.join(", ")}`);
  console.log(`   Requests without origin: ${process.env.NODE_ENV === "development" ? " Allowed" : "Conditional"}`);
  console.log("\nAvailable endpoints:");
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   About: http://localhost:${PORT}/about.json`);
  console.log("\nAuth endpoints:");
  console.log(`   POST   /auth/register`);
  console.log(`   POST   /auth/login`);
  console.log(`   GET    /auth/profile`);
  console.log(`   POST   /auth/oauth/connect`);
  console.log(`   DELETE /auth/oauth/:serviceName`);
  console.log(`   POST   /auth/refresh`);
  console.log(`   POST   /auth/logout`);
  console.log("\nOAuth endpoints:");
  console.log(`   GET    /auth/oauth/google`);
  console.log(`   GET    /auth/oauth/google/callback`);
  console.log(`   GET    /auth/oauth/github`);
  console.log(`   GET    /auth/oauth/github/callback`);
  console.log(`   GET    /auth/oauth/facebook`);
  console.log(`   GET    /auth/oauth/facebook/callback`);
  console.log(`   GET    /auth/oauth/spotify`);
  console.log(`   GET    /auth/oauth/spotify/callback`);
  console.log(`   GET    /auth/oauth/reddit`);
  console.log(`   GET    /auth/oauth/reddit/callback`);
  console.log(`   GET    /auth/oauth/onedrive`);
  console.log(`   GET    /auth/oauth/onedrive/callback`);
  console.log(`   GET    /auth/oauth/discord`);
  console.log(`   GET    /auth/oauth/discord/callback`);
  console.log("\nArea endpoints:");
  console.log(`   POST   /api/areas`);
  console.log(`   GET    /api/areas`);
  console.log(`   DELETE /api/areas/:id`);
  console.log(`   PATCH  /api/areas/:id`);
});

export default app;

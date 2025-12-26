import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleServiceAdapter } from "./google-adapter";
import { SaveAttachmentToDriveReaction } from "./reactions/saveAttachmentToDrive";
import { NewDriveFileAction } from "./actions/newDriveFile";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5002;

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "google-service",
    timestamp: new Date().toISOString()
  });
});

app.post("/gmail/send", async (req, res) => {
  try {
    const { accessToken, refreshToken, to, subject, body, html } = req.body;

    if (!accessToken || !to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: "accessToken, to, subject et body sont requis"
      });
    }

    const adapter = new GoogleServiceAdapter({
      accessToken,
      refreshToken,
      onTokenRefresh: async (newToken, expiresAt) => {
        console.log(`[Google] Token refreshed, expires at: ${expiresAt}`);
      }
    });

    const result = await adapter.sendEmail({
      to,
      subject,
      body,
      html: html || false
    });

    console.log(`[Google] Email envoyé avec succès: ${result.id}`);

    res.json({
      success: true,
      message: "Email envoyé avec succès",
      data: result
    });

  } catch (error: any) {
    console.error("[Google] Erreur lors de l'envoi d'email:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'envoi d'email",
      details: error.message
    });
  }
});

app.post("/gmail/list", async (req, res) => {
  try {
    const { accessToken, refreshToken, maxResults, query } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "accessToken est requis"
      });
    }

    const adapter = new GoogleServiceAdapter({
      accessToken,
      refreshToken,
      onTokenRefresh: async (newToken, expiresAt) => {
        console.log(`[Google] Token refreshed, expires at: ${expiresAt}`);
      }
    });

    const result = await adapter.listEmails({
      maxResults: maxResults || 10,
      query: query || undefined
    });

    console.log(`[Google] ${result.messages.length} emails récupérés`);

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error("[Google] Erreur lors de la récupération des emails:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des emails",
      details: error.message
    });
  }
});

app.post("/gmail/get/:messageId", async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.body;
    const { messageId } = req.params;

    if (!accessToken || !messageId) {
      return res.status(400).json({
        success: false,
        error: "accessToken et messageId sont requis"
      });
    }

    const adapter = new GoogleServiceAdapter({
      accessToken,
      refreshToken,
      onTokenRefresh: async (newToken, expiresAt) => {
        console.log(`[Google] Token refreshed, expires at: ${expiresAt}`);
      }
    });

    const result = await adapter.getEmail(messageId);

    console.log(`[Google] Email ${messageId} récupéré avec succès`);

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error("[Google] Erreur lors de la récupération de l'email:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'email",
      details: error.message
    });
  }
});

app.post("/drive/list", async (req, res) => {
  try {
    const { accessToken, refreshToken, pageSize, query } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "accessToken est requis"
      });
    }

    const adapter = new GoogleServiceAdapter({
      accessToken,
      refreshToken,
      onTokenRefresh: async (newToken, expiresAt) => {
        console.log(`[Google] Token refreshed, expires at: ${expiresAt}`);
      }
    });

    const result = await adapter.listFiles({
      pageSize: pageSize || 10,
      query: query || undefined
    });

    console.log(`[Google] ${result.files.length} fichiers Drive récupérés`);

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error("[Google] Erreur lors de la récupération des fichiers Drive:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des fichiers Drive",
      details: error.message
    });
  }
});

app.post("/drive/upload", async (req, res) => {
  try {
    const { accessToken, refreshToken, name, content, mimeType, folderId } = req.body;

    if (!accessToken || !name || !content || !mimeType) {
      return res.status(400).json({
        success: false,
        error: "accessToken, name, content et mimeType sont requis"
      });
    }

    const adapter = new GoogleServiceAdapter({
      accessToken,
      refreshToken,
      onTokenRefresh: async (newToken, expiresAt) => {
        console.log(`[Google] Token refreshed, expires at: ${expiresAt}`);
      }
    });

    const result = await adapter.uploadFile({
      name,
      content,
      mimeType,
      folderId: folderId || undefined
    });

    console.log(`[Google] Fichier uploadé avec succès: ${result.id}`);

    res.json({
      success: true,
      message: "Fichier uploadé avec succès",
      data: result
    });

  } catch (error: any) {
    console.error("[Google] Erreur lors de l'upload du fichier:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'upload du fichier",
      details: error.message
    });
  }
});

app.post("/reactions/trigger", async (req, res) => {
  try {
    const { userId, reactionType, config, accessToken, refreshToken, actionData } = req.body;

    if (!userId || !reactionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, reactionType et accessToken sont requis"
      });
    }

    let newAccessToken: string | null = null;
    let newExpiresAt: Date | null = null;

    const adapter = new GoogleServiceAdapter({
      accessToken,
      refreshToken,
      onTokenRefresh: async (newToken, expiresAt) => {
        console.log(`[Google] Token refreshed for user ${userId}, expires at: ${expiresAt}`);
        newAccessToken = newToken;
        newExpiresAt = expiresAt;
      }
    });

    let result;

    switch (reactionType) {
      case 'google_send_email':
        if (!config.to || !config.subject || !config.body) {
          return res.status(400).json({
            success: false,
            error: "Configuration requise: to, subject, body"
          });
        }

        result = await adapter.sendEmail({
          to: config.to,
          subject: config.subject,
          body: config.body,
          html: config.html || false
        });

        console.log(`[Google] Email envoyé pour l'utilisateur ${userId}: ${result.id}`);
        break;

      case 'google_reply_to_email':
        const messageIdToReply = actionData?.messageId || config.messageId;

        console.log(`[Google Reply] Config received:`, JSON.stringify(config, null, 2));
        console.log(`[Google Reply] MessageId: ${messageIdToReply}`);
        console.log(`[Google Reply] Config.body: "${config.body}"`);

        if (!messageIdToReply || !config.body) {
          return res.status(400).json({
            success: false,
            error: "Configuration requise: messageId, body"
          });
        }

        const originalEmail = await adapter.getEmail(messageIdToReply);
        const senderEmail = originalEmail.from;

        console.log(`[Google Reply] Original email subject: ${originalEmail.subject}`);
        console.log(`[Google Reply] Sender email: ${senderEmail}`);
        console.log(`[Google Reply] Body to send: "${config.body}"`);

        result = await adapter.sendEmail({
          to: senderEmail,
          subject: `Re: ${originalEmail.subject}`,
          body: config.body,
          html: config.html || false
        });

        console.log(`[Google] Réponse envoyée pour l'utilisateur ${userId}: ${result.id}`);
        break;

      case 'google_save_attachment_to_drive':
        console.log(`[Google] Executing save attachment to drive for user ${userId}`);
        console.log(`[Google] Config:`, JSON.stringify(config, null, 2));
        console.log(`[Google] Action data:`, JSON.stringify(actionData, null, 2));

        const saveAttachmentReaction = new SaveAttachmentToDriveReaction(adapter);

        const attachmentInput = {
          emailId: actionData?.emailId || actionData?.messageId,
          attachments: actionData?.attachments,
          from: actionData?.from,
          subject: actionData?.subject,
          ...actionData
        };

        saveAttachmentReaction.validateConfig(config, attachmentInput);
        result = await saveAttachmentReaction.execute(config, attachmentInput);

        console.log(`[Google] Saved ${result.totalSaved} attachment(s) to Drive for user ${userId}`);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Type de réaction inconnu: ${reactionType}`
        });
    }

    const response: any = {
      success: true,
      message: "Réaction Google exécutée avec succès",
      data: result
    };

    if (newAccessToken && newExpiresAt) {
      response.newAccessToken = newAccessToken;
      response.newExpiresAt = newExpiresAt;
    }

    res.json(response);

  } catch (error: any) {
    console.error("[Google] Erreur lors de l'exécution de la réaction:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'exécution de la réaction Google",
      details: error.message
    });
  }
});

interface PollingJob {
  userId: string;
  areaId: string;
  accessToken: string;
  refreshToken?: string;
  config: any;
  lastMessageId?: string;
  driveFileChecker?: NewDriveFileAction;
  interval: NodeJS.Timeout;
}

const pollingJobs = new Map<string, PollingJob>();

app.post("/polling/start", async (req, res) => {
  try {
    const { userId, areaId, accessToken, refreshToken, config, actionType } = req.body;

    if (!userId || !areaId || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, areaId et accessToken sont requis"
      });
    }

    const jobKey = `${userId}_${areaId}`;

    if (pollingJobs.has(jobKey)) {
      clearInterval(pollingJobs.get(jobKey)!.interval);
      pollingJobs.delete(jobKey);
    }

    const adapter = new GoogleServiceAdapter({
      accessToken,
      refreshToken,
      onTokenRefresh: async (newToken, expiresAt) => {
        console.log(`[Google Polling] Token refreshed for user ${userId}`);
      }
    });

    let lastMessageId: string | undefined;
    let driveFileChecker: NewDriveFileAction | undefined;

    if (actionType === 'google_new_drive_file') {
      driveFileChecker = new NewDriveFileAction(adapter);
      console.log(`[Google Polling] Initialized Drive file checker for AREA ${areaId}`);
    } else {
      const initialEmails = await adapter.listEmails({
        maxResults: 1,
        query: config.query || undefined
      });

      lastMessageId = initialEmails.messages.length > 0
        ? initialEmails.messages[0].id
        : undefined;
    }

    const intervalMs = (config.checkInterval || 60) * 1000;
    const interval = setInterval(async () => {
      try {
        const job = pollingJobs.get(jobKey);
        if (!job) return;

        if (job.driveFileChecker) {
          console.log(`[Google Polling] Checking for new Drive files for AREA ${areaId}`);

          const newFiles = await job.driveFileChecker.check(config);

          if (newFiles.length > 0) {
            console.log(`[Google Polling] Found ${newFiles.length} new Drive file(s) for AREA ${areaId}`);

            const backendUrl = process.env.BACKEND_URL || 'http://area_server:8080';
            for (const file of newFiles) {
              await axios.post(`${backendUrl}/api/areas/triggers/execute`, {
                userId,
                areaId,
                actionType: 'google_new_drive_file',
                data: {
                  fileId: file.id,
                  fileName: file.name,
                  mimeType: file.mimeType,
                  size: file.size,
                  createdTime: file.createdTime,
                  webViewLink: file.webViewLink,
                  owners: file.owners,
                  timestamp: new Date().toISOString()
                }
              });

              console.log(`[Google Polling] Triggered AREA ${areaId} for file: ${file.name}`);
            }
          }
        } else {
          console.log(`[Google Polling] Checking for new emails for AREA ${areaId}`);

          let query = config.query || undefined;

          if (config.senders && Array.isArray(config.senders) && config.senders.length > 0) {
            const senderQueries = config.senders.map((sender: string) => `from:${sender}`);
            query = senderQueries.join(' OR ');
            console.log(`[Google Polling] Using sender filter: ${query}`);
          }

          if (config.hasAttachment) {
            query = query ? `${query} has:attachment` : 'has:attachment';
            console.log(`[Google Polling] Using attachment filter: ${query}`);
          }

          const emails = await adapter.listEmails({
            maxResults: 10,
            query: query
          });

          let foundNew = false;
          const newEmails = [];

          for (const email of emails.messages) {
            if (email.id === job.lastMessageId) {
              foundNew = true;
              break;
            }
            newEmails.push(email);
          }

          if (newEmails.length > 0) {
            console.log(`[Google Polling] Found ${newEmails.length} new email(s) for AREA ${areaId}`);

            const latestEmail = await adapter.getEmail(newEmails[0].id);

            const gmail = (adapter as any).gmail;
            const fullMessage = await gmail.users.messages.get({
              userId: 'me',
              id: newEmails[0].id,
              format: 'full'
            });

            const attachments: any[] = [];
            const processPart = (part: any) => {
              if (part.filename && part.body?.attachmentId) {
                attachments.push({
                  filename: part.filename,
                  mimeType: part.mimeType,
                  size: part.body.size || 0,
                  attachmentId: part.body.attachmentId
                });
              }
              if (part.parts) {
                part.parts.forEach(processPart);
              }
            };

            if (fullMessage.data.payload?.parts) {
              fullMessage.data.payload.parts.forEach(processPart);
            }

            console.log(`[Google Polling] Found ${attachments.length} attachment(s) in email ${latestEmail.id}`);

            job.lastMessageId = newEmails[0].id;

            const backendUrl = process.env.BACKEND_URL || 'http://area_server:8080';
            await axios.post(`${backendUrl}/api/areas/triggers/execute`, {
              userId,
              areaId,
              actionType: 'google_new_email_received',
              data: {
                messageId: latestEmail.id,
                emailId: latestEmail.id,
                from: latestEmail.from,
                subject: latestEmail.subject,
                snippet: latestEmail.snippet,
                attachments: attachments,
                timestamp: new Date().toISOString()
              }
            });

            console.log(`[Google Polling] Triggered AREA ${areaId} with ${attachments.length} attachment(s)`);
          }
        }
      } catch (error: any) {
        console.error(`[Google Polling] Error checking for AREA ${areaId}:`, error.message);
      }
    }, intervalMs);

    pollingJobs.set(jobKey, {
      userId,
      areaId,
      accessToken,
      refreshToken,
      config,
      lastMessageId,
      driveFileChecker,
      interval
    });

    console.log(`[Google Polling] Started polling for AREA ${areaId} (interval: ${intervalMs}ms)`);

    res.json({
      success: true,
      message: "Polling started successfully",
      data: {
        userId,
        areaId,
        interval: intervalMs
      }
    });

  } catch (error: any) {
    console.error("[Google Polling] Error starting polling:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors du démarrage du polling",
      details: error.message
    });
  }
});

app.post("/polling/stop", async (req, res) => {
  try {
    const { userId, areaId } = req.body;

    if (!userId || !areaId) {
      return res.status(400).json({
        success: false,
        error: "userId et areaId sont requis"
      });
    }

    const jobKey = `${userId}_${areaId}`;

    if (pollingJobs.has(jobKey)) {
      const job = pollingJobs.get(jobKey)!;
      clearInterval(job.interval);
      pollingJobs.delete(jobKey);

      console.log(`[Google Polling] Stopped polling for AREA ${areaId}`);

      res.json({
        success: true,
        message: "Polling stopped successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Polling job not found"
      });
    }
  } catch (error: any) {
    console.error("[Google Polling] Error stopping polling:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'arrêt du polling",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Google Service running on port ${PORT}`);
  console.log(`Gmail API: Ready`);
  console.log(`Drive API: Ready`);
  console.log(`Polling System: Ready`);
});

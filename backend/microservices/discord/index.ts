import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.DISCORD_SERVICE_PORT || 5003;

// ==================== INTERFACES ====================

interface DiscordActionPayload {
  userId: string;
  actionType: string;
  config: any;
}

interface DiscordReactionPayload {
  userId: string;
  reactionType: string;
  config: any;
  accessToken: string;
}

// ==================== HELPER FUNCTIONS ====================

const makeDiscordRequest = async (
  endpoint: string,
  accessToken: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  data?: any
) => {
  try {
    const response = await axios({
      method,
      url: `https://discord.com/api/v10${endpoint}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data
    });
    return response.data;
  } catch (error: any) {
    console.error(`[Discord API] Error on ${endpoint}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Discord API request failed');
  }
};

const makeBotRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  data?: any
) => {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    throw new Error('DISCORD_BOT_TOKEN not configured');
  }

  try {
    const response = await axios({
      method,
      url: `https://discord.com/api/v10${endpoint}`,
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      data
    });
    return response.data;
  } catch (error: any) {
    console.error(`[Discord Bot API] Error on ${endpoint}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Discord Bot API request failed');
  }
};

// ==================== ACTIONS (Triggers) ====================

app.post("/actions/check", async (req, res) => {
  try {
    const { userId, actionType, config, accessToken } = req.body as DiscordActionPayload & { accessToken: string };

    if (!userId || !actionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, actionType et accessToken sont requis"
      });
    }

    let triggered = false;
    let actionData = {};

    switch (actionType) {
      case "new_message_in_channel": {
        const channelId = String(config.channelId);
        if (!channelId) {
          return res.status(400).json({ success: false, error: "channelId requis" });
        }

        const messages = await makeBotRequest(`/channels/${channelId}/messages?limit=1`);

        if (messages && messages.length > 0) {
          const latestMessage = messages[0];

          if (config.lastMessageId && latestMessage.id !== config.lastMessageId) {
            triggered = true;
            actionData = {
              messageId: latestMessage.id,
              messageContent: latestMessage.content,
              messageAuthor: latestMessage.author.username,
              messageAuthorId: latestMessage.author.id,
              channelId: latestMessage.channel_id,
              timestamp: latestMessage.timestamp,
              lastMessageId: latestMessage.id
            };
          } else if (!config.lastMessageId) {
            actionData = {
              lastMessageId: latestMessage.id
            };
          } else {
            actionData = {
              lastMessageId: config.lastMessageId
            };
          }
        }
        break;
      }

      case "new_member_joined": {
        const guildId = String(config.guildId);
        if (!guildId) {
          return res.status(400).json({ success: false, error: "guildId requis" });
        }

        const members = await makeBotRequest(`/guilds/${guildId}/members?limit=10`);

        if (members && members.length > 0) {
          const sortedMembers = members.sort((a: any, b: any) =>
            new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()
          );
          const latestMember = sortedMembers[0];

          if (config.lastMemberId && latestMember.user.id !== config.lastMemberId) {
            triggered = true;
            actionData = {
              userId: latestMember.user.id,
              username: latestMember.user.username,
              discriminator: latestMember.user.discriminator,
              joinedAt: latestMember.joined_at,
              lastMemberId: latestMember.user.id
            };
          } else if (!config.lastMemberId) {
            actionData = {
              lastMemberId: latestMember.user.id
            };
          } else {
            actionData = {
              lastMemberId: config.lastMemberId
            };
          }
        }
        break;
      }

      case "message_reaction_added": {
        const channelId = String(config.channelId);
        const messageId = String(config.messageId);

        if (!channelId || !messageId) {
          return res.status(400).json({
            success: false,
            error: "channelId et messageId requis"
          });
        }

        const message = await makeBotRequest(`/channels/${channelId}/messages/${messageId}`);

        if (message && message.reactions && message.reactions.length > 0) {
          const totalReactions = message.reactions.reduce((sum: number, r: any) => sum + r.count, 0);

          if (config.lastReactionCount !== undefined && totalReactions > config.lastReactionCount) {
            triggered = true;
            const latestReaction = message.reactions[message.reactions.length - 1];
            actionData = {
              messageId: message.id,
              channelId: message.channel_id,
              reactionEmoji: latestReaction.emoji.name,
              reactionCount: latestReaction.count,
              totalReactions,
              lastReactionCount: totalReactions
            };
          } else if (config.lastReactionCount === undefined) {
            actionData = {
              lastReactionCount: totalReactions
            };
          } else {
            actionData = {
              lastReactionCount: config.lastReactionCount
            };
          }
        } else {
          actionData = {
            lastReactionCount: config.lastReactionCount || 0
          };
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
    console.error("Erreur Discord Action:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la vérification de l'action Discord",
      details: error.message
    });
  }
});

// ==================== WEBHOOK TRIGGER ====================

app.post("/trigger", async (req, res) => {
  try {
    const { webhookUrl, message, title, color } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        error: "webhookUrl est requis"
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "message est requis"
      });
    }

    const embed = {
      title: title || "Notification AREA",
      description: message,
      color: color || 3066993,
      timestamp: new Date().toISOString(),
      footer: {
        text: "AREA Bot"
      }
    };

    const response = await axios.post(webhookUrl, {
      embeds: [embed]
    });

    console.log(`[Discord Webhook] Message sent successfully`);

    res.json({
      success: true,
      message: "Message envoyé via Discord webhook"
    });

  } catch (error: any) {
    console.error("[Discord Webhook] Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'envoi du webhook Discord",
      details: error.response?.data || error.message
    });
  }
});

// ==================== REACTIONS ====================

app.post("/reactions/trigger", async (req, res) => {
  try {
    const { userId, reactionType, config, accessToken, actionData } = req.body as DiscordReactionPayload & { actionData?: any };

    if (!userId || !reactionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, reactionType et accessToken sont requis"
      });
    }

    let result: any = {};

    switch (reactionType) {
      case "send_message": {
        const channelId = String(config.channelId || actionData?.channelId);
        const messageContent = config.messageContent || config.message;

        if (!channelId || !messageContent) {
          return res.status(400).json({
            success: false,
            error: "channelId et messageContent requis"
          });
        }

        const sentMessage = await makeBotRequest(
          `/channels/${channelId}/messages`,
          'POST',
          { content: messageContent }
        );

        result = {
          message: "Message envoyé sur Discord",
          messageId: sentMessage.id,
          channelId: sentMessage.channel_id
        };
        break;
      }

      case "send_embed": {
        const channelId = String(config.channelId || actionData?.channelId);
        const embedTitle = config.embedTitle || config.title;
        const embedDescription = config.embedDescription || config.description;
        const embedColor = config.embedColor || 3447003; // Default blue

        if (!channelId || !embedTitle) {
          return res.status(400).json({
            success: false,
            error: "channelId et embedTitle requis"
          });
        }

        const embed = {
          title: embedTitle,
          description: embedDescription,
          color: embedColor,
          timestamp: new Date().toISOString(),
          footer: {
            text: "AREA Service"
          }
        };

        const sentMessage = await makeBotRequest(
          `/channels/${channelId}/messages`,
          'POST',
          { embeds: [embed] }
        );

        result = {
          message: "Embed envoyé sur Discord",
          messageId: sentMessage.id,
          channelId: sentMessage.channel_id
        };
        break;
      }

      case "send_dm": {
        const targetUserId = String(config.targetUserId || config.userId);
        const messageContent = config.messageContent || config.message;

        if (!targetUserId || !messageContent) {
          return res.status(400).json({
            success: false,
            error: "targetUserId et messageContent requis"
          });
        }

        const dmChannel = await makeBotRequest(
          `/users/@me/channels`,
          'POST',
          { recipient_id: targetUserId }
        );

        const sentMessage = await makeBotRequest(
          `/channels/${String(dmChannel.id)}/messages`,
          'POST',
          { content: messageContent }
        );

        result = {
          message: "Message privé envoyé",
          messageId: sentMessage.id,
          channelId: sentMessage.channel_id,
          recipientId: targetUserId
        };
        break;
      }

      case "add_reaction": {
        const channelId = String(config.channelId || actionData?.channelId);
        const messageId = String(config.messageId || actionData?.messageId);
        const emoji = config.emoji || '👍';

        if (!channelId || !messageId) {
          return res.status(400).json({
            success: false,
            error: "channelId et messageId requis"
          });
        }

        const encodedEmoji = encodeURIComponent(emoji);

        await makeBotRequest(
          `/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/@me`,
          'PUT'
        );

        result = {
          message: "Réaction ajoutée au message",
          messageId,
          channelId,
          emoji
        };
        break;
      }

      case "delete_message": {
        const channelId = String(config.channelId || actionData?.channelId);
        const messageId = String(config.messageId || actionData?.messageId);

        if (!channelId || !messageId) {
          return res.status(400).json({
            success: false,
            error: "channelId et messageId requis"
          });
        }

        await makeBotRequest(
          `/channels/${channelId}/messages/${messageId}`,
          'DELETE'
        );

        result = {
          message: "Message supprimé",
          messageId,
          channelId
        };
        break;
      }

      case "pin_message": {
        const channelId = String(config.channelId || actionData?.channelId);
        const messageId = String(config.messageId || actionData?.messageId);

        if (!channelId || !messageId) {
          return res.status(400).json({
            success: false,
            error: "channelId et messageId requis"
          });
        }

        await makeBotRequest(
          `/channels/${channelId}/pins/${messageId}`,
          'PUT'
        );

        result = {
          message: "Message épinglé",
          messageId,
          channelId
        };
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Reaction type inconnu: ${reactionType}`
        });
    }

    console.log(`[Discord Reaction] ${reactionType} exécuté pour l'utilisateur ${userId}`);

    res.json({
      success: true,
      message: "Reaction Discord exécutée avec succès",
      data: result
    });

  } catch (error: any) {
    console.error("Erreur Discord Reaction:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'exécution de la reaction Discord",
      details: error.message
    });
  }
});

// ==================== POLLING MANAGEMENT ====================

const activePollers = new Map<string, NodeJS.Timeout>();

app.post("/actions/start", async (req, res) => {
  try {
    const { userId, areaId, actionType, interval, config, accessToken } = req.body;

    if (!userId || !areaId || !actionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    const pollerKey = `${userId}:${areaId}`;

    if (activePollers.has(pollerKey)) {
      return res.status(400).json({
        success: false,
        error: "Poller already active for this AREA"
      });
    }

    console.log(`[Discord] Starting poller for AREA ${areaId}, type: ${actionType}, interval: ${interval || 30}s`);

    let currentConfig = { ...config };

    const poller = setInterval(async () => {
      try {
        console.log(`[Discord] Checking action for AREA ${areaId}...`);

        const checkResult = await axios.post(`http://localhost:${PORT}/actions/check`, {
          userId,
          actionType,
          config: currentConfig,
          accessToken
        });

        if (checkResult.data.data) {
          console.log(`[Discord] Updating config for AREA ${areaId}:`, checkResult.data.data);
          currentConfig = { ...currentConfig, ...checkResult.data.data };
        }

        if (checkResult.data.triggered) {
          console.log(`[Discord] Action triggered for AREA ${areaId}! Executing reaction...`);

          await axios.post(`${process.env.BACKEND_API || 'http://area_server:8080'}/api/areas/triggers/execute`, {
            userId,
            areaId,
            actionType,
            data: checkResult.data.data
          });
        }
      } catch (error: any) {
        console.error(`[Discord] Error checking action for AREA ${areaId}:`, error.message);
      }
    }, (interval || 30) * 1000);

    activePollers.set(pollerKey, poller);

    res.json({
      success: true,
      message: "Discord poller started"
    });
  } catch (error: any) {
    console.error('[Discord] Error starting poller:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/actions/stop", async (req, res) => {
  try {
    const { userId, areaId } = req.body;
    const pollerKey = `${userId}:${areaId}`;

    if (activePollers.has(pollerKey)) {
      clearInterval(activePollers.get(pollerKey)!);
      activePollers.delete(pollerKey);
      console.log(`[Discord] Stopped poller for AREA ${areaId}`);
    }

    res.json({
      success: true,
      message: "Discord poller stopped"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/actions/status", (req, res) => {
  const activeCount = activePollers.size;
  const activeAreas = Array.from(activePollers.keys());

  res.json({
    success: true,
    activePollers: activeCount,
    areas: activeAreas
  });
});

// ==================== HEALTH CHECK ====================

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "discord" });
});

// ==================== SERVER ====================

app.listen(PORT, () => {
  console.log(`Discord service en ligne sur le port ${PORT}`);
});

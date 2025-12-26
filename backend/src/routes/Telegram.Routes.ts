import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { TelegramTokenService } from "../services/telegram.token.service";

const router = Router();
const telegramTokenService = new TelegramTokenService();

router.get("/status", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const status = await telegramTokenService.getStatus(String(userId));

    return res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error("[Telegram] Status error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Unable to load Telegram status",
    });
  }
});

router.post("/configure", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { botToken, force } = req.body || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!botToken || typeof botToken !== "string" || botToken.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Veuillez fournir le token généré par BotFather.",
      });
    }

    const trimmedToken = botToken.trim();
    const status = await telegramTokenService.getStatus(String(userId));

    if (status.configured && !force) {
      return res.status(409).json({
        success: false,
        error: "Un bot Telegram est déjà configuré. Utilisez l'option de remplacement pour écraser la configuration existante.",
      });
    }

    const botInfo = await telegramTokenService.validateBotToken(trimmedToken);
    await telegramTokenService.storeBotToken(String(userId), trimmedToken, botInfo);

    return res.json({
      success: true,
      message: "Bot Telegram configuré avec succès.",
      data: {
        botId: botInfo.id,
        username: botInfo.username || null,
        displayName: botInfo.first_name || botInfo.username || "Telegram Bot",
      },
    });
  } catch (error: any) {
    console.error("[Telegram] Configure error:", error);
    return res.status(400).json({
      success: false,
      error: error.message || "Impossible de configurer le bot Telegram.",
    });
  }
});

router.delete("/configure", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const status = await telegramTokenService.getStatus(String(userId));

    if (!status.configured) {
      return res.status(404).json({
        success: false,
        error: "Aucun bot Telegram configuré pour cet utilisateur.",
      });
    }

    await telegramTokenService.removeBotToken(String(userId));

    return res.json({
      success: true,
      message: "Bot Telegram déconnecté.",
    });
  } catch (error: any) {
    console.error("[Telegram] Delete error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Impossible de supprimer la configuration du bot Telegram.",
    });
  }
});

export default router;

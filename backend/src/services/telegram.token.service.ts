import axios from "axios";
import prisma from "../config/database";
import { UserRepository } from "../repositories/UserRepository";

interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name?: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

interface TelegramStatus {
  configured: boolean;
  displayName?: string | null;
  botId?: number | null;
  username?: string | null;
  updatedAt?: string | null;
}

export class TelegramTokenService {
  private static readonly SERVICE_NAME = "telegram_bot";
  private static readonly TELEGRAM_API_BASE = "https://api.telegram.org";

  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async validateBotToken(botToken: string): Promise<TelegramBotInfo> {
    if (!botToken || typeof botToken !== "string") {
      throw new Error("Invalid Telegram bot token provided");
    }

    try {
      const response = await axios.get(`${TelegramTokenService.TELEGRAM_API_BASE}/bot${botToken}/getMe`);

      if (!response.data?.ok || !response.data?.result?.is_bot) {
        throw new Error(response.data?.description || "Le token fourni n'est pas valide pour un bot Telegram");
      }

      return response.data.result as TelegramBotInfo;
    } catch (error: any) {
      if (error.response?.data?.description) {
        throw new Error(`Erreur Telegram: ${error.response.data.description}`);
      }

      throw new Error(error.message || "Impossible de valider le token Telegram");
    }
  }

  async storeBotToken(userId: string, botToken: string, botInfo: TelegramBotInfo): Promise<void> {
    if (!userId) {
      throw new Error("User ID is required to store a Telegram bot token");
    }

    const scope: string[] = ["telegram_bot"];

    if (botInfo?.id) {
      scope.push(`bot_id:${botInfo.id}`);
    }

    if (botInfo?.username) {
      scope.push(`username:${botInfo.username}`);
    }

    const displayName = botInfo?.first_name || botInfo?.username || "Telegram Bot";
    const username = botInfo?.username ? `@${botInfo.username}` : undefined;

    await this.userRepository.storeOAuthTokens({
      userId,
      serviceName: TelegramTokenService.SERVICE_NAME,
      accessToken: botToken,
      scope,
      displayName,
      email: username,
    });
  }

  async getBotToken(userId: string): Promise<string | null> {
    if (!userId) {
      return null;
    }

    const tokenData = await this.userRepository.getOAuthTokens(userId, TelegramTokenService.SERVICE_NAME);
    return tokenData?.accessToken || null;
  }

  async removeBotToken(userId: string): Promise<void> {
    if (!userId) {
      return;
    }

    try {
      await this.userRepository.revokeServiceTokens(userId, TelegramTokenService.SERVICE_NAME);
    } catch (error: any) {
      if (error.code === "P2025") {
        return;
      }
      throw error;
    }
  }

  async getStatus(userId: string): Promise<TelegramStatus> {
    if (!userId) {
      return { configured: false };
    }

    const record = await prisma.oAuthToken.findUnique({
      where: {
        userId_serviceName: {
          userId,
          serviceName: TelegramTokenService.SERVICE_NAME,
        },
      },
    });

    if (!record) {
      return { configured: false };
    }

    let botId: number | null = null;
    let username: string | null = null;

    if (Array.isArray(record.scope)) {
      const idEntry = record.scope.find((value: string) => value.startsWith("bot_id:"));
      if (idEntry) {
        const parsedId = Number(idEntry.split(":")[1]);
        botId = Number.isNaN(parsedId) ? null : parsedId;
      }

      const usernameEntry = record.scope.find((value: string) => value.startsWith("username:"));
      if (usernameEntry) {
        username = usernameEntry.split(":")[1] || null;
      }
    }

    return {
      configured: true,
      displayName: record.displayName || null,
      botId,
      username,
      updatedAt: record.updatedAt ? record.updatedAt.toISOString() : null,
    };
  }

  async ensureTokenAvailable(userId: string): Promise<string> {
    const token = await this.getBotToken(userId);

    if (!token) {
      throw new Error("Telegram bot not configured");
    }

    return token;
  }
}

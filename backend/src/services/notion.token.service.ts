import { UserRepository } from "../repositories/UserRepository";

export class NotionTokenService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getValidAccessToken(userId: string): Promise<string> {
    const tokenData = await this.userRepository.getOAuthTokens(userId, "notion");

    if (!tokenData) {
      throw new Error("No Notion tokens found for this user. Please connect your Notion account.");
    }

    return tokenData.accessToken;
  }

  async hasNotionConnected(userId: string): Promise<boolean> {
    try {
      const tokenData = await this.userRepository.getOAuthTokens(userId, "notion");
      return !!tokenData;
    } catch {
      return false;
    }
  }

  async revokeAccess(userId: string): Promise<void> {
    await this.userRepository.revokeServiceTokens(userId, "notion");
  }
}

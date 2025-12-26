import { UserRepository } from '../repositories/UserRepository';
import { refreshDiscordToken } from './oauth.service';

export class DiscordTokenService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get a valid Discord access token for a user.
   * Automatically refreshes the token if it's expired.
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const tokenData = await this.userRepository.getOAuthTokens(userId, 'discord');

    if (!tokenData) {
      throw new Error('No Discord tokens found for this user. Please connect your Discord account.');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const now = new Date();
    const expiresAt = tokenData.expiresAt;
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (!expiresAt || now.getTime() >= (expiresAt.getTime() - bufferTime)) {
      // Token is expired or about to expire, refresh it
      if (!tokenData.refreshToken) {
        throw new Error('No refresh token available. Please reconnect your Discord account.');
      }

      console.log(`[Discord Token Service] Refreshing token for user ${userId}`);

      try {
        const newTokens = await refreshDiscordToken(tokenData.refreshToken);

        // Store the new tokens
        await this.userRepository.storeOAuthTokens({
          userId,
          serviceName: 'discord',
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token || tokenData.refreshToken,
          expiresAt: newTokens.expires_at,
          scope: newTokens.scope
        });

        console.log(`[Discord Token Service] Token refreshed successfully for user ${userId}`);

        return newTokens.access_token;
      } catch (error: any) {
        console.error(`[Discord Token Service] Failed to refresh token:`, error.message);
        throw new Error('Failed to refresh Discord token. Please reconnect your Discord account.');
      }
    }

    // Token is still valid
    return tokenData.accessToken;
  }

  /**
   * Check if a user has Discord connected
   */
  async hasDiscordConnected(userId: string): Promise<boolean> {
    try {
      const tokenData = await this.userRepository.getOAuthTokens(userId, 'discord');
      return !!tokenData;
    } catch {
      return false;
    }
  }

  /**
   * Manually refresh a Discord token
   */
  async refreshToken(userId: string): Promise<void> {
    const tokenData = await this.userRepository.getOAuthTokens(userId, 'discord');

    if (!tokenData) {
      throw new Error('No Discord tokens found for this user');
    }

    if (!tokenData.refreshToken) {
      throw new Error('No refresh token available');
    }

    const newTokens = await refreshDiscordToken(tokenData.refreshToken);

    await this.userRepository.storeOAuthTokens({
      userId,
      serviceName: 'discord',
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || tokenData.refreshToken,
      expiresAt: newTokens.expires_at,
      scope: newTokens.scope
    });
  }

  /**
   * Revoke Discord access for a user
   */
  async revokeAccess(userId: string): Promise<void> {
    await this.userRepository.revokeServiceTokens(userId, 'discord');
  }
}
import { UserRepository } from '../repositories/UserRepository';
import { refreshRedditToken } from './oauth.service';

export class RedditTokenService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get a valid Reddit access token for a user.
   * Automatically refreshes the token if it's expired.
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const tokenData = await this.userRepository.getOAuthTokens(userId, 'reddit');

    if (!tokenData) {
      throw new Error('No Reddit tokens found for this user. Please connect your Reddit account.');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const now = new Date();
    const expiresAt = tokenData.expiresAt;
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (!expiresAt || now.getTime() >= (expiresAt.getTime() - bufferTime)) {
      // Token is expired or about to expire, refresh it
      if (!tokenData.refreshToken) {
        throw new Error('No refresh token available. Please reconnect your Reddit account.');
      }

      console.log(`[Reddit Token Service] Refreshing token for user ${userId}`);

      try {
        const newTokens = await refreshRedditToken(tokenData.refreshToken);

        // Store the new tokens
        await this.userRepository.storeOAuthTokens({
          userId,
          serviceName: 'reddit',
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token || tokenData.refreshToken,
          expiresAt: newTokens.expires_at,
          scope: newTokens.scope
        });

        console.log(`[Reddit Token Service] Token refreshed successfully for user ${userId}`);

        return newTokens.access_token;
      } catch (error: any) {
        console.error(`[Reddit Token Service] Failed to refresh token:`, error.message);
        throw new Error('Failed to refresh Reddit token. Please reconnect your Reddit account.');
      }
    }

    // Token is still valid
    return tokenData.accessToken;
  }

  /**
   * Check if a user has Reddit connected
   */
  async hasRedditConnected(userId: string): Promise<boolean> {
    try {
      const tokenData = await this.userRepository.getOAuthTokens(userId, 'reddit');
      return !!tokenData;
    } catch {
      return false;
    }
  }

  /**
   * Manually refresh a Reddit token
   */
  async refreshToken(userId: string): Promise<void> {
    const tokenData = await this.userRepository.getOAuthTokens(userId, 'reddit');

    if (!tokenData) {
      throw new Error('No Reddit tokens found for this user');
    }

    if (!tokenData.refreshToken) {
      throw new Error('No refresh token available');
    }

    const newTokens = await refreshRedditToken(tokenData.refreshToken);

    await this.userRepository.storeOAuthTokens({
      userId,
      serviceName: 'reddit',
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || tokenData.refreshToken,
      expiresAt: newTokens.expires_at,
      scope: newTokens.scope
    });
  }

  /**
   * Revoke Reddit access for a user
   */
  async revokeAccess(userId: string): Promise<void> {
    await this.userRepository.revokeServiceTokens(userId, 'reddit');
  }
}

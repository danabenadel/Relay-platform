import { UserRepository } from '../repositories/UserRepository';
import { refreshOneDriveToken } from './oauth.service';

export class OneDriveTokenService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getValidAccessToken(userId: string): Promise<string> {
    console.log(`[OneDrive Token Service] Getting token for user ${userId}`);

    const tokenData = await this.userRepository.getOAuthTokens(userId, 'onedrive');

    if (!tokenData) {
      console.error(`[OneDrive Token Service] No tokens found for user ${userId}`);
      throw new Error('No OneDrive tokens found for this user. Please connect your OneDrive account.');
    }

    console.log(`[OneDrive Token Service] Token found, expires at: ${tokenData.expiresAt}`);

    const now = new Date();
    const expiresAt = tokenData.expiresAt;
    const bufferTime = 5 * 60 * 1000;

    if (!expiresAt || now.getTime() >= (expiresAt.getTime() - bufferTime)) {
      console.log(`[OneDrive Token Service] Token expired or about to expire, refreshing...`);

      if (!tokenData.refreshToken) {
        console.error(`[OneDrive Token Service] No refresh token available`);
        throw new Error('No refresh token available. Please reconnect your OneDrive account.');
      }

      try {
        const newTokens = await refreshOneDriveToken(tokenData.refreshToken);

        await this.userRepository.storeOAuthTokens({
          userId,
          serviceName: 'onedrive',
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token || tokenData.refreshToken,
          expiresAt: newTokens.expires_at,
          scope: newTokens.scope
        });

        console.log(`[OneDrive Token Service] Token refreshed successfully for user ${userId}`);

        return newTokens.access_token;
      } catch (error: any) {
        console.error(`[OneDrive Token Service] Failed to refresh token:`, error.message);
        throw new Error('Failed to refresh OneDrive token. Please reconnect your OneDrive account.');
      }
    }

    console.log(`[OneDrive Token Service] Token is valid, returning it`);
    return tokenData.accessToken;
  }

  async hasOneDriveConnected(userId: string): Promise<boolean> {
    try {
      const tokenData = await this.userRepository.getOAuthTokens(userId, 'onedrive');
      return !!tokenData;
    } catch {
      return false;
    }
  }

  async refreshToken(userId: string): Promise<void> {
    const tokenData = await this.userRepository.getOAuthTokens(userId, 'onedrive');

    if (!tokenData) {
      throw new Error('No OneDrive tokens found for this user');
    }

    if (!tokenData.refreshToken) {
      throw new Error('No refresh token available');
    }

    const newTokens = await refreshOneDriveToken(tokenData.refreshToken);

    await this.userRepository.storeOAuthTokens({
      userId,
      serviceName: 'onedrive',
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || tokenData.refreshToken,
      expiresAt: newTokens.expires_at,
      scope: newTokens.scope
    });
  }

  async revokeAccess(userId: string): Promise<void> {
    await this.userRepository.revokeServiceTokens(userId, 'onedrive');
  }
}

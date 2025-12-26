import axios from 'axios';
import { UserRepository } from '../repositories/UserRepository';

export class GitLabTokenService {
  private userRepository: UserRepository;
  private readonly GITLAB_URL: string;
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.GITLAB_URL = process.env.GITLAB_URL || 'https://gitlab.com';
    this.CLIENT_ID = process.env.GITLAB_CLIENT_ID || '';
    this.CLIENT_SECRET = process.env.GITLAB_CLIENT_SECRET || '';
  }

  /**
   * Get a valid GitLab access token for a user.
   * Automatically refreshes the token if it's expired.
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const tokenData = await this.userRepository.getOAuthTokens(userId, 'gitlab');

    if (!tokenData) {
      throw new Error('No GitLab tokens found for this user. Please connect your GitLab account.');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    if (tokenData.expiresAt) {
      const expiresAt = new Date(tokenData.expiresAt);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      if (expiresAt <= fiveMinutesFromNow) {
        // Token is expired or about to expire, refresh it
        if (!tokenData.refreshToken) {
          throw new Error('GitLab token expired and no refresh token available. Please reconnect your GitLab account.');
        }

        try {
          const newTokenData = await this.refreshAccessToken(userId, tokenData.refreshToken);
          return newTokenData.accessToken;
        } catch (error) {
          console.error('[GitLab Token Service] Error refreshing token:', error);
          throw new Error('Failed to refresh GitLab token. Please reconnect your GitLab account.');
        }
      }
    }

    return tokenData.accessToken;
  }

  /**
   * Refresh the GitLab access token using a refresh token
   */
  private async refreshAccessToken(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
      throw new Error('GitLab OAuth credentials not configured');
    }

    try {
      const response = await axios.post(`${this.GITLAB_URL}/oauth/token`, {
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      const { access_token, refresh_token, expires_in } = response.data;

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Store the new tokens
      await this.userRepository.storeOAuthTokens({
        userId,
        serviceName: 'gitlab',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        scope: ['api', 'read_user', 'read_repository', 'write_repository']
      });

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt
      };
    } catch (error: any) {
      console.error('[GitLab Token Service] Refresh error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error_description || 'Failed to refresh GitLab token');
    }
  }

  /**
   * Check if a user has GitLab connected
   */
  async hasGitLabConnected(userId: string): Promise<boolean> {
    try {
      const tokenData = await this.userRepository.getOAuthTokens(userId, 'gitlab');
      return !!tokenData;
    } catch {
      return false;
    }
  }

  /**
   * Revoke GitLab access for a user
   */
  async revokeAccess(userId: string): Promise<void> {
    await this.userRepository.revokeServiceTokens(userId, 'gitlab');
  }

  /**
   * Store GitLab OAuth tokens after authentication
   */
  async storeTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    userInfo?: { email?: string; name?: string }
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    await this.userRepository.storeOAuthTokens({
      userId,
      serviceName: 'gitlab',
      accessToken,
      refreshToken,
      expiresAt,
      scope: ['api', 'read_user', 'read_repository', 'write_repository'],
      email: userInfo?.email,
      displayName: userInfo?.name
    });
  }
}

import { UserRepository } from '../repositories/UserRepository';

export class GitHubTokenService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get a valid GitHub access token for a user.
   * GitHub tokens don't expire by default, so no refresh is needed.
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const tokenData = await this.userRepository.getOAuthTokens(userId, 'github');

    if (!tokenData) {
      throw new Error('No GitHub tokens found for this user. Please connect your GitHub account.');
    }

    // GitHub OAuth tokens don't expire by default, so we can return directly
    return tokenData.accessToken;
  }

  /**
   * Check if a user has GitHub connected
   */
  async hasGitHubConnected(userId: string): Promise<boolean> {
    try {
      const tokenData = await this.userRepository.getOAuthTokens(userId, 'github');
      return !!tokenData;
    } catch {
      return false;
    }
  }

  /**
   * Revoke GitHub access for a user
   */
  async revokeAccess(userId: string): Promise<void> {
    await this.userRepository.revokeServiceTokens(userId, 'github');
  }
}

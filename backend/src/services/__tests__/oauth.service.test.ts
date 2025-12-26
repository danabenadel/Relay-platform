import axios from 'axios';
import {
  getGoogleAuthURL,
  getGoogleTokens,
  getGoogleUser,
  getGitHubAuthURL,
  getGitHubTokens,
  getGitHubUser,
} from '../oauth.service';

jest.mock('axios');
jest.mock('../../utils/csrf', () => ({
  generateCSRFToken: jest.fn(() => 'csrf-state'),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

const googleEnv = {
  GOOGLE_CLIENT_ID: 'google-client-id',
  GOOGLE_CLIENT_SECRET: 'google-client-secret',
  GOOGLE_REDIRECT_URI: 'http://localhost:8080/auth/oauth/google/callback',
};

const githubEnv = {
  GITHUB_CLIENT_ID: 'github-client-id',
  GITHUB_CLIENT_SECRET: 'github-client-secret',
  GITHUB_REDIRECT_URI: 'http://localhost:8080/auth/oauth/github/callback',
};

type EnvKeys = keyof NodeJS.ProcessEnv;

const setEnv = (values: Record<string, string>) => {
  Object.entries(values).forEach(([key, value]) => {
    process.env[key as EnvKeys] = value;
  });
};

describe('oauth.service', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getGoogleAuthURL', () => {
    it('builds a Google OAuth URL with encoded state when source is provided', () => {
      setEnv(googleEnv);

      const url = getGoogleAuthURL('web');
      const parsed = new URL(url);

      expect(parsed.origin).toBe('https://accounts.google.com');
      expect(parsed.pathname).toBe('/o/oauth2/v2/auth');
      expect(parsed.searchParams.get('client_id')).toBe('google-client-id');
      expect(parsed.searchParams.get('redirect_uri')).toBe(googleEnv.GOOGLE_REDIRECT_URI);
      expect(parsed.searchParams.get('response_type')).toBe('code');

      const expectedStateSuffix = Buffer.from('web').toString('base64');
      expect(parsed.searchParams.get('state')).toBe(`csrf-state:${expectedStateSuffix}`);
    });

    it('throws when Google env configuration is incomplete', () => {
      process.env.GOOGLE_CLIENT_ID = '';

      expect(() => getGoogleAuthURL()).toThrow('Google OAuth not configured');
    });
  });

  describe('getGoogleTokens', () => {
    beforeEach(() => setEnv(googleEnv));

    it('returns structured token response on success', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'access',
          refresh_token: 'refresh',
          expires_in: 3600,
          scope: 'openid email profile',
        },
      });

      const result = await getGoogleTokens('auth-code');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          code: 'auth-code',
          client_id: googleEnv.GOOGLE_CLIENT_ID,
          client_secret: googleEnv.GOOGLE_CLIENT_SECRET,
        })
      );
      expect(result).toMatchObject({
        access_token: 'access',
        refresh_token: 'refresh',
      });
      expect(result.expires_at).toBeInstanceOf(Date);
      expect(result.scope).toEqual(['openid', 'email', 'profile']);
    });

    it('wraps axios failure with a friendly error', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'invalid_grant' } },
      });

      await expect(getGoogleTokens('bad-code')).rejects.toThrow('Failed to get Google tokens');
    });
  });

  describe('getGoogleUser', () => {
    beforeEach(() => setEnv(googleEnv));

    it('chains token retrieval and user lookup', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'access',
          refresh_token: 'refresh',
        },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: 'google-user-id',
          email: 'user@example.com',
        },
      });

      const user = await getGoogleUser('user-code');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: 'Bearer access' } }
      );
      expect(user).toMatchObject({
        email: 'user@example.com',
        oauth_tokens: {
          access_token: 'access',
          refresh_token: 'refresh',
        },
      });
    });

    it('throws when user lookup fails', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'access',
          refresh_token: 'refresh',
        },
      });
      mockedAxios.get.mockRejectedValueOnce(new Error('network error'));

      await expect(getGoogleUser('user-code')).rejects.toThrow(
        'Failed to authenticate with Google'
      );
    });
  });

  describe('getGitHubAuthURL', () => {
    it('builds GitHub OAuth URL and encodes source in state', () => {
      setEnv(githubEnv);

      const url = getGitHubAuthURL('desktop');
      const parsed = new URL(url);

      expect(parsed.origin).toBe('https://github.com');
      expect(parsed.pathname).toBe('/login/oauth/authorize');
      expect(parsed.searchParams.get('client_id')).toBe(githubEnv.GITHUB_CLIENT_ID);

      const expectedStateSuffix = Buffer.from('desktop').toString('base64');
      expect(parsed.searchParams.get('state')).toBe(`csrf-state:${expectedStateSuffix}`);
    });

    it('throws when GitHub env configuration is missing', () => {
      process.env.GITHUB_CLIENT_ID = 'your_client_id';
      process.env.GITHUB_CLIENT_SECRET = 'github-secret';

      expect(() => getGitHubAuthURL()).toThrow('GitHub OAuth not configured');
    });
  });

  describe('getGitHubTokens', () => {
    beforeEach(() => setEnv(githubEnv));

    it('posts to GitHub token endpoint and maps the payload', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'gh-access',
          refresh_token: 'gh-refresh',
          expires_in: 7200,
          scope: 'repo read:user',
        },
      });

      const result = await getGitHubTokens('gh-code');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        expect.objectContaining({
          client_id: githubEnv.GITHUB_CLIENT_ID,
          client_secret: githubEnv.GITHUB_CLIENT_SECRET,
          code: 'gh-code',
        }),
        { headers: { Accept: 'application/json' } }
      );

      expect(result).toMatchObject({
        access_token: 'gh-access',
        refresh_token: 'gh-refresh',
      });
      expect(result.scope).toEqual(['repo', 'read:user']);
      expect(result.expires_at).toBeInstanceOf(Date);
    });

    it('bubbles up a friendly error when GitHub rejects', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error_description: 'bad_verifier' } },
      });

      await expect(getGitHubTokens('invalid')).rejects.toThrow(
        'Failed to get GitHub tokens'
      );
    });
  });

  describe('getGitHubUser', () => {
    beforeEach(() => setEnv(githubEnv));

    it('returns GitHub profile combined with oauth tokens', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'gh-access',
        },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: 123,
          login: 'octocat',
        },
      });

      const result = await getGitHubUser('code');

      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.github.com/user', {
        headers: { Authorization: 'Bearer gh-access' },
      });

      expect(result).toMatchObject({
        login: 'octocat',
        oauth_tokens: {
          access_token: 'gh-access',
        },
      });
    });

    it('throws when GitHub profile lookup fails', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'gh-access',
        },
      });

      mockedAxios.get.mockRejectedValueOnce(new Error('rate limited'));

      await expect(getGitHubUser('code')).rejects.toThrow(
        'Failed to authenticate with GitHub'
      );
    });
  });
});


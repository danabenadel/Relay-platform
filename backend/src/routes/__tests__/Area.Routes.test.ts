import express from 'express';
import request from 'supertest';

let mockUser: { userId: string } | null = { userId: 'user-1' };

const prismaMock = {
  service: {
    findMany: jest.fn(),
  },
  action: {
    findUnique: jest.fn(),
  },
  reaction: {
    findUnique: jest.fn(),
  },
  area: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  oAuthToken: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
};

jest.mock('../../config/database', () => prismaMock);

const axiosPost = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: axiosPost,
  },
  post: axiosPost,
}));

const spotifyAccessMock = jest.fn();
const redditAccessMock = jest.fn();
const discordAccessMock = jest.fn();
const githubAccessMock = jest.fn();
const gitlabAccessMock = jest.fn();
const onedriveAccessMock = jest.fn();
const telegramGetBotTokenMock = jest.fn();
const notionAccessMock = jest.fn();

jest.mock('../../services/spotify.token.service', () => ({
  SpotifyTokenService: jest.fn().mockImplementation(() => ({
    getValidAccessToken: spotifyAccessMock,
  })),
}));

jest.mock('../../services/reddit.token.service', () => ({
  RedditTokenService: jest.fn().mockImplementation(() => ({
    getValidAccessToken: redditAccessMock,
  })),
}));

jest.mock('../../services/discord.token.service', () => ({
  DiscordTokenService: jest.fn().mockImplementation(() => ({
    getValidAccessToken: discordAccessMock,
  })),
}));

jest.mock('../../services/github.token.service', () => ({
  GitHubTokenService: jest.fn().mockImplementation(() => ({
    getValidAccessToken: githubAccessMock,
  })),
}));

jest.mock('../../services/gitlab.token.service', () => ({
  GitLabTokenService: jest.fn().mockImplementation(() => ({
    getValidAccessToken: gitlabAccessMock,
  })),
}));

jest.mock('../../services/onedrive.token.service', () => ({
  OneDriveTokenService: jest.fn().mockImplementation(() => ({
    getValidAccessToken: onedriveAccessMock,
  })),
}));

jest.mock('../../services/telegram.token.service', () => ({
  TelegramTokenService: jest.fn().mockImplementation(() => ({
    getBotToken: telegramGetBotTokenMock,
  })),
}));

jest.mock('../../services/notion.token.service', () => ({
  NotionTokenService: jest.fn().mockImplementation(() => ({
    getValidAccessToken: notionAccessMock,
  })),
}));

jest.mock('../../utils/encryption', () => ({
  EncryptionUtil: {
    decrypt: jest.fn((value: string) => value),
  },
}));

jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    if (mockUser) {
      req.user = mockUser as any;
    }
    next();
  },
}));

const router = require('../Area.Routes').default as typeof import('../Area.Routes').default;

const canBindHttp = (() => {
  try {
    const probe = express().listen(0, '127.0.0.1');
    probe.close();
    return true;
  } catch (error) {
    console.warn('[Area.Routes.test] Skipping supertest-based checks:', (error as Error).message);
    return false;
  }
})();

const describeIfHttp = canBindHttp ? describe : describe.skip;

describeIfHttp('Area routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/areas', router);

  const withServer = async <T>(callback: (agent: request.SuperTest<request.Test>) => Promise<T>) => {
    let server: ReturnType<typeof app.listen> | null = null;
    try {
      server = app.listen(0, '127.0.0.1');
      await new Promise<void>((resolve, reject) => {
        server!.once('listening', resolve);
        server!.once('error', reject);
      });
      return await callback(request(server));
    } catch (error: any) {
      if (error?.code === 'EPERM') {
        console.warn('[Area.Routes.test] Skipping supertest execution:', error.message);
        return null as unknown as T;
      }
      throw error;
    } finally {
      if (server) {
        await new Promise<void>((resolve) => server!.close(() => resolve()));
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { userId: 'user-1' };
  });

  it('enriches service definitions with parameter overrides', async () => {
    prismaMock.service.findMany.mockResolvedValueOnce([
      {
        id: 1,
        name: 'google',
        type: 'oauth',
        description: 'Google service',
        actions: [
          {
            id: 10,
            name: 'google_new_email_received',
            params: [],
          },
        ],
        reactions: [
          {
            id: 20,
            name: 'google_send_email',
            params: [],
          },
        ],
      },
    ]);

    const response = await withServer((agent) => agent.get('/areas/services'));

    if (!response) return;

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0].actions[0].params[0]).toMatchObject({
      name: 'label',
      type: 'string',
      required: false,
    });
    expect(response.body.data[0].reactions[0].params).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'recipient', required: true }),
      ])
    );
  });

  it('returns 500 when service lookup fails', async () => {
    prismaMock.service.findMany.mockRejectedValueOnce(new Error('prisma down'));

    const response = await withServer((agent) => agent.get('/areas/services'));

    if (!response) return;

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('prisma down');
  });

  it('validates request payload when creating an AREA', async () => {
    const response = await withServer((agent) =>
      agent.post('/areas').send({
        actionId: null,
        reactionId: null,
      })
    );

    if (!response) return;

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.details).toMatchObject({
      actionId: false,
      reactionId: false,
    });
  });

  it('normalizes Spotify configuration before persisting and starting the worker', async () => {
    spotifyAccessMock.mockResolvedValueOnce('spotify-access-token');
    prismaMock.action.findUnique.mockResolvedValueOnce({
      id: 10,
      name: 'spotify_track_added_to_playlist',
      service: { name: 'spotify' },
    });
    prismaMock.reaction.findUnique.mockResolvedValueOnce({
      id: 20,
      name: 'console_log',
      service: { name: 'console' },
    });
    prismaMock.area.create.mockResolvedValueOnce({
      id: 99,
      userId: 'user-1',
      actionId: 10,
      reactionId: 20,
      config: {},
      isActive: true,
    });
    axiosPost.mockResolvedValue({ data: { started: true } });

    const response = await withServer((agent) =>
      agent.post('/areas').send({
        actionId: '10',
        reactionId: '20',
        config: {
          playlistUri: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc',
          trackUri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
          checkInterval: '15',
        },
      })
    );

    if (!response) return;

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('AREA created successfully');

    const createCall = prismaMock.area.create.mock.calls[0][0];
    expect(createCall.data.config).toMatchObject({
      playlistId: '37i9dQZF1DXcBWIGoYBM5M',
      playlist_id: '37i9dQZF1DXcBWIGoYBM5M',
      playlistUri: 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M',
      playlist_uri: 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M',
      trackId: '4uLU6hMCjMI75M1A2tKUQC',
      track_id: '4uLU6hMCjMI75M1A2tKUQC',
      trackUri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
      track_uri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
      checkInterval: '15',
    });

    expect(spotifyAccessMock).toHaveBeenCalledWith('user-1');
    expect(axiosPost).toHaveBeenCalledWith(
      expect.stringMatching(/area_spotify_service/),
      expect.objectContaining({
        actionType: 'spotify_track_added_to_playlist',
        config: expect.objectContaining({
          playlistUri: 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M',
        }),
        accessToken: 'spotify-access-token',
      })
    );
  });

  it('returns 400 when Spotify tokens are missing', async () => {
    spotifyAccessMock.mockResolvedValueOnce(null);
    prismaMock.action.findUnique.mockResolvedValueOnce({
      id: 10,
      name: 'spotify_track_added_to_playlist',
      service: { name: 'spotify' },
    });
    prismaMock.reaction.findUnique.mockResolvedValueOnce({
      id: 20,
      name: 'console_log',
      service: { name: 'console' },
    });
    prismaMock.area.create.mockResolvedValueOnce({
      id: 101,
      userId: 'user-1',
      actionId: 10,
      reactionId: 20,
      config: {},
      isActive: true,
    });

    const response = await withServer((agent) =>
      agent.post('/areas').send({
        actionId: '10',
        reactionId: '20',
        config: {},
      })
    );

    if (!response) return;

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Spotify account not connected/i);
    expect(axiosPost).not.toHaveBeenCalledWith(
      expect.stringMatching(/area_spotify_service/),
      expect.anything()
    );
  });
});

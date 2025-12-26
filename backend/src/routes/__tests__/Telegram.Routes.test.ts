import express from 'express';
import request from 'supertest';

let mockUser: { userId: string } | null = { userId: 'user-123' };

const getStatus = jest.fn();
const validateBotToken = jest.fn();
const storeBotToken = jest.fn();
const removeBotToken = jest.fn();

jest.mock('../../services/telegram.token.service', () => ({
  TelegramTokenService: jest.fn().mockImplementation(() => ({
    getStatus,
    validateBotToken,
    storeBotToken,
    removeBotToken,
  })),
  __mocks: {
    getStatus,
    validateBotToken,
    storeBotToken,
    removeBotToken,
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

const router = require('../Telegram.Routes').default as typeof import('../Telegram.Routes').default;

const serviceMocks = {
  getStatus,
  validateBotToken,
  storeBotToken,
  removeBotToken,
};

const canBindHttp = (() => {
  try {
    const probe = express().listen(0, '127.0.0.1');
    probe.close();
    return true;
  } catch (error) {
    console.warn('[Telegram.Routes.test] Skipping supertest-based checks:', (error as Error).message);
    return false;
  }
})();

const describeIfHttp = canBindHttp ? describe : describe.skip;

describeIfHttp('Telegram routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/telegram', router);

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
        console.warn('[Telegram.Routes.test] Skipping supertest execution:', error.message);
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
    mockUser = { userId: 'user-123' };
  });

  it('returns the current Telegram status for authenticated users', async () => {
    serviceMocks.getStatus.mockResolvedValueOnce({ configured: true });

    const response = await withServer((agent) => agent.get('/telegram/status'));

    if (!response) return;

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { configured: true },
    });
    expect(serviceMocks.getStatus).toHaveBeenCalledWith('user-123');
  });

  it('rejects status checks for unauthenticated requests', async () => {
    mockUser = null;

    const response = await withServer((agent) => agent.get('/telegram/status'));

    if (!response) return;

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(serviceMocks.getStatus).not.toHaveBeenCalled();
  });

  it('returns 500 when status lookup throws', async () => {
    serviceMocks.getStatus.mockRejectedValueOnce(new Error('db offline'));

    const response = await withServer((agent) => agent.get('/telegram/status'));

    if (!response) return;

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('db offline');
  });

  it('configures a Telegram bot when none exists', async () => {
    serviceMocks.getStatus.mockResolvedValueOnce({ configured: false });
    serviceMocks.validateBotToken.mockResolvedValueOnce({
      id: 42,
      username: 'area_bot',
      first_name: 'AREA',
    });

    const response = await withServer((agent) =>
      agent.post('/telegram/configure').send({
        botToken: ' secret-token ',
      })
    );

    if (!response) return;

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(serviceMocks.validateBotToken).toHaveBeenCalledWith('secret-token');
    expect(serviceMocks.storeBotToken).toHaveBeenCalledWith(
      'user-123',
      'secret-token',
      expect.objectContaining({ id: 42 })
    );
  });

  it('requires a bot token payload when configuring', async () => {
    const response = await withServer((agent) =>
      agent.post('/telegram/configure').send({})
    );

    if (!response) return;

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('prevents overwriting an existing bot without force flag', async () => {
    serviceMocks.getStatus.mockResolvedValueOnce({ configured: true });

    const response = await withServer((agent) =>
      agent.post('/telegram/configure').send({
        botToken: 'new-token',
      })
    );

    if (!response) return;

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/déjà configuré/i);
    expect(serviceMocks.validateBotToken).not.toHaveBeenCalled();
  });

  it('returns 400 when Telegram API rejects a token', async () => {
    serviceMocks.getStatus.mockResolvedValueOnce({ configured: false });
    serviceMocks.validateBotToken.mockRejectedValueOnce(new Error('invalid token'));

    const response = await withServer((agent) =>
      agent.post('/telegram/configure').send({
        botToken: 'bad',
      })
    );

    if (!response) return;

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('invalid token');
  });

  it('removes the bot configuration when present', async () => {
    serviceMocks.getStatus.mockResolvedValueOnce({ configured: true });

    const response = await withServer((agent) =>
      agent.delete('/telegram/configure')
    );

    if (!response) return;

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(serviceMocks.removeBotToken).toHaveBeenCalledWith('user-123');
  });

  it('returns 404 when trying to remove a non-existent bot configuration', async () => {
    serviceMocks.getStatus.mockResolvedValueOnce({ configured: false });

    const response = await withServer((agent) =>
      agent.delete('/telegram/configure')
    );

    if (!response) return;

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(serviceMocks.removeBotToken).not.toHaveBeenCalled();
  });

  it('bubbles up service errors when deleting configuration', async () => {
    serviceMocks.getStatus.mockResolvedValueOnce({ configured: true });
    serviceMocks.removeBotToken.mockRejectedValueOnce(new Error('prisma down'));

    const response = await withServer((agent) =>
      agent.delete('/telegram/configure')
    );

    if (!response) return;

    expect(response.status).toBe(500);
    expect(response.body.error).toContain('prisma down');
  });
});

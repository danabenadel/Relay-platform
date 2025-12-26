const axiosGet = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: axiosGet,
  },
  get: axiosGet,
}));

const prismaMock = {
  oAuthToken: {
    findUnique: jest.fn(),
  },
};

jest.mock('../../config/database', () => prismaMock);

const storeOAuthTokens = jest.fn();
const getOAuthTokens = jest.fn();
const revokeServiceTokens = jest.fn();

jest.mock('../../repositories/UserRepository', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    storeOAuthTokens,
    getOAuthTokens,
    revokeServiceTokens,
  })),
}));

const { TelegramTokenService } = require('../telegram.token.service') as typeof import('../telegram.token.service');

describe('TelegramTokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateBotToken', () => {
    it('fetches bot information from Telegram API when token is valid', async () => {
      axiosGet.mockResolvedValueOnce({
        data: {
          ok: true,
          result: {
            id: 42,
            is_bot: true,
            username: 'area_bot',
          },
        },
      });

      const service = new TelegramTokenService();
      const result = await service.validateBotToken('token-123');

      expect(axiosGet).toHaveBeenCalledWith(
        'https://api.telegram.org/bottoken-123/getMe'
      );
      expect(result).toEqual({
        id: 42,
        is_bot: true,
        username: 'area_bot',
      });
    });

    it('throws with API description when Telegram rejects the token', async () => {
      axiosGet.mockResolvedValueOnce({
        data: {
          ok: false,
          description: 'Invalid token from Telegram',
        },
      });

      const service = new TelegramTokenService();

      await expect(service.validateBotToken('bad-token')).rejects.toThrow(
        'Invalid token from Telegram'
      );
    });

    it('wraps upstream errors with meaningful message', async () => {
      axiosGet.mockRejectedValueOnce({
        response: { data: { description: 'Unauthorized' } },
      });

      const service = new TelegramTokenService();

      await expect(service.validateBotToken('bad-token')).rejects.toThrow(
        'Erreur Telegram: Unauthorized'
      );
    });
  });

  describe('storeBotToken', () => {
    it('builds scope metadata and forwards to repository', async () => {
      const service = new TelegramTokenService();

      await service.storeBotToken('user-1', 'token-xyz', {
        id: 123,
        is_bot: true,
        username: 'area_bot',
        first_name: 'AREA',
      });

      expect(storeOAuthTokens).toHaveBeenCalledWith({
        userId: 'user-1',
        serviceName: 'telegram_bot',
        accessToken: 'token-xyz',
        scope: expect.arrayContaining(['telegram_bot', 'bot_id:123', 'username:area_bot']),
        displayName: 'AREA',
        email: '@area_bot',
      });
    });
  });

  describe('getBotToken', () => {
    it('returns stored token value when available', async () => {
      getOAuthTokens.mockResolvedValueOnce({ accessToken: 'stored-token' });

      const service = new TelegramTokenService();
      const token = await service.getBotToken('user-1');

      expect(token).toBe('stored-token');
      expect(getOAuthTokens).toHaveBeenCalledWith('user-1', 'telegram_bot');
    });

    it('returns null when repository has no token', async () => {
      getOAuthTokens.mockResolvedValueOnce(null);

      const service = new TelegramTokenService();
      const token = await service.getBotToken('user-1');

      expect(token).toBeNull();
    });
  });

  describe('removeBotToken', () => {
    it('swallows not-found errors and resolves silently', async () => {
      revokeServiceTokens.mockRejectedValueOnce({ code: 'P2025' });

      const service = new TelegramTokenService();

      await expect(service.removeBotToken('user-1')).resolves.toBeUndefined();
    });

    it('rethrows unexpected repository errors', async () => {
      const error = new Error('database down');
      revokeServiceTokens.mockRejectedValueOnce(error);

      const service = new TelegramTokenService();

      await expect(service.removeBotToken('user-1')).rejects.toThrow('database down');
    });
  });

  describe('getStatus', () => {
    it('returns configured=false when user ID missing or record absent', async () => {
      const service = new TelegramTokenService();

      const anonymousStatus = await service.getStatus('');
      expect(anonymousStatus).toEqual({ configured: false });

      prismaMock.oAuthToken.findUnique.mockResolvedValueOnce(null);
      const missingStatus = await service.getStatus('user-1');
      expect(missingStatus).toEqual({ configured: false });
    });

    it('maps prisma record to status payload with metadata', async () => {
      const updatedAt = new Date('2024-01-02T03:04:05Z');

      prismaMock.oAuthToken.findUnique.mockResolvedValueOnce({
        displayName: 'AREA Bot',
        scope: ['telegram_bot', 'bot_id:987', 'username:area_bot'],
        updatedAt,
      });

      const service = new TelegramTokenService();
      const status = await service.getStatus('user-9');

      expect(prismaMock.oAuthToken.findUnique).toHaveBeenCalledWith({
        where: {
          userId_serviceName: {
            userId: 'user-9',
            serviceName: 'telegram_bot',
          },
        },
      });

      expect(status).toEqual({
        configured: true,
        displayName: 'AREA Bot',
        botId: 987,
        username: 'area_bot',
        updatedAt: updatedAt.toISOString(),
      });
    });
  });

  describe('ensureTokenAvailable', () => {
    it('returns token when present', async () => {
      getOAuthTokens.mockResolvedValueOnce({ accessToken: 'bot-token' });

      const service = new TelegramTokenService();
      const token = await service.ensureTokenAvailable('user-1');

      expect(token).toBe('bot-token');
    });

    it('throws when no token configured', async () => {
      getOAuthTokens.mockResolvedValueOnce(null);

      const service = new TelegramTokenService();

      await expect(service.ensureTokenAvailable('user-1')).rejects.toThrow(
        'Telegram bot not configured'
      );
    });
  });
});

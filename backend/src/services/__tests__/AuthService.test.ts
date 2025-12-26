import { AuthService } from '../AuthService';
import { UserRepository } from '../../repositories/UserRepository';
import { generateAccessToken, generateRefreshToken } from '../jwt.service';
import { storeRefreshToken } from '../token.service';

jest.mock('@prisma/client', () => {
  const userFindUnique = jest.fn();
  const userCreate = jest.fn();
  const oAuthFindMany = jest.fn();

  const PrismaClientMock = jest.fn().mockImplementation(() => ({
    user: {
      findUnique: userFindUnique,
      create: userCreate,
    },
    oAuthToken: {
      findMany: oAuthFindMany,
    },
  }));

  return {
    PrismaClient: PrismaClientMock,
    __mocked: {
      userFindUnique,
      userCreate,
      oAuthFindMany,
    },
  };
});

const prismaMocks = jest.requireMock('@prisma/client').__mocked as {
  userFindUnique: jest.Mock;
  userCreate: jest.Mock;
  oAuthFindMany: jest.Mock;
};

const prismaUserFindUniqueMock = prismaMocks.userFindUnique;
const prismaUserCreateMock = prismaMocks.userCreate;
const prismaOAuthFindManyMock = prismaMocks.oAuthFindMany;

jest.mock('../jwt.service', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

jest.mock('../token.service', () => ({
  storeRefreshToken: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();

    authService = new AuthService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerUser', () => {
    it('creates a new user, generates tokens, stores refresh token, and logs the action', async () => {
      prismaUserFindUniqueMock.mockResolvedValue(null);
      prismaUserCreateMock.mockResolvedValue({
        id: 'user-id',
        email: 'newuser@example.com',
        emailVerified: false,
        name: 'New User',
      });
      (generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      const logActionSpy = jest
        .spyOn(UserRepository.prototype, 'logUserAction')
        .mockResolvedValue();

      const result = await authService.registerUser(
        {
          email: 'NewUser@Example.com',
          password: 'Password123',
          name: 'New User',
        },
        '127.0.0.1',
        'jest-agent'
      );

      expect(prismaUserFindUniqueMock).toHaveBeenCalledWith({
        where: { email: 'newuser@example.com' },
      });
      expect(prismaUserCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'newuser@example.com',
          name: 'New User',
        }),
      });
      expect(generateAccessToken).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'newuser@example.com',
      });
      expect(generateRefreshToken).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'newuser@example.com',
      });
      expect(storeRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(logActionSpy).toHaveBeenCalledWith({
        userId: 'user-id',
        action: 'register',
        ipAddress: '127.0.0.1',
        userAgent: 'jest-agent',
        metadata: { method: 'email_password' },
      });
      expect(result).toEqual({
        token: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'newuser@example.com',
          emailVerified: false,
          name: 'New User',
        },
      });
    });

    it('throws when a user already exists with the email', async () => {
      prismaUserFindUniqueMock.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.registerUser(
          {
            email: 'existing@example.com',
            password: 'Password123',
          },
          '127.0.0.1'
        )
      ).rejects.toThrow('User already exists with this email');
    });
  });

  describe('loginUser', () => {
    it('returns tokens and logs login when credentials are valid', async () => {
      jest
        .spyOn(UserRepository.prototype, 'validatePassword')
        .mockResolvedValue({
          id: 'user-id',
          email: 'user@example.com',
          emailVerified: true,
        });
      const logActionSpy = jest
        .spyOn(UserRepository.prototype, 'logUserAction')
        .mockResolvedValue();
      (generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      const result = await authService.loginUser(
        { email: 'user@example.com', password: 'Password123' },
        '192.168.0.1',
        'browser-agent'
      );

      expect(UserRepository.prototype.validatePassword).toHaveBeenCalledWith(
        'user@example.com',
        'Password123'
      );
      expect(storeRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(logActionSpy).toHaveBeenCalledWith({
        userId: 'user-id',
        action: 'login',
        ipAddress: '192.168.0.1',
        userAgent: 'browser-agent',
      });
      expect(result).toEqual({
        token: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'user@example.com',
          emailVerified: true,
          name: '',
        },
      });
    });

    it('throws when credentials are invalid', async () => {
      jest
        .spyOn(UserRepository.prototype, 'validatePassword')
        .mockResolvedValue(null);

      await expect(
        authService.loginUser(
          { email: 'user@example.com', password: 'wrong' },
          '127.0.0.1'
        )
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('user getters', () => {
    it('fetches user by id and maps result', async () => {
      jest.spyOn(UserRepository.prototype, 'findUserById').mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: true,
        name: 'User',
      } as any);

      const result = await authService.getUserById('user-id');

      expect(UserRepository.prototype.findUserById).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: true,
        name: 'User',
      });
    });

    it('returns null when user not found by email', async () => {
      jest.spyOn(UserRepository.prototype, 'findUserByEmail').mockResolvedValue(null);

      const result = await authService.getUserByEmail('missing@example.com');

      expect(UserRepository.prototype.findUserByEmail).toHaveBeenCalledWith('missing@example.com');
      expect(result).toBeNull();
    });
  });

  describe('OAuth flows', () => {
    it('stores tokens and logs action when connecting oauth service', async () => {
      const storeTokensSpy = jest
        .spyOn(UserRepository.prototype, 'storeOAuthTokens')
        .mockResolvedValue();
      const logActionSpy = jest
        .spyOn(UserRepository.prototype, 'logUserAction')
        .mockResolvedValue();

      await authService.connectOAuthService(
        'user-id',
        {
          serviceName: 'github',
          accessToken: 'access',
          scope: ['repo'],
        },
        '10.0.0.1',
        'cli'
      );

      expect(storeTokensSpy).toHaveBeenCalledWith({
        userId: 'user-id',
        serviceName: 'github',
        accessToken: 'access',
        scope: ['repo'],
      });
      expect(logActionSpy).toHaveBeenCalledWith({
        userId: 'user-id',
        action: 'oauth_connect',
        ipAddress: '10.0.0.1',
        userAgent: 'cli',
        metadata: { service: 'github' },
      });
    });

    it('lists stored oauth tokens from prisma', async () => {
      const tokenRecord = {
        serviceName: 'github',
        email: 'user@example.com',
        displayName: 'User',
        scope: ['repo'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaOAuthFindManyMock.mockResolvedValue([tokenRecord]);

      const tokens = await authService.listOAuthTokens('user-id');

      expect(prismaOAuthFindManyMock).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        select: {
          serviceName: true,
          email: true,
          displayName: true,
          scope: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(tokens).toEqual([tokenRecord]);
    });
  });
});

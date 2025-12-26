import { UserRepository } from '../UserRepository';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';
import { EncryptionUtil } from '../../utils/encryption';

jest.mock('../../config/database', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  oAuthToken: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('../../utils/encryption', () => ({
  EncryptionUtil: {
    encrypt: jest.fn((value: string) => `encrypted:${value}`),
    decrypt: jest.fn((value: string) => value.replace('encrypted:', '')),
  },
}));

type PrismaMock = {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  oAuthToken: {
    upsert: jest.Mock;
    findUnique: jest.Mock;
    delete: jest.Mock;
  };
  auditLog: {
    create: jest.Mock;
    findMany: jest.Mock;
  };
};

const prismaMock = prisma as unknown as PrismaMock;
const bcryptMock = bcrypt as unknown as {
  hash: jest.Mock;
  compare: jest.Mock;
};

describe('UserRepository', () => {
  const repository = new UserRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('creates a new user with sanitized email and hashed password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      bcryptMock.hash.mockResolvedValue('hashed-password');

      const result = await repository.createUser({
        email: 'User@Example.com',
        password: 'Password123',
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(bcryptMock.hash).toHaveBeenCalledWith(
        'Password123',
        expect.any(Number)
      );
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'user@example.com',
          passwordHash: 'hashed-password',
        }),
        select: expect.any(Object),
      });
      expect(result.email).toBe('user@example.com');
    });

    it('throws when email format is invalid', async () => {
      await expect(
        repository.createUser({
          email: 'invalid-email',
          password: 'Password123',
        })
      ).rejects.toThrow('Invalid email format');
    });

    it('throws when user already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        repository.createUser({
          email: 'existing@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow('User already exists with this email');
    });
  });

  describe('validatePassword', () => {
    it('returns user data when credentials match', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: true,
        passwordHash: 'hashed',
      });
      bcryptMock.compare.mockResolvedValue(true);

      const result = await repository.validatePassword(
        'user@example.com',
        'Password123'
      );

      expect(bcryptMock.compare).toHaveBeenCalledWith(
        'Password123',
        'hashed'
      );
      expect(result).toEqual({
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: true,
      });
    });

    it('returns null when password is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: true,
        passwordHash: 'hashed',
      });
      bcryptMock.compare.mockResolvedValue(false);

      const result = await repository.validatePassword(
        'user@example.com',
        'wrong-password'
      );

      expect(result).toBeNull();
    });
  });

  describe('storeOAuthTokens', () => {
    it('persists encrypted oauth tokens', async () => {
      prismaMock.oAuthToken.upsert.mockResolvedValue(undefined);

      await repository.storeOAuthTokens({
        userId: 'user-id',
        serviceName: 'github',
        accessToken: 'access-value',
        refreshToken: 'refresh-value',
        scope: ['repo'],
        email: 'user@example.com',
        displayName: 'User',
      });

      expect(EncryptionUtil.encrypt).toHaveBeenCalledWith('access-value');
      expect(EncryptionUtil.encrypt).toHaveBeenCalledWith('refresh-value');
      expect(prismaMock.oAuthToken.upsert).toHaveBeenCalledWith({
        where: {
          userId_serviceName: {
            userId: 'user-id',
            serviceName: 'github',
          },
        },
        update: expect.objectContaining({
          accessToken: 'encrypted:access-value',
          refreshToken: 'encrypted:refresh-value',
          email: 'user@example.com',
          displayName: 'User',
        }),
        create: expect.objectContaining({
          accessToken: 'encrypted:access-value',
          refreshToken: 'encrypted:refresh-value',
        }),
      });
    });
  });
});

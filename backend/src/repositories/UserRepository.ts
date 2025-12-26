import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { CreateUserData, OAuthTokenData, UserWithTokens } from '../types/auth';
import { AuditLogData, OAuth2Provider } from '../types/common';
import { EncryptionUtil } from '../utils/encryption';
import { ValidationUtil } from '../utils/validation';

export class UserRepository {
  private static readonly SALT_ROUNDS = 12;

  async createUser(userData: CreateUserData): Promise<any> {
    const { email, password } = userData;
    
    if (!ValidationUtil.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (password && !ValidationUtil.isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase and number');
    }

    const sanitizedEmail = ValidationUtil.sanitizeString(email);
    
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, UserRepository.SALT_ROUNDS);
    }

    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        passwordHash,
        emailVerified: !password
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  async findUserByEmail(email: string): Promise<any | null> {
    const sanitizedEmail = ValidationUtil.sanitizeString(email);
    
    return await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: {
        oauthTokens: true
      }
    });
  }

   async findUserById(userId: string): Promise<UserWithTokens | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        oauthTokens: {
          select: {
            id: true,
            serviceName: true,
            email: true,
            displayName: true,
            expiresAt: true,
            scope: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      oauthTokens: user.oauthTokens.map((token: any) => ({
        userId: user.id,
        serviceName: token.serviceName,
        email: token.email,
        displayName: token.displayName,
        accessToken: "",
        refreshToken: undefined,
        expiresAt: token.expiresAt,
        scope: token.scope
      }))
    };
  }

  async validatePassword(email: string, password: string): Promise<any | null> {
    const user = await prisma.user.findUnique({
      where: { email: ValidationUtil.sanitizeString(email) }
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified
    };
  }


  async storeOAuthTokens(tokenData: OAuthTokenData): Promise<void> {
    const {
      userId,
      serviceName,
      accessToken,
      refreshToken,
      expiresAt,
      scope,
      email,
      displayName,
    } = tokenData;

    const encryptedAccessToken = EncryptionUtil.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? EncryptionUtil.encrypt(refreshToken) : null;
    const normalizedScope = Array.isArray(scope) ? scope : [];

    const updateData: any = {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt,
      scope: normalizedScope,
      updatedAt: new Date(),
    };

    if (email !== undefined) {
      updateData.email = email;
    }

    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }

    await prisma.oAuthToken.upsert({
      where: {
        userId_serviceName: {
          userId,
          serviceName
        }
      },
      update: {
        ...updateData
      },
      create: {
        userId,
        serviceName,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        scope: normalizedScope,
        email,
        displayName
      }
    });
  }

  async getOAuthTokens(userId: string, serviceName: string): Promise<OAuthTokenData | null> {
    const tokenRecord = await prisma.oAuthToken.findUnique({
      where: {
        userId_serviceName: {
          userId,
          serviceName
        }
      }
    });

    if (!tokenRecord) return null;

    const accessToken = EncryptionUtil.decrypt(tokenRecord.accessToken);
    const refreshToken = tokenRecord.refreshToken 
      ? EncryptionUtil.decrypt(tokenRecord.refreshToken) 
      : undefined;

    return {
      userId: tokenRecord.userId,
      serviceName: tokenRecord.serviceName,
      accessToken,
      refreshToken,
      expiresAt: tokenRecord.expiresAt || undefined,
      scope: tokenRecord.scope
    };
  }

  async refreshExpiredTokens(userId: string, serviceName: string): Promise<boolean> {
    const tokenData = await this.getOAuthTokens(userId, serviceName);
    
    if (!tokenData || !tokenData.expiresAt || !tokenData.refreshToken) {
      return false;
    }

    if (new Date() < tokenData.expiresAt) {
      return true;
    }

    return false;
  }

  async revokeServiceTokens(userId: string, serviceName: string): Promise<void> {
    await prisma.oAuthToken.delete({
      where: {
        userId_serviceName: {
          userId,
          serviceName
        }
      }
    });
  }


  async logUserAction(auditData: AuditLogData): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: auditData.userId,
        action: auditData.action,
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent,
        metadata: auditData.metadata
      }
    });
  }

  async getUserAuditLogs(userId: string, limit = 50): Promise<any[]> {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        ipAddress: true,
        userAgent: true,
        metadata: true,
        createdAt: true
      }
    });
  }
}

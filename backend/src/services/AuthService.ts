import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { generateAccessToken, generateRefreshToken } from './jwt.service';
import { storeRefreshToken } from './token.service';
import {
  CreateUserData,
  LoginData,
  AuthResponse,
  OAuthTokenData,
} from '../types/auth';

const prisma = new PrismaClient();

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async registerUser(
    data: CreateUserData,
    ipAddress: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    // Sanitize email to ensure consistency (trim and lowercase)
    const sanitizedEmail = data.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, 10)
      : null;
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        passwordHash: hashedPassword,
        name: data.name || null,
      },
    });

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      sub: user.id,
      email: user.email,
    });

    storeRefreshToken(refreshToken);
    await this.userRepository.logUserAction({
      userId: user.id,
      action: 'register',
      ipAddress,
      userAgent,
      metadata: { method: data.password ? 'email_password' : 'oauth' },
    });

    return {
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name || '',
      },
    };
  }

  async loginUser(
    loginData: LoginData,
    ipAddress: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    const user = await this.userRepository.validatePassword(
      loginData.email,
      loginData.password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      sub: user.id,
      email: user.email,
    });

    storeRefreshToken(refreshToken);

    await this.userRepository.logUserAction({
      userId: user.id,
      action: 'login',
      ipAddress,
      userAgent,
    });

    return {
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name || '',
      },
    };
  }

  async getUserProfile(userId: string) {
    return await this.userRepository.findUserById(userId);
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: (user as any).name || '',
    };
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name || '',
    };
  }

  async connectOAuthService(
    userId: string,
    tokenData: Omit<OAuthTokenData, 'userId'>,
    ipAddress: string,
    userAgent?: string
  ): Promise<void> {
    const completeTokenData: OAuthTokenData = {
      ...tokenData,
      userId,
    };

    await this.userRepository.storeOAuthTokens(completeTokenData);

    await this.userRepository.logUserAction({
      userId,
      action: 'oauth_connect',
      ipAddress,
      userAgent,
      metadata: { service: tokenData.serviceName },
    });
  }

  async disconnectOAuthService(
    userId: string,
    serviceName: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<void> {
    await this.userRepository.revokeServiceTokens(userId, serviceName);

    await this.userRepository.logUserAction({
      userId,
      action: 'oauth_disconnect',
      ipAddress,
      userAgent,
      metadata: { service: serviceName },
    });
  }

  async listOAuthTokens(userId: string) {
    return await prisma.oAuthToken.findMany({
      where: { userId },
      select: {
        serviceName: true,
        email: true,
        displayName: true,
        scope: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
}

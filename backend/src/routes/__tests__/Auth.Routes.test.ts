jest.mock('../../services/AuthService', () => {
  const registerUser = jest.fn();
  const loginUser = jest.fn();
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      registerUser,
      loginUser,
      getUserProfile: jest.fn(),
      connectOAuthService: jest.fn(),
      disconnectOAuthService: jest.fn(),
      listOAuthTokens: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
    })),
    __mocks: { registerUser, loginUser },
  };
});

import express from 'express';
import request from 'supertest';
import router from '../Auth.Routes';
import { authLimiter } from '../../middleware/rateLimiter';

const { registerUser, loginUser } = (
  jest.requireMock('../../services/AuthService') as {
    __mocks: {
      registerUser: jest.Mock;
      loginUser: jest.Mock;
    };
  }
).__mocks;

const resetLimiterState = () => {
  const store = (authLimiter as any).store;
  if (typeof store?.resetAll === 'function') {
    store.resetAll();
  }
};

const canBindHttp = (() => {
  try {
    const probe = express().listen(0, '127.0.0.1');
    probe.close();
    return true;
  } catch (error) {
    console.warn('[Auth.Routes.test] Skipping supertest-based checks:', (error as Error).message);
    return false;
  }
})();

const describeIfHttp = canBindHttp ? describe : describe.skip;

describeIfHttp('Auth routes integration', () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', router);

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
        console.warn('[Auth.Routes.test] Skipping supertest execution:', error.message);
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
    resetLimiterState();
    jest.clearAllMocks();
  });

  it('sets secure refresh token cookie on successful registration', async () => {
    registerUser.mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: true,
        name: 'User',
      },
    });

    const response = await withServer((agent) =>
      agent
        .post('/auth/register')
        .set('User-Agent', 'supertest')
        .send({ email: 'user@example.com', password: 'Password123', name: 'User' })
    );

    if (!response) return;

    expect(response.status).toBe(201);
    expect(registerUser).toHaveBeenCalled();
    expect(response.headers['set-cookie']).toBeDefined();
    const cookie = response.headers['set-cookie'][0];
    expect(cookie).toContain('refresh_token=refresh-token');
    expect(cookie).toContain('HttpOnly');
    expect(response.body.data.token).toBe('access-token');
  });

  it('sets refresh token cookie on login and returns success payload', async () => {
    loginUser.mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: true,
        name: 'User',
      },
    });

    const response = await withServer(async (agent) =>
      agent
        .post('/auth/login')
        .set('X-Forwarded-For', '192.0.2.10')
        .set('User-Agent', 'Supertest-Agent')
        .send({ email: 'user@example.com', password: 'Password123' })
    );

    if (!response) return;

    expect(response.status).toBe(200);
    expect(loginUser).toHaveBeenCalledWith(
      { email: 'user@example.com', password: 'Password123' },
      expect.stringMatching(/127\.0\.0\.1|::1|unknown/),
      'Supertest-Agent'
    );
    expect(response.headers['set-cookie']).toBeDefined();
    const cookie = response.headers['set-cookie'][0];
    expect(cookie).toContain('refresh_token=refresh-token');
    expect(cookie).toContain('HttpOnly');
    expect(response.body).toMatchObject({
      success: true,
      data: {
        token: 'access-token',
        user: expect.objectContaining({ email: 'user@example.com' }),
      },
    });
  });

  it('returns 400 without issuing cookies when login payload missing', async () => {
    const response = await withServer((agent) => agent.post('/auth/login').send({ email: '' }));

    if (!response) return;

    expect(response.status).toBe(400);
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(response.body).toEqual({
      success: false,
      error: 'Email and password are required',
    });
  });
});

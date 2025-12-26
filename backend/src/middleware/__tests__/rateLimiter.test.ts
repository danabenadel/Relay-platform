import express from 'express';
import request from 'supertest';
import { authLimiter } from '../rateLimiter';

const resetLimiterState = () => {
  const store = (authLimiter as any).store;
  if (typeof store?.resetAll === 'function') {
    store.resetAll();
  } else if (typeof store?.resetKey === 'function') {
    store.resetKey('::ffff:127.0.0.1');
    store.resetKey('127.0.0.1');
  }
};

const canBindHttp = (() => {
  try {
    const probe = express().listen(0, '127.0.0.1');
    probe.close();
    return true;
  } catch (error) {
    console.warn('[rateLimiter.test] Skipping supertest-based checks:', (error as Error).message);
    return false;
  }
})();

const describeIfHttp = canBindHttp ? describe : describe.skip;

describeIfHttp('authLimiter middleware', () => {
  const app = express();
  app.get('/login', authLimiter, (_req, res) => {
    res.json({ success: true });
  });

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
        console.warn('[rateLimiter.test] Skipping supertest execution:', error.message);
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
  });

  afterAll(() => {
    resetLimiterState();
  });

  it('enforces request limits and returns 429 after threshold', async () => {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const res = await withServer((agent) => agent.get('/login'));
      if (!res) return;
      expect(res.status).toBe(200);
      expect(res.headers['ratelimit-limit']).toBe('5');
      expect(Number(res.headers['ratelimit-remaining'])).toBeGreaterThanOrEqual(0);
    }

    const blocked = await withServer((agent) => agent.get('/login'));
    if (!blocked) return;

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      success: false,
      error: 'Too many authentication attempts, try again later',
    });
    expect(blocked.headers['ratelimit-remaining']).toBe('0');
    expect(blocked.headers).toHaveProperty('retry-after');
  });
});

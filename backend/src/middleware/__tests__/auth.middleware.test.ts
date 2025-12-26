import { authenticateToken, optionalAuth } from '../auth';
import { verifyToken } from '../../services/jwt.service';

jest.mock('../../services/jwt.service', () => ({
  verifyToken: jest.fn(),
}));

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
};

const createResponse = (): MockResponse => {
  const res: MockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return res;
};

describe('auth middleware security', () => {
  const next = jest.fn();
  const verifyTokenMock = verifyToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects requests without bearer token', () => {
    const req = { headers: {} } as any;
    const res = createResponse();

    authenticateToken(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Access token required',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid tokens', () => {
    verifyTokenMock.mockReturnValueOnce(null);
    const req = {
      headers: { authorization: 'Bearer invalid-token' },
    } as any;
    const res = createResponse();

    authenticateToken(req, res as any, next);

    expect(verifyTokenMock).toHaveBeenCalledWith('invalid-token');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid or expired token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches user payload for valid tokens', () => {
    verifyTokenMock.mockReturnValueOnce({
      sub: 'user-id',
      email: 'user@example.com',
      iat: 1,
      exp: 2,
    });

    const req: any = {
      headers: { authorization: 'Bearer secure-token' },
    };
    const res = createResponse();

    authenticateToken(req, res as any, next);

    expect(req.user).toEqual({
      userId: 'user-id',
      email: 'user@example.com',
      iat: 1,
      exp: 2,
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('optionalAuth does not block when token invalid', () => {
    verifyTokenMock.mockReturnValueOnce(null);
    const req: any = {
      headers: { authorization: 'Bearer invalid-token' },
    };

    optionalAuth(req, {} as any, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});

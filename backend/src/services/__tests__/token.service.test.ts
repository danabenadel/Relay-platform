import {
  storeRefreshToken,
  isRefreshTokenValid,
  revokeRefreshToken,
} from '../token.service';

describe('token.service security', () => {
  const token = 'secure-refresh-token';

  afterEach(() => {
    revokeRefreshToken(token);
  });

  it('stores and validates refresh tokens', () => {
    expect(isRefreshTokenValid(token)).toBe(false);
    storeRefreshToken(token);
    expect(isRefreshTokenValid(token)).toBe(true);
  });

  it('revokes refresh tokens', () => {
    storeRefreshToken(token);
    revokeRefreshToken(token);
    expect(isRefreshTokenValid(token)).toBe(false);
  });
});

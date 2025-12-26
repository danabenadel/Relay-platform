const refreshTokensStore = new Set<string>();

export const storeRefreshToken = (token: string) => {
  refreshTokensStore.add(token);
};

export const isRefreshTokenValid = (token: string): boolean => {
  return refreshTokensStore.has(token);
};

export const revokeRefreshToken = (token: string) => {
  refreshTokensStore.delete(token);
};

const ALLOWED_REDIRECT_URIS = [
  process.env.GOOGLE_REDIRECT_URI,
  process.env.GITHUB_REDIRECT_URI,
  process.env.FACEBOOK_REDIRECT_URI,
];

export const validateRedirectUri = (uri: string): boolean => {
  return ALLOWED_REDIRECT_URIS.includes(uri);
};

export const validateOAuthState = (state: string): boolean => {
  return /^[a-f0-9]{64}$/i.test(state);
};
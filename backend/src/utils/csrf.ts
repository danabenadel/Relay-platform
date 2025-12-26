import * as crypto from 'crypto';

interface CSRFToken {
  token: string;
  expires: number;
  createdAt: number;
}

const csrfTokens = new Map<string, CSRFToken>();

const isDevelopment = process.env.NODE_ENV !== 'production';
const DISABLE_CSRF_IN_DEV = process.env.DISABLE_CSRF === 'true';

const TOKEN_EXPIRATION = isDevelopment
  ? 24 * 60 * 60 * 1000
  : 30 * 60 * 1000;

export const generateCSRFToken = (): string => {
  const state = crypto.randomBytes(32).toString('hex');

  csrfTokens.set(state, {
    token: state,
    expires: Date.now() + TOKEN_EXPIRATION,
    createdAt: Date.now()
  });

  cleanupExpiredTokens();

  console.log(`[CSRF] Token generated: ${state.substring(0, 8)}... (expires in ${TOKEN_EXPIRATION / 1000 / 60} minutes)`);

  return state;
};


export const validateCSRFToken = (state: string): boolean => {
  if (isDevelopment && DISABLE_CSRF_IN_DEV) {
    console.log('[CSRF] VALIDATION BYPASSED (development mode with DISABLE_CSRF=true)');
    return true;
  }

  if (!state) {
    console.error('[CSRF] Validation failed: No state provided');
    return false;
  }

  const actualToken = state.includes(':') ? state.split(':')[0] : state;

  const stored = csrfTokens.get(actualToken);

  if (!stored) {
    console.warn(`[CSRF] Token not found: ${actualToken.substring(0, 8)}...`);
    console.warn(`[CSRF] Active tokens count: ${csrfTokens.size}`);

    if (isDevelopment) {
      console.warn('[CSRF] Development mode: Allowing missing token');
      return true;
    }

    return false;
  }

  if (stored.expires < Date.now()) {
    const ageMinutes = Math.floor((Date.now() - stored.createdAt) / 1000 / 60);
    console.warn(`[CSRF] Token expired: ${actualToken.substring(0, 8)}... (age: ${ageMinutes} minutes)`);
    csrfTokens.delete(actualToken);

    if (isDevelopment) {
      console.warn('[CSRF] Development mode: Allowing expired token');
      return true;
    }

    return false;
  }

  if (!isDevelopment) {
    csrfTokens.delete(actualToken);
  }

  console.log(`[CSRF] Token validated: ${actualToken.substring(0, 8)}... (mode: ${isDevelopment ? 'development' : 'production'})`);

  return true;
};

const cleanupExpiredTokens = (): void => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of Array.from(csrfTokens.entries())) {
    if (value.expires < now) {
      csrfTokens.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[CSRF] Cleaned ${cleaned} expired tokens`);
  }
};

export const getActiveTokensCount = (): number => {
  return csrfTokens.size;
};

export const clearAllTokens = (): void => {
  csrfTokens.clear();
  console.log('[CSRF] All tokens cleared');
};
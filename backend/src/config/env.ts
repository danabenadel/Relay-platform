import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  DATABASE_URL: string;
  PORT: number;
  NODE_ENV: string;
  ENCRYPTION_KEY: string;

  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
  
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_REDIRECT_URI?: string;
  
  FACEBOOK_CLIENT_ID?: string;
  FACEBOOK_CLIENT_SECRET?: string;
  FACEBOOK_REDIRECT_URI?: string;

  SPOTIFY_CLIENT_ID?: string;
  SPOTIFY_CLIENT_SECRET?: string;
  SPOTIFY_REDIRECT_URI?: string;

  NOTION_CLIENT_ID?: string;
  NOTION_CLIENT_SECRET?: string;
  NOTION_REDIRECT_URI?: string;
}

const validateEnv = (): EnvConfig => {
  const required = ['DATABASE_URL', 'ENCRYPTION_KEY'];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  
  if (process.env.ENCRYPTION_KEY!.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
  }
  
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    PORT: parseInt(process.env.PORT || '8080'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
    
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_REDIRECT_URI: process.env.GITHUB_REDIRECT_URI,
    
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
    FACEBOOK_REDIRECT_URI: process.env.FACEBOOK_REDIRECT_URI,

    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,

    NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID,
    NOTION_CLIENT_SECRET: process.env.NOTION_CLIENT_SECRET,
    NOTION_REDIRECT_URI: process.env.NOTION_REDIRECT_URI,
  };
};

export const config = validateEnv();

export const hasOAuthProvider = (): boolean => {
  return !!(
    (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) ||
    (config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET) ||
    (config.FACEBOOK_CLIENT_ID && config.FACEBOOK_CLIENT_SECRET) ||
    (config.SPOTIFY_CLIENT_ID && config.SPOTIFY_CLIENT_SECRET) ||
    (config.NOTION_CLIENT_ID && config.NOTION_CLIENT_SECRET)
  );
};

export const isProviderConfigured = (provider: 'google' | 'github' | 'facebook' | 'spotify' | 'notion'): boolean => {
  switch (provider) {
    case 'google':
      return !!(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET);
    case 'github':
      return !!(config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET);
    case 'facebook':
      return !!(config.FACEBOOK_CLIENT_ID && config.FACEBOOK_CLIENT_SECRET);
    case 'spotify':
      return !!(config.SPOTIFY_CLIENT_ID && config.SPOTIFY_CLIENT_SECRET);
    case 'notion':
      return !!(config.NOTION_CLIENT_ID && config.NOTION_CLIENT_SECRET);
  }
};

import axios from "axios";
import { generateCSRFToken } from "../utils/csrf";

const checkGoogleConfig = () => {
  if (!process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_ID.includes('your_') ||
      process.env.GOOGLE_CLIENT_SECRET.includes('your_')) {
    throw new Error('Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file. See OAUTH_SETUP.md for instructions.');
  }
};

const checkGitHubConfig = () => {
  if (!process.env.GITHUB_CLIENT_ID ||
      !process.env.GITHUB_CLIENT_SECRET ||
      process.env.GITHUB_CLIENT_ID.includes('your_') ||
      process.env.GITHUB_CLIENT_SECRET.includes('your_')) {
    throw new Error('GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env file. See OAUTH_SETUP.md for instructions.');
  }
};

const checkFacebookConfig = () => {
  if (!process.env.FACEBOOK_CLIENT_ID ||
      !process.env.FACEBOOK_CLIENT_SECRET ||
      process.env.FACEBOOK_CLIENT_ID.includes('your_') ||
      process.env.FACEBOOK_CLIENT_SECRET.includes('your_')) {
    throw new Error('Facebook OAuth not configured. Please set FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET in .env file. See OAUTH_SETUP.md for instructions.');
  }
};

const checkNotionConfig = () => {
  if (!process.env.NOTION_CLIENT_ID ||
      !process.env.NOTION_CLIENT_SECRET) {
    throw new Error('Notion OAuth not configured. Please set NOTION_CLIENT_ID and NOTION_CLIENT_SECRET in .env file. See OAUTH_SETUP.md for instructions.');
  }
};

export const getGoogleAuthURL = (source?: string): string => {
  checkGoogleConfig();

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  let state = generateCSRFToken();

  if (source) {
    const encodedSource = Buffer.from(source).toString('base64');
    state = `${state}:${encodedSource}`;
  }

  const options = {
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/auth/oauth/google/callback',
    response_type: "code",
    scope: "openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl",
    access_type: "offline",
    prompt: "consent",
    state
  };

  const url = `${rootUrl}?${new URLSearchParams(options).toString()}`;
  console.log(`[OAuth Google] Redirect URL generated with state: ${state.substring(0, 20)}...`);

  return url;
};

export const getGoogleTokens = async (code: string) => {
  checkGoogleConfig();
  
  try {
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/auth/oauth/google/callback',
      grant_type: "authorization_code"
    });

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in 
        ? new Date(Date.now() + data.expires_in * 1000) 
        : undefined,
      scope: data.scope?.split(' ') || []
    };
  } catch (error: any) {
    console.error('[OAuth Google] Token error:', error.response?.data || error.message);
    throw new Error('Failed to get Google tokens');
  }
};

export const getGoogleUser = async (code: string) => {
  checkGoogleConfig();
  
  try {
    const tokens = await getGoogleTokens(code);

    const googleUser = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    console.log(`[OAuth Google] User retrieved: ${googleUser.data.email}`);
    
    return {
      ...googleUser.data,
      oauth_tokens: tokens
    };
  } catch (error: any) {
    console.error('[OAuth Google] Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Google');
  }
};

export const getGitHubAuthURL = (source?: string): string => {
  checkGitHubConfig();

  const rootUrl = "https://github.com/login/oauth/authorize";
  let state = generateCSRFToken();

  if (source) {
    const encodedSource = Buffer.from(source).toString('base64');
    state = `${state}:${encodedSource}`;
  }

  const options = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:8080/auth/oauth/github/callback',
    scope: "read:user user:email repo",
    state
  };

  const url = `${rootUrl}?${new URLSearchParams(options).toString()}`;
  console.log(`[OAuth GitHub] Redirect URL generated with state: ${state.substring(0, 20)}...`);

  return url;
};

export const getGitHubTokens = async (code: string) => {
  checkGitHubConfig();
  
  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:8080/auth/oauth/github/callback'
      },
      { headers: { Accept: "application/json" } }
    );

    return {
      access_token: tokenResponse.data.access_token,
      refresh_token: tokenResponse.data.refresh_token,
      expires_at: tokenResponse.data.expires_in 
        ? new Date(Date.now() + tokenResponse.data.expires_in * 1000) 
        : undefined,
      scope: tokenResponse.data.scope?.split(' ') || []
    };
  } catch (error: any) {
    console.error('[OAuth GitHub] Token error:', error.response?.data || error.message);
    throw new Error('Failed to get GitHub tokens');
  }
};

export const getGitHubUser = async (code: string) => {
  checkGitHubConfig();
  
  try {
    const tokens = await getGitHubTokens(code);

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    console.log(`[OAuth GitHub] User retrieved: ${userResponse.data.login}`);
    
    return {
      ...userResponse.data,
      oauth_tokens: tokens
    };
  } catch (error: any) {
    console.error('[OAuth GitHub] Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with GitHub');
  }
};

const checkSpotifyConfig = () => {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify OAuth not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET');
  }
};

export const getSpotifyAuthURL = (source?: string): string => {
  checkSpotifyConfig();

  const rootUrl = "https://accounts.spotify.com/authorize";
  let state = generateCSRFToken();

  if (source) {
    const encodedSource = Buffer.from(source).toString('base64');
    state = `${state}:${encodedSource}`;
  }

  const options = {
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:8080/auth/oauth/spotify/callback',
    response_type: "code",
    scope: [
      "user-read-email",
      "user-read-private",
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "user-read-recently-played",
      "playlist-read-private",
      "playlist-read-collaborative",
      "playlist-modify-public",
      "playlist-modify-private",
      "user-library-read",
      "user-library-modify",
      "user-top-read",
      "user-follow-read",
      "user-follow-modify"
    ].join(" "),
    state,
    show_dialog: "true"
  };

  const url = `${rootUrl}?${new URLSearchParams(options).toString()}`;
  console.log(`[OAuth Spotify] Redirect URL generated with state: ${state}`);

  return url;
};

export const getSpotifyTokens = async (code: string) => {
  checkSpotifyConfig();

  try {
    const authString = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const { data } = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:8080/auth/oauth/spotify/callback',
        grant_type: "authorization_code"
      }),
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope?.split(' ') || []
    };
  } catch (error: any) {
    console.error('[OAuth Spotify] Token error:', error.response?.data || error.message);
    throw new Error('Failed to get Spotify tokens');
  }
};

export const refreshSpotifyToken = async (refreshToken: string) => {
  checkSpotifyConfig();

  try {
    const authString = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const { data } = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
      }),
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expires_at: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope?.split(' ') || []
    };
  } catch (error: any) {
    console.error('[OAuth Spotify] Refresh token error:', error.response?.data || error.message);
    throw new Error('Failed to refresh Spotify token');
  }
};

export const getSpotifyUser = async (code: string) => {
  checkSpotifyConfig();

  try {
    const tokens = await getSpotifyTokens(code);

    const userResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    console.log(`[OAuth Spotify] User retrieved: ${userResponse.data.email || userResponse.data.id}`);

    return {
      ...userResponse.data,
      oauth_tokens: tokens
    };
  } catch (error: any) {
    console.error('[OAuth Spotify] Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Spotify');
  }
};

const checkRedditConfig = () => {
  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    throw new Error('Reddit OAuth not configured. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET');
  }
};

export const getRedditAuthURL = (source?: string): string => {
  checkRedditConfig();

  const rootUrl = "https://www.reddit.com/api/v1/authorize";
  let state = generateCSRFToken();

  if (source) {
    const encodedSource = Buffer.from(source).toString('base64');
    state = `${state}:${encodedSource}`;
  }

  const options = {
    client_id: process.env.REDDIT_CLIENT_ID!,
    redirect_uri: process.env.REDDIT_REDIRECT_URI || 'http://localhost:8080/auth/oauth/reddit/callback',
    response_type: "code",
    scope: [
      "identity",
      "read",
      "submit",
      "subscribe",
      "vote",
      "mysubreddits",
      "save",
      "edit",
      "history",
      "privatemessages"
    ].join(" "),
    state,
    duration: "permanent"
  };

  const url = `${rootUrl}?${new URLSearchParams(options).toString()}`;
  console.log(`[OAuth Reddit] Redirect URL generated with state: ${state.substring(0, 20)}...`);

  return url;
};

export const getRedditTokens = async (code: string) => {
  checkRedditConfig();

  try {
    const authString = Buffer.from(
      `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString('base64');

    const { data } = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        code,
        redirect_uri: process.env.REDDIT_REDIRECT_URI || 'http://localhost:8080/auth/oauth/reddit/callback',
        grant_type: "authorization_code"
      }),
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'AREA-App/1.0'
        }
      }
    );

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope?.split(' ') || []
    };
  } catch (error: any) {
    console.error('[OAuth Reddit] Token error:', error.response?.data || error.message);
    throw new Error('Failed to get Reddit tokens');
  }
};

export const refreshRedditToken = async (refreshToken: string) => {
  checkRedditConfig();

  try {
    const authString = Buffer.from(
      `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString('base64');

    const { data } = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
      }),
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'AREA-App/1.0'
        }
      }
    );

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expires_at: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope?.split(' ') || []
    };
  } catch (error: any) {
    console.error('[OAuth Reddit] Refresh token error:', error.response?.data || error.message);
    throw new Error('Failed to refresh Reddit token');
  }
};

export const getRedditUser = async (code: string) => {
  checkRedditConfig();

  try {
    const tokens = await getRedditTokens(code);

    const userResponse = await axios.get("https://oauth.reddit.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'User-Agent': 'AREA-App/1.0'
      }
    });

    console.log(`[OAuth Reddit] User retrieved: ${userResponse.data.name}`);

    return {
      ...userResponse.data,
      oauth_tokens: tokens
    };
  } catch (error: any) {
    console.error('[OAuth Reddit] Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Reddit');
  }
};

// ==================== DISCORD OAUTH ====================

const checkDiscordConfig = () => {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    throw new Error('Discord OAuth not configured. Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET');
  }
};

export const getDiscordAuthURL = (source?: string): string => {
  checkDiscordConfig();

  const rootUrl = "https://discord.com/api/oauth2/authorize";
  let state = generateCSRFToken();

  if (source) {
    const encodedSource = Buffer.from(source).toString('base64');
    state = `${state}:${encodedSource}`;
  }

  const options = {
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:8080/auth/oauth/discord/callback',
    response_type: "code",
    scope: [
      "identify",
      "email",
      "guilds",
      "messages.read"
    ].join(" "),
    state
  };

  const url = `${rootUrl}?${new URLSearchParams(options).toString()}`;
  console.log(`[OAuth Discord] Redirect URL generated with state: ${state.substring(0, 20)}...`);

  return url;
};

export const getDiscordTokens = async (code: string) => {
  checkDiscordConfig();

  try {
    const { data } = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        code,
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        redirect_uri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:8080/auth/oauth/discord/callback',
        grant_type: "authorization_code"
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope?.split(' ') || []
    };
  } catch (error: any) {
    console.error('[OAuth Discord] Token error:', error.response?.data || error.message);
    throw new Error('Failed to get Discord tokens');
  }
};

export const refreshDiscordToken = async (refreshToken: string) => {
  checkDiscordConfig();

  try {
    const { data } = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expires_at: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope?.split(' ') || []
    };
  } catch (error: any) {
    console.error('[OAuth Discord] Refresh token error:', error.response?.data || error.message);
    throw new Error('Failed to refresh Discord token');
  }
};

export const getDiscordUser = async (code: string) => {
  checkDiscordConfig();

  try {
    const tokens = await getDiscordTokens(code);

    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    console.log(`[OAuth Discord] User retrieved: ${userResponse.data.username}#${userResponse.data.discriminator}`);

    return {
      ...userResponse.data,
      oauth_tokens: tokens
    };
  } catch (error: any) {
    console.error('[OAuth Discord] Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Discord');
  }
};

// ==================== FACEBOOK OAUTH ====================

export const getFacebookAuthURL = (source?: string): string => {
  checkFacebookConfig();

  const rootUrl = "https://www.facebook.com/v12.0/dialog/oauth";
  let state = generateCSRFToken();

  if (source) {
    const encodedSource = Buffer.from(source).toString('base64');
    state = `${state}:${encodedSource}`;
  }

  const options = {
    client_id: process.env.FACEBOOK_CLIENT_ID!,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:8080/auth/oauth/facebook/callback',
    scope: "email,public_profile",
    state
  };

  const url = `${rootUrl}?${new URLSearchParams(options).toString()}`;
  console.log(`[OAuth Facebook] Redirect URL generated with state: ${state.substring(0, 20)}...`);

  return url;
};

export const getFacebookTokens = async (code: string) => {
  checkFacebookConfig();
  
  try {
    const tokenResponse = await axios.get("https://graph.facebook.com/v12.0/oauth/access_token", {
      params: {
        client_id: process.env.FACEBOOK_CLIENT_ID!,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:8080/auth/oauth/facebook/callback',
        code
      }
    });

    return {
      access_token: tokenResponse.data.access_token,
      refresh_token: undefined,
      expires_at: tokenResponse.data.expires_in 
        ? new Date(Date.now() + tokenResponse.data.expires_in * 1000) 
        : undefined,
      scope: []
    };
  } catch (error: any) {
    console.error('[OAuth Facebook] Token error:', error.response?.data || error.message);
    throw new Error('Failed to get Facebook tokens');
  }
};

export const getFacebookUser = async (code: string) => {
  checkFacebookConfig();
  
  try {
    const tokens = await getFacebookTokens(code);

    const userResponse = await axios.get("https://graph.facebook.com/me", {
      params: {
        fields: "id,name,email,picture",
        access_token: tokens.access_token
      }
    });

    console.log(`[OAuth Facebook] User retrieved: ${userResponse.data.name}`);
    
    return {
      ...userResponse.data,
      oauth_tokens: tokens
    };
  } catch (error: any) {
    console.error('[OAuth Facebook] Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Facebook');
  }
};

// ==================== NOTION OAUTH ====================

export const getNotionAuthURL = (source?: string): string => {
  checkNotionConfig();

  const rootUrl = "https://api.notion.com/v1/oauth/authorize";
  let state = generateCSRFToken();

  if (source) {
    const encodedSource = Buffer.from(source).toString("base64");
    state = `${state}:${encodedSource}`;
  }

  const params = new URLSearchParams({
    client_id: process.env.NOTION_CLIENT_ID!,
    response_type: "code",
    owner: "user",
    redirect_uri: process.env.NOTION_REDIRECT_URI || "http://localhost:8080/auth/oauth/notion/callback",
    state,
    scope: "read,write"
  });

  const url = `${rootUrl}?${params.toString()}`;
  console.log(`[OAuth Notion] Redirect URL generated with state: ${state.substring(0, 20)}...`);

  return url;
};

export const getNotionTokens = async (code: string) => {
  checkNotionConfig();

  try {
    const authHeader = Buffer.from(
      `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
    ).toString("base64");

    const { data } = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      {
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NOTION_REDIRECT_URI || "http://localhost:8080/auth/oauth/notion/callback"
      },
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28"
        }
      }
    );

    return {
      access_token: data.access_token,
      refresh_token: undefined,
      expires_at: undefined,
      scope: Array.isArray(data.bot?.scopes) ? data.bot.scopes : ["read", "write"],
      workspace_name: data.workspace_name,
      workspace_id: data.workspace_id,
      owner: data.owner
    };
  } catch (error: any) {
    console.error("[OAuth Notion] Token error:", error.response?.data || error.message);
    throw new Error("Failed to get Notion tokens");
  }
};

export const getNotionUser = async (code: string) => {
  checkNotionConfig();

  try {
    const tokens = await getNotionTokens(code);

    const userResponse = await axios.get("https://api.notion.com/v1/users/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Notion-Version": "2022-06-28"
      }
    });

    const notionUser = userResponse.data;
    const email = notionUser?.person?.email || tokens.owner?.user?.person?.email || undefined;

    console.log(`[OAuth Notion] User retrieved: ${notionUser?.name || email || 'unknown'}`);

    return {
      ...notionUser,
      email,
      workspace: {
        id: tokens.workspace_id,
        name: tokens.workspace_name
      },
      owner: tokens.owner,
      oauth_tokens: tokens
    };
  } catch (error: any) {
    console.error("[OAuth Notion] Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Notion");
  }
};

// ==================== ONEDRIVE OAUTH ====================

const checkOneDriveConfig = () => {
  if (!process.env.ONEDRIVE_CLIENT_ID || !process.env.ONEDRIVE_CLIENT_SECRET) {
    throw new Error('OneDrive OAuth not configured. Please set ONEDRIVE_CLIENT_ID and ONEDRIVE_CLIENT_SECRET');
  }
};

export const getOneDriveAuthURL = (source?: string): string => {
  checkOneDriveConfig();

  const rootUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
  let state = generateCSRFToken();

  if (source) {
    const encodedSource = Buffer.from(source).toString('base64');
    state = `${state}:${encodedSource}`;
  }

  const options = {
    client_id: process.env.ONEDRIVE_CLIENT_ID!,
    redirect_uri: process.env.ONEDRIVE_REDIRECT_URI || 'http://localhost:8080/auth/oauth/onedrive/callback',
    response_type: "code",
    scope: [
      "openid",
      "profile",
      "email",
      "offline_access",
      "User.Read"
    ].join(" "),
    state,
    response_mode: "query"
  };

  const url = `${rootUrl}?${new URLSearchParams(options).toString()}`;
  console.log(`[OAuth OneDrive] Redirect URL generated`);

  return url;
};

export const getOneDriveTokens = async (code: string) => {
  checkOneDriveConfig();

  try {
    const { data } = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      new URLSearchParams({
        code,
        client_id: process.env.ONEDRIVE_CLIENT_ID!,
        client_secret: process.env.ONEDRIVE_CLIENT_SECRET!,
        redirect_uri: process.env.ONEDRIVE_REDIRECT_URI || 'http://localhost:8080/auth/oauth/onedrive/callback',
        grant_type: "authorization_code"
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope?.split(' ') || []
    };
  } catch (error: any) {
    console.error('[OAuth OneDrive] Token exchange failed');
    console.error('[OAuth OneDrive] Status:', error.response?.status);
    console.error('[OAuth OneDrive] Error data:', JSON.stringify(error.response?.data, null, 2));
    console.error('[OAuth OneDrive] Error message:', error.message);
    console.error('[OAuth OneDrive] Request params:', {
      redirect_uri: process.env.ONEDRIVE_REDIRECT_URI,
      client_id: process.env.ONEDRIVE_CLIENT_ID,
      grant_type: 'authorization_code'
    });
    throw new Error(`Failed to get OneDrive tokens: ${error.response?.data?.error_description || error.message}`);
  }
};

export const getOneDriveUser = async (code: string) => {
  checkOneDriveConfig();

  try {
    const tokens = await getOneDriveTokens(code);

    const userResponse = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    console.log(`[OAuth OneDrive] User retrieved: ${userResponse.data.userPrincipalName || userResponse.data.mail}`);

    return {
      ...userResponse.data,
      email: userResponse.data.userPrincipalName || userResponse.data.mail,
      oauth_tokens: tokens
    };
  } catch (error: any) {
    console.error('[OAuth OneDrive] User fetch failed');
    console.error('[OAuth OneDrive] Status:', error.response?.status);
    console.error('[OAuth OneDrive] Error data:', JSON.stringify(error.response?.data, null, 2));
    throw new Error(`Failed to authenticate with OneDrive: ${error.response?.data?.error?.message || error.message}`);
  }
};

export const refreshOneDriveToken = async (refreshToken: string) => {
  checkOneDriveConfig();

  try {
    console.log('[OAuth OneDrive] Refreshing access token...');

    const { data } = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      new URLSearchParams({
        client_id: process.env.ONEDRIVE_CLIENT_ID!,
        client_secret: process.env.ONEDRIVE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('[OAuth OneDrive] Token refreshed successfully');

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expires_at: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope?.split(' ') || []
    };
  } catch (error: any) {
    console.error('[OAuth OneDrive] Token refresh failed');
    console.error('[OAuth OneDrive] Error:', error.response?.data || error.message);
    throw new Error(`Failed to refresh OneDrive token: ${error.response?.data?.error_description || error.message}`);
  }
};

// ==================== GITLAB OAUTH ====================

const checkGitLabConfig = () => {
  if (!process.env.GITLAB_CLIENT_ID || !process.env.GITLAB_CLIENT_SECRET) {
    throw new Error('GitLab OAuth not configured. Please set GITLAB_CLIENT_ID and GITLAB_CLIENT_SECRET');
  }
};

export const getGitLabAuthURL = (source?: string): string => {
  checkGitLabConfig();

  const gitlabUrl = process.env.GITLAB_URL || 'https://gitlab.com';
  const rootUrl = `${gitlabUrl}/oauth/authorize`;
  let state = generateCSRFToken();

  if (source) {
    const encodedSource = Buffer.from(source).toString('base64');
    state = `${state}:${encodedSource}`;
  }

  const options = {
    client_id: process.env.GITLAB_CLIENT_ID!,
    redirect_uri: process.env.GITLAB_REDIRECT_URI || 'http://localhost:8080/auth/oauth/gitlab/callback',
    response_type: 'code',
    scope: 'api read_user read_repository write_repository',
    state
  };

  const url = `${rootUrl}?${new URLSearchParams(options).toString()}`;
  console.log(`[OAuth GitLab] Redirect URL generated with state: ${state.substring(0, 20)}...`);

  return url;
};

export const getGitLabTokens = async (code: string) => {
  checkGitLabConfig();

  try {
    const gitlabUrl = process.env.GITLAB_URL || 'https://gitlab.com';

    const { data } = await axios.post(
      `${gitlabUrl}/oauth/token`,
      {
        code,
        client_id: process.env.GITLAB_CLIENT_ID!,
        client_secret: process.env.GITLAB_CLIENT_SECRET!,
        redirect_uri: process.env.GITLAB_REDIRECT_URI || 'http://localhost:8080/auth/oauth/gitlab/callback',
        grant_type: 'authorization_code'
      }
    );

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope?.split(' ') || []
    };
  } catch (error: any) {
    console.error('[OAuth GitLab] Token error:', error.response?.data || error.message);
    throw new Error('Failed to get GitLab tokens');
  }
};

export const getGitLabUser = async (code: string) => {
  checkGitLabConfig();

  try {
    const gitlabUrl = process.env.GITLAB_URL || 'https://gitlab.com';
    const tokens = await getGitLabTokens(code);

    const userResponse = await axios.get(
      `${gitlabUrl}/api/v4/user`,
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    console.log(`[OAuth GitLab] User retrieved: ${userResponse.data.username || userResponse.data.email}`);

    return {
      ...userResponse.data,
      email: userResponse.data.email,
      name: userResponse.data.name,
      oauth_tokens: tokens
    };
  } catch (error: any) {
    console.error('[OAuth GitLab] User fetch failed');
    console.error('[OAuth GitLab] Status:', error.response?.status);
    console.error('[OAuth GitLab] Error data:', JSON.stringify(error.response?.data, null, 2));
    throw new Error(`Failed to authenticate with GitLab: ${error.response?.data?.error || error.message}`);
  }
};

export const refreshGitLabToken = async (refreshToken: string) => {
  checkGitLabConfig();

  try {
    console.log('[OAuth GitLab] Refreshing access token...');
    const gitlabUrl = process.env.GITLAB_URL || 'https://gitlab.com';

    const { data } = await axios.post(
      `${gitlabUrl}/oauth/token`,
      {
        client_id: process.env.GITLAB_CLIENT_ID!,
        client_secret: process.env.GITLAB_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }
    );

    console.log('[OAuth GitLab] Token refreshed successfully');

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined
    };
  } catch (error: any) {
    console.error('[OAuth GitLab] Token refresh failed');
    console.error('[OAuth GitLab] Error:', error.response?.data || error.message);
    throw new Error(`Failed to refresh GitLab token: ${error.response?.data?.error_description || error.message}`);
  }
};

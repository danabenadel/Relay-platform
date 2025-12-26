import { Request, Response } from 'express';
import axios from 'axios';
import { AuthService } from '../services/AuthService';
import { ApiResponse } from '../types/common';
import { CreateUserData, LoginData } from '../types/auth';
import {
  getGoogleAuthURL,
  getGoogleUser,
  getGitHubAuthURL,
  getGitHubUser,
  getFacebookAuthURL,
  getFacebookUser,
  getSpotifyAuthURL,
  getSpotifyUser,
  getRedditAuthURL,
  getRedditUser,
  getDiscordAuthURL,
  getDiscordUser,
  getOneDriveAuthURL,
  getOneDriveUser,
  getGitLabAuthURL,
  getGitLabUser,
  getNotionAuthURL,
  getNotionUser
} from '../services/oauth.service';
import { 
  generateAccessToken, 
  generateRefreshToken,
  verifyToken 
} from '../services/jwt.service';
import { 
  storeRefreshToken,
  isRefreshTokenValid, 
  revokeRefreshToken
} from '../services/token.service';
import { validateCSRFToken } from '../utils/csrf';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  private handleOAuthRedirect(req: Request, res: Response, accessToken: string, user: any, state?: string) {
    let source = req.query.source as string;

    if (state && state.includes(':')) {
      const [_, encodedSource] = state.split(':');
      if (encodedSource) {
        try {
          source = Buffer.from(encodedSource, 'base64').toString();
        } catch (e) {}
      }
    }

    const userData = encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name || ''
    }));

    if (source && source.startsWith('mobile')) {
      return res.redirect(`relay://oauth-callback?token=${accessToken}&user=${userData}`);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&user=${userData}`);
  }

  private resolveOAuthSource(req: Request): string | undefined {
    let source = (req.query.source as string | undefined)?.trim();

    if (!source) {
      const referer = req.get('Referer') || req.get('Referrer');
      if (referer) {
        if (referer.includes('/services')) {
          source = 'services';
        } else if (referer.includes('/mobile')) {
          source = 'mobile';
        }
      }
    }

    return source && source.length > 0 ? source : undefined;
  }

  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password }: any = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      const userAgent = req.get("User-Agent");

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        } as ApiResponse);
      }

      const result = await this.authService.registerUser(
        { email, password, name },
        ipAddress,
        userAgent
      );

      res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        data: {
          token: result.token,
          user: result.user,
        },
        message: "User registered successfully",
      } as ApiResponse);
    } catch (error: any) {
      console.error("Register error:", error);

      if (error.message.includes("unique constraint")) {
        return res.status(409).json({
          success: false,
          error: "Email already exists",
        } as ApiResponse);
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      } as ApiResponse);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password }: LoginData = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        } as ApiResponse);
      }

      const result = await this.authService.loginUser(
        { email, password },
        ipAddress,
        userAgent
      );

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        data: {
          token: result.token,
          user: result.user
        },
        message: 'Login successful'
      } as ApiResponse);
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  };

  profile = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        } as ApiResponse);
      }

      const user = await this.authService.getUserProfile(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: user,
        message: 'Profile retrieved successfully'
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  };

  connectOAuth = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { serviceName, accessToken, refreshToken, expiresAt, scope } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        } as ApiResponse);
      }

      if (!serviceName || !accessToken) {
        return res.status(400).json({
          success: false,
          error: 'Service name and access token are required'
        } as ApiResponse);
      }

      await this.authService.connectOAuthService(
        userId,
        {
          serviceName,
          accessToken,
          refreshToken,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          scope: scope || []
        },
        ipAddress,
        userAgent
      );

      res.json({
        success: true,
        message: `${serviceName} connected successfully`
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  };

  disconnectOAuth = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { serviceName } = req.params;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        } as ApiResponse);
      }

      await this.authService.disconnectOAuthService(userId, serviceName, ipAddress, userAgent);

      res.json({
        success: true,
        message: `${serviceName} disconnected successfully`
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  };

  listOAuthTokens = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        } as ApiResponse);
      }

      const tokens = await this.authService.listOAuthTokens(String(userId));

      res.json({
        success: true,
        data: tokens
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Unable to load OAuth tokens'
      } as ApiResponse);
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token) {
      return res.status(400).json({ success: false, error: "Refresh token manquant" });
    }

    if (!isRefreshTokenValid(refresh_token)) {
      return res.status(403).json({ success: false, error: "Refresh token invalide ou révoqué" });
    }

    try {
      const payload = verifyToken(refresh_token) as any;
      const newAccessToken = generateAccessToken({ sub: payload.sub, email: payload.email });
      res.json({ success: true, data: { access_token: newAccessToken }, message: "Nouveau token généré" });
    } catch {
      return res.status(403).json({ success: false, error: "Refresh token invalide ou expiré" });
    }
  };

  logout = async (req: Request, res: Response) => {
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token) {
      return res.status(400).json({ success: false, error: "Refresh token manquant" });
    }

    revokeRefreshToken(refresh_token);
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ success: true, message: "Déconnexion réussie" });
  };

  googleRedirect = (req: Request, res: Response) => {
    try {
      const source = this.resolveOAuthSource(req);
      const url = getGoogleAuthURL(source);
      res.redirect(url);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to initiate Google OAuth', details: error.message });
    }
  };

  googleCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    if (!code) return res.status(400).json({ success: false, error: "Code manquant" });
    if (!validateCSRFToken(state))
      return res.status(403).json({ success: false, error: "Token CSRF invalide ou expiré" });

    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      const googleData = await getGoogleUser(code);

      console.log('[Google OAuth] Google user data:', { email: googleData.email, name: googleData.name, id: googleData.id });

      let source = 'login';
      let userId: string | null = null;

      if (state && state.includes(':')) {
        const parts = state.split(':');
        if (parts.length > 1) {
          try {
            const base64Part = parts[1];
            const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

            if (decoded.startsWith('services:')) {
              source = 'services';
              userId = decoded.split(':')[1];
            } else if (decoded.startsWith('mobile:')) {
              source = 'mobile';
              userId = decoded.split(':')[1];
            } else if (decoded === 'services') {
              source = 'services';
              console.log('[Google OAuth] ✓✓ Source: services (no userId - will use email lookup)');
            } else if (decoded === 'mobile') {
              source = 'mobile';
            }
          } catch (e: any) {
            console.warn('[Google OAuth] Failed to decode state:', e.message);
          }
        }
      }

      let user;

      if ((source === 'services' || source === 'mobile') && userId) {
        user = await this.authService.getUserById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
        }
      } else {
        user = await this.authService.getUserByEmail(googleData.email);

        if (!user) {
          const result = await this.authService.registerUser({ email: googleData.email }, ipAddress, userAgent);
          user = result.user;
        }
      }

      if (!user) {
        return res.status(500).json({ success: false, error: "Impossible de créer ou récupérer l'utilisateur" });
      }

      console.log('[Google OAuth] Connecting service with data:', {
        userId: user.id,
        email: googleData.email,
        displayName: googleData.name
      });

      await this.authService.connectOAuthService(
        user.id,
        {
          serviceName: 'google',
          accessToken: googleData.oauth_tokens.access_token,
          refreshToken: googleData.oauth_tokens.refresh_token,
          expiresAt: googleData.oauth_tokens.expires_at,
          scope: googleData.oauth_tokens.scope,
          email: googleData.email,
          displayName: googleData.name
        },
        ipAddress,
        userAgent
      );

      if (source === 'services') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        return res.redirect(`${frontendUrl}/oauth/service-connected?service=google&status=connected`);
      }

      if (source === 'mobile' && userId) {
        return res.redirect(`relay://oauth-callback?service=google&status=connected`);
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      storeRefreshToken(refreshToken);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      this.handleOAuthRedirect(req, res, accessToken, user, state);
    } catch (err: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || 'Erreur OAuth2 Google')}`);
    }
  };

  githubRedirect = (req: Request, res: Response) => {
    try {
      console.log('[OAuth GitHub] githubRedirect CALLED');
      console.log('[OAuth GitHub] Full request URL:', req.url);
      console.log('[OAuth GitHub] Query params:', JSON.stringify(req.query));
      const source = this.resolveOAuthSource(req);
      console.log(`[OAuth GitHub] source parameter: ${source || 'NOT PROVIDED'}`);
      const url = getGitHubAuthURL(source);
      res.redirect(url);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to initiate GitHub OAuth', details: error.message });
    }
  };

  githubCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code) return res.status(400).json({ success: false, error: "Code manquant" });
    if (!validateCSRFToken(state))
      return res.status(403).json({ success: false, error: "Token CSRF invalide ou expiré" });

    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      const githubData = await getGitHubUser(code);

      let email = githubData.email;
      if (!email) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: { 'Authorization': `Bearer ${githubData.oauth_tokens.access_token}` }
        });
        const emails = await emailResponse.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
        email = emails.find((e: any) => e.primary)?.email || emails[0]?.email;
      }

      if (!email) return res.status(400).json({ success: false, error: "Impossible de récupérer l'email" });

      let source = 'login';
      let userId: string | null = null;

      if (state && state.includes(':')) {
        const parts = state.split(':');
        if (parts.length > 1) {
          try {
            const base64Part = parts[1];
            const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

            if (decoded.startsWith('services:')) {
              source = 'services';
              userId = decoded.split(':')[1];
            } else if (decoded.startsWith('mobile:')) {
              source = 'mobile';
              userId = decoded.split(':')[1];
            } else if (decoded === 'services') {
              source = 'services';
              console.log('[GitHub OAuth] ✓✓ Source: services (no userId - will use email lookup)');
            } else if (decoded === 'mobile') {
              source = 'mobile';
            }
          } catch (e: any) {
            console.warn('[GitHub OAuth] Failed to decode state:', e.message);
          }
        }
      }

      let user;

      if ((source === 'services' || source === 'mobile') && userId) {
        user = await this.authService.getUserById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
        }
      } else {
        user = await this.authService.getUserByEmail(email);
        if (!user) {
          const result = await this.authService.registerUser({ email }, ipAddress, userAgent);
          user = result.user;
        }
      }

      if (!user) {
        return res.status(500).json({ success: false, error: "Impossible de créer ou récupérer l'utilisateur" });
      }

      await this.authService.connectOAuthService(
        user.id,
        {
          serviceName: 'github',
          accessToken: githubData.oauth_tokens.access_token,
          refreshToken: githubData.oauth_tokens.refresh_token,
          expiresAt: githubData.oauth_tokens.expires_at,
          scope: githubData.oauth_tokens.scope,
          email: email,
          displayName: githubData.name || githubData.login
        },
        ipAddress,
        userAgent
      );

      if (source === 'services') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        return res.redirect(`${frontendUrl}/oauth/service-connected?service=github&status=connected`);
      }

      if (source === 'mobile' && userId) {
        return res.redirect(`relay://oauth-callback?service=github&status=connected`);
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      storeRefreshToken(refreshToken);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      this.handleOAuthRedirect(req, res, accessToken, user, state);
    } catch (err: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || 'Erreur OAuth2 GitHub')}`);
    }
  };

  facebookRedirect = (req: Request, res: Response) => {
    try {
      const source = this.resolveOAuthSource(req);
      const url = getFacebookAuthURL(source);
      res.redirect(url);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to initiate Facebook OAuth', details: error.message });
    }
  };

  facebookCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    if (!code) return res.status(400).json({ success: false, error: "Code manquant" });
    if (!validateCSRFToken(state))
      return res.status(403).json({ success: false, error: "Token CSRF invalide ou expiré" });

    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      const facebookData = await getFacebookUser(code);

      if (!facebookData.email)
        return res.status(400).json({ success: false, error: "Impossible de récupérer l'email depuis Facebook" });

      let source = 'login';
      let userId: string | null = null;

      if (state && state.includes(':')) {
        const parts = state.split(':');
        if (parts.length > 1) {
          try {
            const base64Part = parts[1];
            const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

            if (decoded.startsWith('services:')) {
              source = 'services';
              userId = decoded.split(':')[1];
            } else if (decoded.startsWith('mobile:')) {
              source = 'mobile';
              userId = decoded.split(':')[1];
            } else if (decoded === 'services') {
              source = 'services';
              console.log('[Facebook OAuth] ✓✓ Source: services (no userId - will use email lookup)');
            } else if (decoded === 'mobile') {
              source = 'mobile';
            }
          } catch (e: any) {
            console.warn('[Facebook OAuth] Failed to decode state:', e.message);
          }
        }
      }

      let user;

      if ((source === 'services' || source === 'mobile') && userId) {
        user = await this.authService.getUserById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
        }
      } else {
        user = await this.authService.getUserByEmail(facebookData.email);
        if (!user) {
          const result = await this.authService.registerUser({ email: facebookData.email }, ipAddress, userAgent);
          user = result.user;
        }
      }

      if (!user) {
        return res.status(500).json({ success: false, error: "Impossible de créer ou récupérer l'utilisateur" });
      }

      await this.authService.connectOAuthService(
        user.id,
        {
          serviceName: 'facebook',
          accessToken: facebookData.oauth_tokens.access_token,
          refreshToken: facebookData.oauth_tokens.refresh_token,
          expiresAt: facebookData.oauth_tokens.expires_at,
          scope: facebookData.oauth_tokens.scope,
          email: facebookData.email,
          displayName: facebookData.name
        },
        ipAddress,
        userAgent
      );

      if (source === 'services') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        return res.redirect(`${frontendUrl}/oauth/service-connected?service=facebook&status=connected`);
      }

      if (source === 'mobile' && userId) {
        return res.redirect(`relay://oauth-callback?service=facebook&status=connected`);
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      storeRefreshToken(refreshToken);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      this.handleOAuthRedirect(req, res, accessToken, user, state);
    } catch (err: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || 'Erreur OAuth2 Facebook')}`);
    }
  };

  spotifyRedirect = (req: Request, res: Response) => {
    try {
      const source = this.resolveOAuthSource(req);
      const url = getSpotifyAuthURL(source);
      res.redirect(url);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to initiate Spotify OAuth', details: error.message });
    }
  };

  spotifyCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    if (!code) return res.status(400).json({ success: false, error: "Code manquant" });
    if (!validateCSRFToken(state))
      return res.status(403).json({ success: false, error: "Token CSRF invalide ou expiré" });

    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      const spotifyData = await getSpotifyUser(code);

      if (!spotifyData.email)
        return res.status(400).json({ success: false, error: "Impossible de récupérer l'email depuis Spotify" });

      let source = 'login';
      let userId: string | null = null;

      if (state && state.includes(':')) {
        const parts = state.split(':');
        if (parts.length > 1) {
          try {
            const base64Part = parts[1];
            const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

            if (decoded.startsWith('services:')) {
              source = 'services';
              userId = decoded.split(':')[1];
            } else if (decoded.startsWith('mobile:')) {
              source = 'mobile';
              userId = decoded.split(':')[1];
            } else if (decoded === 'services') {
              source = 'services';
              console.log('[Spotify OAuth] ✓✓ Source: services (no userId - will use email lookup)');
            } else if (decoded === 'mobile') {
              source = 'mobile';
            }
          } catch (e: any) {
            console.warn('[Spotify OAuth] Failed to decode state:', e.message);
          }
        }
      }

      let user;

      if ((source === 'services' || source === 'mobile') && userId) {
        user = await this.authService.getUserById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
        }
      } else {
        user = await this.authService.getUserByEmail(spotifyData.email);
        if (!user) {
          const result = await this.authService.registerUser({ email: spotifyData.email }, ipAddress, userAgent);
          user = result.user;
        }
      }

      if (!user) {
        return res.status(500).json({ success: false, error: "Impossible de créer ou récupérer l'utilisateur" });
      }

      await this.authService.connectOAuthService(
        user.id,
        {
          serviceName: 'spotify',
          accessToken: spotifyData.oauth_tokens.access_token,
          refreshToken: spotifyData.oauth_tokens.refresh_token,
          expiresAt: spotifyData.oauth_tokens.expires_at,
          scope: spotifyData.oauth_tokens.scope,
          email: spotifyData.email,
          displayName: spotifyData.display_name
        },
        ipAddress,
        userAgent
      );

      if (source === 'services') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        return res.redirect(`${frontendUrl}/oauth/service-connected?service=spotify&status=connected`);
      }

      if (source === 'mobile' && userId) {
        return res.redirect(`relay://oauth-callback?service=spotify&status=connected`);
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      storeRefreshToken(refreshToken);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      this.handleOAuthRedirect(req, res, accessToken, user, state);
    } catch (err: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || 'Erreur OAuth2 Spotify')}`);
    }
  };

  redditRedirect = (req: Request, res: Response) => {
    try {
      const rawSource = req.query.source as string | undefined;
      const source = this.resolveOAuthSource(req) || rawSource;
      const userId = req.query.userId as string;
      console.log('[Reddit OAuth] ========== REDIRECT START ==========');
      console.log('[Reddit OAuth] Source parameter:', source || 'NOT PROVIDED');
      console.log('[Reddit OAuth] userId parameter:', userId);
      console.log('[Reddit OAuth] Full query:', req.query);

      let sourceParam = source;
      if (source === 'services' && userId) {
        sourceParam = `services:${userId}`;
        console.log('[Reddit OAuth] Encoding source with userId:', sourceParam);
      } else if (source === 'mobile' && userId) {
        sourceParam = `mobile:${userId}`;
        console.log('[Reddit OAuth] Encoding source with userId:', sourceParam);
      }

      const url = getRedditAuthURL(sourceParam);
      console.log('[Reddit OAuth] Generated auth URL (first 150 chars):', url.substring(0, 150) + '...');

      if (sourceParam) {
        console.log('[Reddit OAuth] Source will be encoded in state parameter');
      }

      res.redirect(url);
    } catch (error: any) {
      console.error('[Reddit OAuth] Redirect error:', error);
      res.status(500).json({ error: 'Failed to initiate Reddit OAuth', details: error.message });
    }
  };

  redditCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;

    console.log('[Reddit OAuth] ========== CALLBACK START ==========');
    console.log('[Reddit OAuth] Query params:', { code: code?.substring(0, 10) + '...', state });
    console.log('[Reddit OAuth] Full state string:', state);
    console.log('[Reddit OAuth] State length:', state?.length);
    console.log('[Reddit OAuth] All cookies:', Object.keys(req.cookies || {}));
    console.log('[Reddit OAuth] reddit_oauth_source cookie:', req.cookies?.reddit_oauth_source);

    if (!code) return res.status(400).json({ success: false, error: "Code manquant" });
    if (!validateCSRFToken(state))
      return res.status(403).json({ success: false, error: "Token CSRF invalide ou expiré" });

    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      const redditData = await getRedditUser(code);

      console.log('[Reddit OAuth] Reddit user data retrieved:', { name: redditData.name, email: redditData.email });

      let source = 'login';
      let userId: string | null = null;

      console.log('[Reddit OAuth] Checking state for encoded source...');
      console.log('[Reddit OAuth] State contains colon:', state?.includes(':'));

      if (state && state.includes(':')) {
        const parts = state.split(':');
        console.log('[Reddit OAuth] State parts count:', parts.length);
        console.log('[Reddit OAuth] State parts:', parts.map((p, i) => `[${i}]: ${p.substring(0, 30)}...`));

        if (parts.length > 1) {
          try {
            const base64Part = parts[1];
            console.log('[Reddit OAuth] Attempting to decode base64 part:', base64Part);
            const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
            console.log('[Reddit OAuth] ✓ Decoded state source:', decoded);

            if (decoded.startsWith('services:')) {
              source = 'services';
              userId = decoded.split(':')[1];
              console.log('[Reddit OAuth] ✓✓ Source: services, userId:', userId);
            } else if (decoded.startsWith('mobile:')) {
              source = 'mobile';
              userId = decoded.split(':')[1];
              console.log('[Reddit OAuth] ✓✓ Source: mobile, userId:', userId);
            } else if (decoded === 'services') {
              source = 'services';
              console.log('[Reddit OAuth] ✓✓ Source: services (no userId - will use email lookup)');
            } else if (decoded === 'mobile') {
              source = 'mobile';
              console.log('[Reddit OAuth] ✓✓ Source: mobile (legacy - no userId)');
            } else {
              console.log('[Reddit OAuth] ⚠ State decoded but unknown format:', decoded);
            }
          } catch (e: any) {
            console.warn('[Reddit OAuth] ✗ Failed to decode state:', e.message);
          }
        } else {
          console.log('[Reddit OAuth] ⚠ State has no encoded source (only 1 part - login flow)');
        }
      } else {
        console.log('[Reddit OAuth] ⚠ No colon in state - using default login flow');
      }

      console.log('[Reddit OAuth] Final decision - source:', source, 'userId:', userId);

      let user;

      if ((source === 'services' || source === 'mobile') && userId) {
        console.log(`[Reddit OAuth] Connecting Reddit to existing user ${userId}`);
        user = await this.authService.getUserById(userId);

        if (!user) {
          return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
        }
      } else if (source === 'services' && !userId) {
        console.log('[Reddit OAuth] Source is services but no userId - attempting to get from JWT cookie');
        const token = req.cookies['auth-token'] || req.cookies['access_token'];
        if (token) {
          try {
            const jwt = require('jsonwebtoken');
            const fs = require('fs');
            const publicKey = fs.readFileSync('./keys/public_key.pem', 'utf8');
            const decoded: any = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
            if (decoded && decoded.sub) {
              userId = decoded.sub;
              console.log('[Reddit OAuth] Retrieved userId from JWT:', userId);
              if (userId) {
                user = await this.authService.getUserById(userId);
              }
            }
          } catch (e: any) {
            console.log('[Reddit OAuth] Error retrieving user from JWT:', e.message);
          }
        }
        if (!user) {
          console.log('[Reddit OAuth] Could not retrieve user from JWT - falling back to email lookup');
        }
      }

      if (!user) {
        const email = redditData.email || `${redditData.name}@reddit.placeholder`;

        user = await this.authService.getUserByEmail(email);

        if (!user) {
          try {
            const result = await this.authService.registerUser({ email }, ipAddress, userAgent);
            user = result.user;
            console.log(`[Reddit OAuth] New user created: ${user.id}`);
          } catch (error: any) {
            console.error('[Reddit OAuth] Error during registration:', error.message);
            if (error.message && (error.message.includes('already exists') || error.message.includes('Unique constraint'))) {
              console.log('[Reddit OAuth] User exists, fetching existing user...');
              console.log('[Reddit OAuth] Searching for email:', email);
              user = await this.authService.getUserByEmail(email);
              console.log('[Reddit OAuth] getUserByEmail result:', user ? `Found user ${user.id}` : 'User not found');

              if (!user) {
                console.error('[Reddit OAuth] Failed to retrieve user with email:', email);
                throw new Error('User exists but cannot be retrieved');
              }
            } else {
              throw error;
            }
          }
        } else {
          console.log(`[Reddit OAuth] Existing user found: ${user.id}`);
        }
      }

      if (!user) {
        return res.status(500).json({ success: false, error: "Impossible de créer ou récupérer l'utilisateur" });
      }

      await this.authService.connectOAuthService(
        user.id,
        {
          serviceName: 'reddit',
          accessToken: redditData.oauth_tokens.access_token,
          refreshToken: redditData.oauth_tokens.refresh_token,
          expiresAt: redditData.oauth_tokens.expires_at,
          scope: redditData.oauth_tokens.scope,
          email: redditData.email,
          displayName: redditData.name
        },
        ipAddress,
        userAgent
      );

      console.log(`[Reddit OAuth] Reddit connected successfully for user ${user.id}`);

      if (source === 'services') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        console.log(`[Reddit OAuth] Redirecting to OAuth success page`);
        return res.redirect(`${frontendUrl}/oauth/service-connected?service=reddit&status=connected`);
      }

      if (source === 'mobile' && userId) {
        console.log(`[Reddit OAuth] Mobile connection successful, redirecting to app`);
        return res.redirect(`relay://oauth-callback?service=reddit&status=connected`);
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      storeRefreshToken(refreshToken);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      this.handleOAuthRedirect(req, res, accessToken, user, state);
    } catch (err: any) {
      console.error('[Reddit OAuth] Error:', err);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || 'Erreur OAuth2 Reddit')}`);
    }
  };

  // ==================== OAUTH DISCORD =============
  discordRedirect = (req: Request, res: Response) => {
    try {
      const rawSource = req.query.source as string | undefined;
      const source = this.resolveOAuthSource(req) || rawSource;
      console.log('[Discord OAuth] ========== REDIRECT START ==========');
      console.log('[Discord OAuth] Source parameter:', source || 'NOT PROVIDED');
      console.log('[Discord OAuth] Full query:', req.query);

      const url = getDiscordAuthURL(source);
      console.log('[Discord OAuth] Generated auth URL (first 150 chars):', url.substring(0, 150) + '...');

      if (source) {
        console.log('[Discord OAuth] Source will be encoded in state parameter');
      }

      res.redirect(url);
    } catch (error: any) {
      console.error('[Discord OAuth] Redirect error:', error);
      res.status(500).json({ error: 'Failed to initiate Discord OAuth', details: error.message });
    }
  };

  discordCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;

    console.log('[Discord OAuth] ========== CALLBACK START ==========');
    console.log('[Discord OAuth] Query params:', { code: code?.substring(0, 10) + '...', state });
    console.log('[Discord OAuth] Full state string:', state);

    if (!code) return res.status(400).json({ success: false, error: "Code manquant" });
    if (!validateCSRFToken(state))
      return res.status(403).json({ success: false, error: "Token CSRF invalide ou expiré" });

    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      const discordData = await getDiscordUser(code);

      console.log('[Discord OAuth] Discord user data retrieved:', {
        username: discordData.username,
        email: discordData.email
      });

      let source = 'login';
      let userId: string | null = null;

      console.log('[Discord OAuth] Checking state for encoded source...');

      if (state && state.includes(':')) {
        const parts = state.split(':');
        console.log('[Discord OAuth] State parts count:', parts.length);

        if (parts.length > 1) {
          try {
            const base64Part = parts[1];
            console.log('[Discord OAuth] Attempting to decode base64 part:', base64Part);
            const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
            console.log('[Discord OAuth] ✓ Decoded state source:', decoded);

            if (decoded.startsWith('services:')) {
              source = 'services';
              userId = decoded.split(':')[1];
              console.log('[Discord OAuth] ✓✓ Source: services, userId:', userId);
            } else if (decoded === 'services') {
              source = 'services';
              console.log('[Discord OAuth] ✓✓ Source: services (no userId - will use email lookup)');
            } else if (decoded.startsWith('mobile:')) {
              source = 'mobile';
              userId = decoded.split(':')[1];
              console.log('[Discord OAuth] ✓✓ Source: mobile, userId:', userId);
            } else if (decoded === 'mobile') {
              source = 'mobile';
              console.log('[Discord OAuth] ✓✓ Source: mobile (legacy - no userId)');
            } else {
              console.log('[Discord OAuth] ⚠ State decoded but unknown format:', decoded);
            }
          } catch (e: any) {
            console.warn('[Discord OAuth] ✗ Failed to decode state:', e.message);
          }
        }
      }

      console.log('[Discord OAuth] Final decision - source:', source, 'userId:', userId);

      let user;

      if ((source === 'services' || source === 'mobile') && userId) {
        console.log(`[Discord OAuth] Connecting Discord to existing user ${userId}`);
        user = await this.authService.getUserById(userId);

        if (!user) {
          return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
        }
      } else {
        const email = discordData.email || `${discordData.username}@discord.placeholder`;

        user = await this.authService.getUserByEmail(email);

        if (!user) {
          try {
            const result = await this.authService.registerUser({ email }, ipAddress, userAgent);
            user = result.user;
            console.log(`[Discord OAuth] New user created: ${user.id}`);
          } catch (error: any) {
            console.error('[Discord OAuth] Error during registration:', error.message);
            if (error.message && (error.message.includes('already exists') || error.message.includes('Unique constraint'))) {
              console.log('[Discord OAuth] User exists, fetching existing user...');
              user = await this.authService.getUserByEmail(email);

              if (!user) {
                throw new Error('User exists but cannot be retrieved');
              }
            } else {
              throw error;
            }
          }
        } else {
          console.log(`[Discord OAuth] Existing user found: ${user.id}`);
        }
      }

      if (!user) {
        return res.status(500).json({ success: false, error: "Impossible de créer ou récupérer l'utilisateur" });
      }

      await this.authService.connectOAuthService(
        user.id,
        {
          serviceName: 'discord',
          accessToken: discordData.oauth_tokens.access_token,
          refreshToken: discordData.oauth_tokens.refresh_token,
          expiresAt: discordData.oauth_tokens.expires_at,
          scope: discordData.oauth_tokens.scope
        },
        ipAddress,
        userAgent
      );

      console.log(`[Discord OAuth] Discord connected successfully for user ${user.id}`);

      if (source === 'services') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        console.log(`[Discord OAuth] Redirecting to OAuth success page`);
        return res.redirect(`${frontendUrl}/oauth/service-connected?service=discord&status=connected`);
      }

      if (source === 'mobile' && userId) {
        console.log(`[Discord OAuth] Mobile connection successful, redirecting to app`);
        return res.redirect(`relay://oauth-callback?service=discord&status=connected`);
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      storeRefreshToken(refreshToken);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      this.handleOAuthRedirect(req, res, accessToken, user, state);
    } catch (err: any) {
      console.error('[Discord OAuth] Error:', err);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || 'Erreur OAuth2 Discord')}`);
    }
  };

  // ==================== OAUTH NOTION =============
  notionRedirect = (req: Request, res: Response) => {
    try {
      const source = req.query.source as string;
      const url = getNotionAuthURL(source);
      res.redirect(url);
    } catch (error: any) {
      console.error('[Notion OAuth] Redirect error:', error.message);
      res.status(500).json({ error: 'Failed to initiate Notion OAuth', details: error.message });
    }
  };

  notionCallback = async (req: Request, res: Response) => {
    const isPostCallback = req.method === 'POST';
    const code = (isPostCallback ? req.body.code : req.query.code) as string;
    const state = (isPostCallback ? req.body.state : req.query.state) as string;

    if (!code) {
      const errorResponse = { success: false, error: "Code manquant" };
      return res.status(400).json(errorResponse);
    }

    if (!validateCSRFToken(state)) {
      const errorResponse = { success: false, error: "Token CSRF invalide ou expiré" };
      return res.status(403).json(errorResponse);
    }

    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      const notionData = await getNotionUser(code);

      const fallbackIdentifier = notionData?.id || notionData?.workspace?.id || Date.now().toString();
      const notionEmail =
        notionData.email ||
        notionData?.person?.email ||
        notionData?.owner?.user?.person?.email ||
        `notion-user-${fallbackIdentifier}@notion.local`;

      let source = 'login';
      let userId: string | null = null;

      if (state && state.includes(':')) {
        const parts = state.split(':');
        if (parts.length > 1) {
          try {
            const decoded = Buffer.from(parts[1], 'base64').toString('utf-8');
            if (decoded.startsWith('services:')) {
              source = 'services';
              userId = decoded.split(':')[1];
            } else if (decoded.startsWith('mobile:')) {
              source = 'mobile';
              userId = decoded.split(':')[1];
            } else if (decoded === 'services') {
              source = 'services';
            } else if (decoded === 'mobile') {
              source = 'mobile';
            }
          } catch (e: any) {
            console.warn('[Notion OAuth] Failed to decode state:', e.message);
          }
        }
      }

      let user;

      if ((source === 'services' || source === 'mobile') && userId) {
        user = await this.authService.getUserById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
        }
      } else {
        user = await this.authService.getUserByEmail(notionEmail);

        if (!user) {
          const result = await this.authService.registerUser({ email: notionEmail }, ipAddress, userAgent);
          user = result.user;
        }
      }

      if (!user) {
        return res.status(500).json({ success: false, error: "Impossible de créer ou récupérer l'utilisateur" });
      }

      await this.authService.connectOAuthService(
        user.id,
        {
          serviceName: 'notion',
          accessToken: notionData.oauth_tokens.access_token,
          refreshToken: notionData.oauth_tokens.refresh_token,
          expiresAt: notionData.oauth_tokens.expires_at,
          scope: notionData.oauth_tokens.scope,
          email: notionEmail,
          displayName: notionData.name || notionData.workspace?.name || notionEmail
        },
        ipAddress,
        userAgent
      );

      if (source === 'services') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        return res.redirect(`${frontendUrl}/oauth/service-connected?service=notion&status=connected`);
      }

      if (source === 'mobile' && userId) {
        return res.redirect(`relay://oauth-callback?service=notion&status=connected`);
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      storeRefreshToken(refreshToken);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      if (isPostCallback) {
        return res.json({
          success: true,
          data: {
            token: accessToken,
            refreshToken,
            user
          }
        });
      }

      this.handleOAuthRedirect(req, res, accessToken, user, state);
    } catch (err: any) {
      console.error('[Notion OAuth] Error:', err);
      if (req.method === 'POST') {
        return res.status(500).json({
          success: false,
          error: err.message || 'Erreur OAuth2 Notion'
        });
      }
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || 'Erreur OAuth2 Notion')}`);
    }
  };

  // ==================== OAUTH ONEDRIVE =============
  onedriveRedirect = (req: Request, res: Response) => {
    try {
      const source = this.resolveOAuthSource(req);
      const url = getOneDriveAuthURL(source);
      res.redirect(url);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to initiate OneDrive OAuth', details: error.message });
    }
  };

  onedriveCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code) return res.status(400).json({ success: false, error: "Code manquant" });
    if (!validateCSRFToken(state))
      return res.status(403).json({ success: false, error: "Token CSRF invalide ou expiré" });

    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      const onedriveData = await getOneDriveUser(code);

      if (!onedriveData.email)
        return res.status(400).json({ success: false, error: "Impossible de récupérer l'email depuis OneDrive" });

      let source = 'login';
      let userId: string | null = null;

      if (state && state.includes(':')) {
        const parts = state.split(':');
        if (parts.length > 1) {
          try {
            const base64Part = parts[1];
            const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

            if (decoded.startsWith('services:')) {
              source = 'services';
              userId = decoded.split(':')[1];
            } else if (decoded.startsWith('mobile:')) {
              source = 'mobile';
              userId = decoded.split(':')[1];
            } else if (decoded === 'services') {
              source = 'services';
              console.log('[OneDrive OAuth] ✓✓ Source: services (no userId - will use email lookup)');
            } else if (decoded === 'mobile') {
              source = 'mobile';
            }
          } catch (e: any) {
            console.warn('[OneDrive OAuth] Failed to decode state:', e.message);
          }
        }
      }

      let user;

      if ((source === 'services' || source === 'mobile') && userId) {
        user = await this.authService.getUserById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
        }
      } else {
        user = await this.authService.getUserByEmail(onedriveData.email);
        if (!user) {
          const result = await this.authService.registerUser({ email: onedriveData.email }, ipAddress, userAgent);
          user = result.user;
        }
      }

      if (!user) {
        return res.status(500).json({ success: false, error: "Impossible de créer ou récupérer l'utilisateur" });
      }

      await this.authService.connectOAuthService(
        user.id,
        {
          serviceName: 'onedrive',
          accessToken: onedriveData.oauth_tokens.access_token,
          refreshToken: onedriveData.oauth_tokens.refresh_token,
          expiresAt: onedriveData.oauth_tokens.expires_at,
          scope: onedriveData.oauth_tokens.scope,
          email: onedriveData.email,
          displayName: onedriveData.displayName
        },
        ipAddress,
        userAgent
      );

      if (source === 'services') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        return res.redirect(`${frontendUrl}/oauth/service-connected?service=onedrive&status=connected`);
      }

      if (source === 'mobile' && userId) {
        return res.redirect(`relay://oauth-callback?service=onedrive&status=connected`);
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      storeRefreshToken(refreshToken);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      this.handleOAuthRedirect(req, res, accessToken, user, state);
    } catch (err: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || 'Erreur OAuth2 OneDrive')}`);
    }
  };

  // ==================== OAUTH GITLAB ====================
  gitlabRedirect = (req: Request, res: Response) => {
    try {
      console.log('[OAuth GitLab] gitlabRedirect CALLED');
      console.log('[OAuth GitLab] Full request URL:', req.url);
      console.log('[OAuth GitLab] Query params:', JSON.stringify(req.query));
      const source = req.query.source as string;
      console.log(`[OAuth GitLab] source parameter: ${source || 'NOT PROVIDED'}`);
      const url = getGitLabAuthURL(source);
      res.redirect(url);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to initiate GitLab OAuth', details: error.message });
    }
  };

  gitlabCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code) return res.status(400).json({ success: false, error: "Code manquant" });
    if (!validateCSRFToken(state))
      return res.status(403).json({ success: false, error: "Token CSRF invalide ou expiré" });

    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      const gitlabData = await getGitLabUser(code);

      if (!gitlabData.email)
        return res.status(400).json({ success: false, error: "Impossible de récupérer l'email depuis GitLab" });

      let source = 'login';
      let userId: string | null = null;

      if (state && state.includes(':')) {
        const parts = state.split(':');
        if (parts.length > 1) {
          try {
            const base64Part = parts[1];
            const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

            if (decoded.startsWith('services:')) {
              source = 'services';
              userId = decoded.split(':')[1];
            } else if (decoded.startsWith('mobile:')) {
              source = 'mobile';
              userId = decoded.split(':')[1];
            } else if (decoded === 'services') {
              source = 'services';
              console.log('[GitLab OAuth] ✓✓ Source: services (no userId - will use email lookup)');
            } else if (decoded === 'mobile') {
              source = 'mobile';
            }
          } catch (e: any) {
            console.warn('[GitLab OAuth] Failed to decode state:', e.message);
          }
        }
      }

      let user;

      if ((source === 'services' || source === 'mobile') && userId) {
        user = await this.authService.getUserById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
        }
      } else {
        user = await this.authService.getUserByEmail(gitlabData.email);
        if (!user) {
          const result = await this.authService.registerUser({ email: gitlabData.email }, ipAddress, userAgent);
          user = result.user;
        }
      }

      if (!user) {
        return res.status(500).json({ success: false, error: "Impossible de créer ou récupérer l'utilisateur" });
      }

      await this.authService.connectOAuthService(
        user.id,
        {
          serviceName: 'gitlab',
          accessToken: gitlabData.oauth_tokens.access_token,
          refreshToken: gitlabData.oauth_tokens.refresh_token,
          expiresAt: gitlabData.oauth_tokens.expires_at,
          scope: gitlabData.oauth_tokens.scope,
          email: gitlabData.email,
          displayName: gitlabData.name
        },
        ipAddress,
        userAgent
      );

      if (source === 'services') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        return res.redirect(`${frontendUrl}/oauth/service-connected?service=gitlab&status=connected`);
      }

      if (source === 'mobile' && userId) {
        return res.redirect(`relay://oauth-callback?service=gitlab&status=connected`);
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      storeRefreshToken(refreshToken);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      this.handleOAuthRedirect(req, res, accessToken, user, state);
    } catch (err: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || 'Erreur OAuth2 GitLab')}`);
    }
  };

  // ==================== OAUTH YOUTUBE =============
  youtubeRedirect = (req: Request, res: Response) => {
    try {
      const source = this.resolveOAuthSource(req);
      const url = getGoogleAuthURL(source);
      res.redirect(url);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to initiate YouTube OAuth', details: error.message });
    }
  };

  youtubeCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code) return res.status(400).json({ success: false, error: "Code manquant" });
    if (!validateCSRFToken(state))
      return res.status(403).json({ success: false, error: "Token CSRF invalide ou expiré" });

    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      const googleData = await getGoogleUser(code);

      if (!googleData.email)
        return res.status(400).json({ success: false, error: "Impossible de récupérer l'email depuis Google" });

      let source = 'login';
      let userId: string | null = null;

      if (state && state.includes(':')) {
        const parts = state.split(':');
        if (parts.length > 1) {
          try {
            const base64Part = parts[1];
            const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

            if (decoded.startsWith('services:')) {
              source = 'services';
              userId = decoded.split(':')[1];
            } else if (decoded.startsWith('mobile:')) {
              source = 'mobile';
              userId = decoded.split(':')[1];
            } else if (decoded === 'services') {
              source = 'services';
              console.log('[YouTube OAuth] ✓✓ Source: services (no userId - will use email lookup)');
            } else if (decoded === 'mobile') {
              source = 'mobile';
            }
          } catch (e: any) {
            console.warn('[YouTube OAuth] Failed to decode state:', e.message);
          }
        }
      }

      let user;

      if ((source === 'services' || source === 'mobile') && userId) {
        user = await this.authService.getUserById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
        }
      } else {
        user = await this.authService.getUserByEmail(googleData.email);
        if (!user) {
          const result = await this.authService.registerUser({ email: googleData.email }, ipAddress, userAgent);
          user = result.user;
        }
      }

      if (!user) {
        return res.status(500).json({ success: false, error: "Impossible de créer ou récupérer l'utilisateur" });
      }

      let youtubeDisplayName: string | undefined;

      if (googleData.oauth_tokens?.access_token) {
        try {
          const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
              part: 'snippet',
              mine: 'true'
            },
            headers: {
              Authorization: `Bearer ${googleData.oauth_tokens.access_token}`
            }
          });

          const channelTitle = channelResponse.data?.items?.[0]?.snippet?.title;
          if (channelTitle && typeof channelTitle === 'string' && channelTitle.trim().length > 0) {
            youtubeDisplayName = channelTitle.trim();
            console.log('[YouTube OAuth] Channel title resolved:', youtubeDisplayName);
          }
        } catch (channelError: any) {
          console.warn('[YouTube OAuth] Failed to fetch channel info:', channelError.response?.data || channelError.message);
        }
      }

      const fallbackEmail = googleData.email || user.email;
      const displayName = youtubeDisplayName || googleData.name || user.name || fallbackEmail || undefined;

      console.log('[YouTube OAuth] Google user data:', {
        email: fallbackEmail,
        name: displayName,
        id: googleData.id,
      });

      await this.authService.connectOAuthService(
        user.id,
        {
          serviceName: 'youtube',
          accessToken: googleData.oauth_tokens.access_token,
          refreshToken: googleData.oauth_tokens.refresh_token,
          expiresAt: googleData.oauth_tokens.expires_at,
          scope: googleData.oauth_tokens.scope,
          email: fallbackEmail || undefined,
          displayName
        },
        ipAddress,
        userAgent
      );

      if (source === 'services') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        return res.redirect(`${frontendUrl}/oauth/service-connected?service=youtube&status=connected`);
      }

      if (source === 'mobile' && userId) {
        return res.redirect(`relay://oauth-callback?service=youtube&status=connected`);
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      storeRefreshToken(refreshToken);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      this.handleOAuthRedirect(req, res, accessToken, user, state);
    } catch (err: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || 'Erreur OAuth2 YouTube')}`);
    }
  };
}

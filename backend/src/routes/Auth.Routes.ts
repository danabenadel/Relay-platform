import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";
import { authLimiter, oauthLimiter } from "../middleware/rateLimiter";

const router = Router();
const authController = new AuthController();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/profile', authenticateToken, authController.profile);

router.post('/oauth/connect', authenticateToken, oauthLimiter, authController.connectOAuth);
router.delete('/oauth/:serviceName', authenticateToken, oauthLimiter, authController.disconnectOAuth);
router.get('/oauth/tokens', authenticateToken, authController.listOAuthTokens);

router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/oauth/google', authController.googleRedirect);
router.get('/oauth/google/callback', authController.googleCallback);

router.get('/oauth/github', authController.githubRedirect);
router.get('/oauth/github/callback', authController.githubCallback);

router.get('/oauth/facebook', authController.facebookRedirect);
router.get('/oauth/facebook/callback', authController.facebookCallback);

router.get('/oauth/spotify', authController.spotifyRedirect);
router.get('/oauth/spotify/callback', authController.spotifyCallback);

router.get('/oauth/reddit', authController.redditRedirect);
router.get('/oauth/reddit/callback', authController.redditCallback);

// ==================== OAUTH ONEDRIVE ====================
router.get('/oauth/onedrive', authController.onedriveRedirect);
router.get('/oauth/onedrive/callback', authController.onedriveCallback);

// ==================== OAUTH DISCORD ====================
router.get('/oauth/discord', authController.discordRedirect);
router.get('/oauth/discord/callback', authController.discordCallback);

// ==================== OAUTH YOUTUBE ====================
router.get('/oauth/youtube', authController.youtubeRedirect);
router.get('/oauth/youtube/callback', authController.youtubeCallback);

// ==================== OAUTH GITLAB ====================
router.get('/oauth/gitlab', authController.gitlabRedirect);
router.get('/oauth/gitlab/callback', authController.gitlabCallback);

// ==================== OAUTH NOTION ====================
router.get('/oauth/notion', authController.notionRedirect);
router.get('/oauth/notion/callback', authController.notionCallback);
router.post('/oauth/notion/callback', authController.notionCallback);

export default router;

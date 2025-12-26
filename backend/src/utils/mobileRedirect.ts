import { Request, Response } from 'express';

export function isMobileApp(req: Request): boolean {
  if (req.query.source === 'mobile') {
    return true;
  }

  const userAgent = req.get('User-Agent') || '';
  return userAgent.includes('Dart') ||
         userAgent.includes('Flutter') ||
         userAgent.includes('okhttp') ||
         userAgent.includes('ReactNative');
}

export function handleOAuthSuccess(
  req: Request,
  res: Response,
  token: string,
  user: { id: string; email: string; name?: string }
) {
  if (isMobileApp(req)) {
    const mobileDeepLink = `relay://oauth-callback?token=${token}&name=${encodeURIComponent(user.name || user.email)}`;
    return res.redirect(mobileDeepLink);
  }

  const webRedirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const callbackUrl = `${webRedirectUrl}/auth/callback?token=${token}&name=${encodeURIComponent(user.name || user.email)}`;
  return res.redirect(callbackUrl);
}

export function handleOAuthError(
  req: Request,
  res: Response,
  error: string
) {
  if (isMobileApp(req)) {
    const mobileDeepLink = `relay://oauth-callback?error=${encodeURIComponent(error)}`;
    return res.redirect(mobileDeepLink);
  }

  const webRedirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const errorUrl = `${webRedirectUrl}/auth/callback?error=${encodeURIComponent(error)}`;
  return res.redirect(errorUrl);
}

import { randomBytes } from 'node:crypto';

import type { LoginInput, RegisterInput } from '@hireboost/shared';
import type { Request, Response } from 'express';

import { env, isGoogleOAuthConfigured } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { ApiError } from '../../utils/api-error.js';
import { created, noContent, ok } from '../../utils/api-response.js';
import { verifyRefreshToken } from '../../utils/jwt.js';
import {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  setRefreshCookie,
} from './auth.cookies.js';
import {
  getCurrentUser,
  loginWithEmail,
  loginWithGoogleProfile,
  refreshSessionForUser,
  registerWithEmail,
} from './auth.service.js';
import { buildAuthUrl, exchangeCodeForProfile } from './google-oauth.service.js';

/* -------------------------------------------------------------------------- */
/*                                  Register                                  */
/* -------------------------------------------------------------------------- */

export async function register(req: Request, res: Response): Promise<Response> {
  const input = req.body as RegisterInput;
  const { session, refreshToken } = await registerWithEmail(input);
  setRefreshCookie(res, refreshToken);
  return created(res, session, 'Account created');
}

/* -------------------------------------------------------------------------- */
/*                                   Login                                    */
/* -------------------------------------------------------------------------- */

export async function login(req: Request, res: Response): Promise<Response> {
  const input = req.body as LoginInput;
  const { session, refreshToken } = await loginWithEmail(input);
  setRefreshCookie(res, refreshToken);
  return ok(res, session, 'Signed in');
}

/* -------------------------------------------------------------------------- */
/*                                  Refresh                                   */
/* -------------------------------------------------------------------------- */

export async function refresh(req: Request, res: Response): Promise<Response> {
  const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!cookieToken) throw ApiError.unauthorized('Missing refresh token');

  const claims = verifyRefreshToken(cookieToken);
  const { session, refreshToken } = await refreshSessionForUser(claims.sub);
  setRefreshCookie(res, refreshToken);
  return ok(res, session, 'Session refreshed');
}

/* -------------------------------------------------------------------------- */
/*                                   Logout                                   */
/* -------------------------------------------------------------------------- */

export async function logout(_req: Request, res: Response): Promise<Response> {
  clearRefreshCookie(res);
  return noContent(res);
}

/* -------------------------------------------------------------------------- */
/*                                     Me                                     */
/* -------------------------------------------------------------------------- */

export async function me(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw ApiError.unauthorized();
  const user = await getCurrentUser(req.auth.sub);
  return ok(res, user);
}

/* -------------------------------------------------------------------------- */
/*                                Google OAuth                                */
/* -------------------------------------------------------------------------- */

const OAUTH_STATE_COOKIE = 'hb_oauth_state';
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

export async function googleStart(_req: Request, res: Response): Promise<void> {
  if (!isGoogleOAuthConfigured) {
    return res.redirect(
      `${env.WEB_APP_URL}${env.GOOGLE_OAUTH_FAILURE_PATH}?error=google_oauth_not_configured`,
    );
  }
  const state = randomBytes(24).toString('hex');
  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN,
    path: '/',
    maxAge: OAUTH_STATE_MAX_AGE_MS,
  });
  return res.redirect(buildAuthUrl(state));
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  const failure = `${env.WEB_APP_URL}${env.GOOGLE_OAUTH_FAILURE_PATH}`;
  const code = typeof req.query.code === 'string' ? req.query.code : null;
  const state = typeof req.query.state === 'string' ? req.query.state : null;
  const cookieState = req.cookies?.[OAUTH_STATE_COOKIE] as string | undefined;
  res.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });

  if (!code) {
    return res.redirect(`${failure}?error=missing_code`);
  }
  if (!state || !cookieState || state !== cookieState) {
    return res.redirect(`${failure}?error=invalid_state`);
  }

  try {
    const profile = await exchangeCodeForProfile(code);
    const { session, refreshToken } = await loginWithGoogleProfile(profile);
    setRefreshCookie(res, refreshToken);
    const success = new URL(`${env.WEB_APP_URL}${env.GOOGLE_OAUTH_SUCCESS_PATH}`);
    success.searchParams.set('accessToken', session.accessToken);
    success.searchParams.set('expiresIn', String(session.expiresIn));
    return res.redirect(success.toString());
  } catch (err) {
    logger.error({ err }, 'Google OAuth callback failed');
    return res.redirect(`${failure}?error=oauth_failed`);
  }
}

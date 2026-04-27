import { OAuth2Client } from 'google-auth-library';

import { env, isGoogleOAuthConfigured } from '../../config/env.js';
import { ApiError } from '../../utils/api-error.js';

export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

let cachedClient: OAuth2Client | null = null;

function getClient(): OAuth2Client {
  if (!isGoogleOAuthConfigured) {
    throw ApiError.badRequest(
      'Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in apps/api/.env.',
    );
  }
  if (!cachedClient) {
    cachedClient = new OAuth2Client({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.GOOGLE_REDIRECT_URI,
    });
  }
  return cachedClient;
}

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid',
];

/** Build the redirect URL the browser should be sent to. */
export function buildAuthUrl(state: string): string {
  return getClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: true,
    scope: SCOPES,
    state,
  });
}

/** Exchange an OAuth code for an id_token + verified user profile. */
export async function exchangeCodeForProfile(code: string): Promise<GoogleProfile> {
  const client = getClient();

  let tokens;
  try {
    const res = await client.getToken({ code, redirect_uri: env.GOOGLE_REDIRECT_URI });
    tokens = res.tokens;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    throw ApiError.unauthorized(`Failed to exchange Google code: ${msg}`);
  }

  if (!tokens.id_token) {
    throw ApiError.unauthorized('Google did not return an id_token');
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    throw ApiError.unauthorized(`Invalid Google id_token: ${msg}`);
  }

  if (!payload?.sub || !payload.email) {
    throw ApiError.unauthorized('Google profile missing sub/email');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    emailVerified: Boolean(payload.email_verified),
    name: payload.name ?? payload.email.split('@')[0] ?? 'New user',
    picture: payload.picture,
  };
}

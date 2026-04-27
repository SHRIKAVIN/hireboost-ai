import type { AuthSession, LoginInput, RegisterInput } from '@hireboost/shared';

import { env } from '../../config/env.js';
import { ApiError } from '../../utils/api-error.js';
import {
  expiresInToSeconds,
  signAccessToken,
  signRefreshToken,
} from '../../utils/jwt.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import {
  createLocalUser,
  findUserByEmail,
  findUserById,
  touchLastLogin,
  upsertGoogleUser,
} from '../users/user.service.js';
import type { UserDocument } from '../users/user.model.js';
import type { GoogleProfile } from './google-oauth.service.js';

interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

function issueTokens(user: UserDocument): IssuedTokens {
  const sub = String(user._id);
  return {
    accessToken: signAccessToken({ sub, email: user.email, role: user.role }),
    refreshToken: signRefreshToken({ sub }),
  };
}

function buildSession(user: UserDocument, accessToken: string): AuthSession {
  return {
    user: user.toPublic(),
    accessToken,
    expiresIn: expiresInToSeconds(env.JWT_EXPIRES_IN),
    tokenType: 'Bearer',
  };
}

/* -------------------------------------------------------------------------- */
/*                                 Register                                   */
/* -------------------------------------------------------------------------- */

export async function registerWithEmail(input: RegisterInput): Promise<{
  session: AuthSession;
  refreshToken: string;
}> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createLocalUser({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  await touchLastLogin(user._id);

  const { accessToken, refreshToken } = issueTokens(user);
  return { session: buildSession(user, accessToken), refreshToken };
}

/* -------------------------------------------------------------------------- */
/*                                  Login                                     */
/* -------------------------------------------------------------------------- */

export async function loginWithEmail(input: LoginInput): Promise<{
  session: AuthSession;
  refreshToken: string;
}> {
  const user = await findUserByEmail(input.email);
  if (!user || !user.passwordHash) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  await touchLastLogin(user._id);

  const { accessToken, refreshToken } = issueTokens(user);
  return { session: buildSession(user, accessToken), refreshToken };
}

/* -------------------------------------------------------------------------- */
/*                                  Refresh                                   */
/* -------------------------------------------------------------------------- */

export async function refreshSessionForUser(userId: string): Promise<{
  session: AuthSession;
  refreshToken: string;
}> {
  const user = await findUserById(userId);
  if (!user) throw ApiError.unauthorized('Account no longer exists');

  const { accessToken, refreshToken } = issueTokens(user);
  return { session: buildSession(user, accessToken), refreshToken };
}

/* -------------------------------------------------------------------------- */
/*                                    Me                                      */
/* -------------------------------------------------------------------------- */

export async function getCurrentUser(userId: string) {
  const user = await findUserById(userId);
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  return user.toPublic();
}

/* -------------------------------------------------------------------------- */
/*                                Google OAuth                                */
/* -------------------------------------------------------------------------- */

export async function loginWithGoogleProfile(profile: GoogleProfile): Promise<{
  session: AuthSession;
  refreshToken: string;
}> {
  const user = await upsertGoogleUser({
    googleId: profile.sub,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture,
    emailVerified: profile.emailVerified,
  });

  await touchLastLogin(user._id);

  const { accessToken, refreshToken } = issueTokens(user);
  return { session: buildSession(user, accessToken), refreshToken };
}

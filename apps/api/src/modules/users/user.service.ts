import type { AuthProvider } from '@hireboost/shared';
import type { Types } from 'mongoose';

import { UserModelRef, type UserDocument } from './user.model.js';

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  return UserModelRef.findOne({ emailLower: email.toLowerCase() });
}

export async function findUserById(id: string | Types.ObjectId): Promise<UserDocument | null> {
  return UserModelRef.findById(id);
}

export async function findUserByGoogleId(googleId: string): Promise<UserDocument | null> {
  return UserModelRef.findOne({ googleId });
}

export async function createLocalUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<UserDocument> {
  return UserModelRef.create({
    name: input.name,
    email: input.email,
    emailLower: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    provider: 'local' satisfies AuthProvider,
    emailVerified: false,
  });
}

export async function upsertGoogleUser(input: {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
}): Promise<UserDocument> {
  const existing =
    (await findUserByGoogleId(input.googleId)) ??
    (await UserModelRef.findOne({ emailLower: input.email.toLowerCase() }));

  if (existing) {
    existing.googleId = input.googleId;
    existing.provider = 'google';
    existing.emailVerified = existing.emailVerified || input.emailVerified;
    if (input.avatarUrl && !existing.avatarUrl) existing.avatarUrl = input.avatarUrl;
    if (!existing.name && input.name) existing.name = input.name;
    await existing.save();
    return existing;
  }

  return UserModelRef.create({
    name: input.name,
    email: input.email,
    emailLower: input.email.toLowerCase(),
    avatarUrl: input.avatarUrl,
    googleId: input.googleId,
    provider: 'google' satisfies AuthProvider,
    emailVerified: input.emailVerified,
  });
}

export async function touchLastLogin(userId: string | Types.ObjectId): Promise<void> {
  await UserModelRef.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } });
}

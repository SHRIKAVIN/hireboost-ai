import type { AuthProvider, UpdateCurrentUserInput } from '@hireboost/shared';
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

export async function updateUserById(
  userId: string,
  patch: UpdateCurrentUserInput,
): Promise<UserDocument | null> {
  const user = await findUserById(userId);
  if (!user) return null;

  if (user.get('preferences') == null) {
    user.set('preferences', {
      emailAnalysisReady: true,
      emailProductTips: false,
      inAppAnalysisReady: true,
    });
  }

  if (patch.name !== undefined) {
    user.name = patch.name;
  }

  if (patch.profile) {
    const p = patch.profile;
    if (p.skills !== undefined) user.profile.skills = p.skills;
    if (p.experienceYears !== undefined) user.profile.experienceYears = p.experienceYears;
    if (p.preferredRoles !== undefined) user.profile.preferredRoles = p.preferredRoles;
    if (p.preferredLocations !== undefined) user.profile.preferredLocations = p.preferredLocations;
    if (p.summary !== undefined) user.profile.summary = p.summary;
  }

  if (patch.preferences) {
    const pr = patch.preferences;
    if (pr.emailAnalysisReady !== undefined) user.preferences.emailAnalysisReady = pr.emailAnalysisReady;
    if (pr.emailProductTips !== undefined) user.preferences.emailProductTips = pr.emailProductTips;
    if (pr.inAppAnalysisReady !== undefined) user.preferences.inAppAnalysisReady = pr.inAppAnalysisReady;
  }

  await user.save();
  return user;
}

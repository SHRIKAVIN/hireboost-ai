import type {
  AuthProvider,
  User as UserPublic,
  UserPreferences,
  UserProfile,
} from '@hireboost/shared';
import { UserRole } from '@hireboost/shared';
import {
  Schema,
  model,
  type HydratedDocument,
  type Model,
  type Types,
} from 'mongoose';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface UserDocumentFields {
  email: string;
  emailLower: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  provider: AuthProvider;
  googleId?: string;
  passwordHash?: string;
  emailVerified: boolean;
  profile: UserProfile;
  preferences: UserPreferences;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMethods {
  toPublic(): UserPublic;
}

export type UserDocument = HydratedDocument<UserDocumentFields, UserMethods>;
export type UserModel = Model<UserDocumentFields, Record<string, never>, UserMethods>;

/* -------------------------------------------------------------------------- */
/*                                  Schema                                    */
/* -------------------------------------------------------------------------- */

const userProfileSchema = new Schema<UserProfile>(
  {
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0, min: 0 },
    preferredRoles: { type: [String], default: [] },
    preferredLocations: { type: [String], default: [] },
    summary: { type: String, default: '' },
  },
  { _id: false },
);

const userPreferencesSchema = new Schema<UserPreferences>(
  {
    emailAnalysisReady: { type: Boolean, default: true },
    emailProductTips: { type: Boolean, default: false },
    inAppAnalysisReady: { type: Boolean, default: true },
  },
  { _id: false },
);

const userSchema = new Schema<UserDocumentFields, UserModel, UserMethods>(
  {
    email: { type: String, required: true, trim: true },
    emailLower: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    avatarUrl: { type: String, trim: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.User,
      required: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google'] satisfies AuthProvider[],
      default: 'local',
      required: true,
    },
    googleId: { type: String, trim: true, index: { sparse: true, unique: true } },
    passwordHash: { type: String },
    emailVerified: { type: Boolean, default: false },
    profile: { type: userProfileSchema, default: () => ({}) },
    preferences: { type: userPreferencesSchema, default: () => ({}) },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        if (r._id) r.id = String(r._id);
        delete r._id;
        delete r.passwordHash;
        delete r.emailLower;
        return r;
      },
    },
  },
);

userSchema.pre('validate', function (next) {
  if (this.email && !this.emailLower) {
    this.emailLower = this.email.toLowerCase();
  }
  next();
});

userSchema.method('toPublic', function (this: UserDocument): UserPublic {
  return {
    id: String(this._id as Types.ObjectId),
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    role: this.role,
    provider: this.provider,
    emailVerified: this.emailVerified,
    profile: {
      skills: this.profile?.skills ?? [],
      experienceYears: this.profile?.experienceYears ?? 0,
      preferredRoles: this.profile?.preferredRoles ?? [],
      preferredLocations: this.profile?.preferredLocations ?? [],
      summary: this.profile?.summary ?? '',
    },
    preferences: {
      emailAnalysisReady: this.preferences?.emailAnalysisReady ?? true,
      emailProductTips: this.preferences?.emailProductTips ?? false,
      inAppAnalysisReady: this.preferences?.inAppAnalysisReady ?? true,
    },
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
});

export const UserModelRef = model<UserDocumentFields, UserModel>('User', userSchema);

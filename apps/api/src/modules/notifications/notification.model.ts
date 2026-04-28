import type { AppNotification, NotificationType } from '@hireboost/shared';
import { NotificationType as NotificationTypeValues } from '@hireboost/shared';
import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';

export interface NotificationDocumentFields {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface NotificationMethods {
  toPublic(): AppNotification;
}

export type NotificationDocument = HydratedDocument<NotificationDocumentFields, NotificationMethods>;
export type NotificationModel = Model<NotificationDocumentFields, Record<string, never>, NotificationMethods>;

const notificationSchema = new Schema<NotificationDocumentFields, NotificationModel, NotificationMethods>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      index: true,
      enum: Object.values(NotificationTypeValues),
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    read: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        if (r._id) r.id = String(r._id);
        delete r._id;
        return r;
      },
    },
  },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

notificationSchema.method('toPublic', function (this: NotificationDocument): AppNotification {
  return {
    id: String(this._id as Types.ObjectId),
    userId: String(this.userId),
    type: this.type,
    title: this.title,
    message: this.message,
    read: this.read,
    metadata: this.metadata,
    createdAt: this.createdAt.toISOString(),
  };
});

export const NotificationModelRef = model<NotificationDocumentFields, NotificationModel>(
  'Notification',
  notificationSchema,
);

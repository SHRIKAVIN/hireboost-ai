import type { NotificationType } from '@hireboost/shared';
import type { Types } from 'mongoose';

import { NotificationModelRef, type NotificationDocument } from './notification.model.js';

export async function insertNotification(input: {
  userId: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<NotificationDocument> {
  return NotificationModelRef.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    read: false,
    metadata: input.metadata,
  });
}

export async function listNotificationsForUser(
  userId: string | Types.ObjectId,
  limit: number,
): Promise<NotificationDocument[]> {
  return NotificationModelRef.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
}

export async function markNotificationRead(
  userId: string | Types.ObjectId,
  notificationId: string,
): Promise<NotificationDocument | null> {
  return NotificationModelRef.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true } },
    { new: true },
  ).exec();
}

export async function markAllNotificationsRead(userId: string | Types.ObjectId): Promise<number> {
  const res = await NotificationModelRef.updateMany({ userId, read: false }, { $set: { read: true } }).exec();
  return res.modifiedCount;
}

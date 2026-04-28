import type { AppNotification, NotificationType } from '@hireboost/shared';

import {
  insertNotification,
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from './notification.repository.js';

export async function createNotificationForUser(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<AppNotification> {
  const doc = await insertNotification(input);
  return doc.toPublic();
}

export async function listNotifications(userId: string, limit: number): Promise<AppNotification[]> {
  const docs = await listNotificationsForUser(userId, limit);
  return docs.map((d) => d.toPublic());
}

export async function markOneRead(userId: string, notificationId: string): Promise<AppNotification | null> {
  const doc = await markNotificationRead(userId, notificationId);
  return doc ? doc.toPublic() : null;
}

export async function markAllRead(userId: string): Promise<{ count: number }> {
  const count = await markAllNotificationsRead(userId);
  return { count };
}

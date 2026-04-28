import type { ApiResponse, AppNotification, NotificationListResponse } from '@hireboost/shared';

import { apiClient } from '@/lib/api-client';

export const notificationsApi = {
  async list(limit = 20): Promise<AppNotification[]> {
    const { data } = await apiClient.get<ApiResponse<NotificationListResponse>>('/notifications', {
      params: { limit },
    });
    if (!data.success) throw new Error(data.error.message);
    return data.data.items;
  },

  async markRead(id: string): Promise<AppNotification> {
    const { data } = await apiClient.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`);
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },

  async markAllRead(): Promise<void> {
    const { data } = await apiClient.post<ApiResponse<{ count: number }>>('/notifications/read-all');
    if (!data.success) throw new Error(data.error.message);
  },
};

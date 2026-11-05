export type NotificationType = 'work_order' | 'quality' | 'equipment' | 'equipment_fault' | 'warehouse' | 'system';
export type NotificationLevel = 'info' | 'warning' | 'error';
export type { Notification } from '../generated/models/Notification.d.ts';
import type { Notification } from '../generated/models/Notification.d.ts';
export interface NotificationListParams {
    page?: number;
    pageSize?: number;
    type?: NotificationType;
    isRead?: boolean;
}
export interface NotificationListResult {
    list: Notification[];
    total: number;
    page: number;
    pageSize: number;
}
export interface NotificationPreference {
    notificationType: NotificationType;
    inAppEnabled: boolean;
    pushEnabled: boolean;
}
export declare const notificationService: {
    list(params?: NotificationListParams): Promise<NotificationListResult>;
    unreadCount(): Promise<number>;
    markAsRead(id: string): Promise<void>;
    markAllAsRead(type?: NotificationType): Promise<void>;
    preferences(): Promise<NotificationPreference[]>;
    savePreferences(preferences: NotificationPreference[]): Promise<NotificationPreference[]>;
    registerPushToken(token: string): Promise<void>;
    unregisterPushToken(token: string): Promise<void>;
};

import type { NotificationLevel } from './NotificationLevel.d.ts';
import type { NotificationType } from './NotificationType.d.ts';
import type { User } from './User.d.ts';
export type Notification = {
    /**
     * 触发该通知的用户（用于排除自己触发的通知）
     */
    actorId?: string | null;
    companyId: string;
    content: string;
    createdAt: string;
    /**
     * 仅用于指定业务事实的时间窗去重，不参与通知跳转。
     */
    dedupKey: string | null;
    id: string;
    isRead: boolean;
    level: NotificationLevel;
    readAt?: string | null;
    refId?: string | null;
    /**
     * refId 指向的实体类型，用于前端精确跳转
     */
    refType?: string | null;
    title: string;
    type: NotificationType;
    updatedAt: string;
    user?: User | null;
    userId?: string | null;
};

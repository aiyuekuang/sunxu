import type { PaginatedList } from './_base.d.ts';
export type AnnouncementPriority = 'normal' | 'important' | 'urgent';
export type AnnouncementStatus = 'draft' | 'published' | 'archived';
export type AnnouncementTargetType = 'all' | 'department' | 'role' | 'user';
export interface Announcement {
    id: string;
    title: string;
    content: string;
    typeCode: string | null;
    priority: AnnouncementPriority;
    status: AnnouncementStatus;
    targetType: AnnouncementTargetType;
    isPinned: boolean;
    pinExpiresAt: string | null;
    publishAt: string | null;
    expiresAt: string | null;
    attachmentUrls: string[];
    requireConfirm: boolean;
    authorId: string;
    author?: {
        id: string;
        username: string;
        realName: string | null;
    };
    targets?: AnnouncementTarget[];
    isRead?: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface AnnouncementTarget {
    id: string;
    announcementId: string;
    targetType: string;
    targetId: string;
}
export interface AnnouncementListParams {
    page?: number;
    pageSize?: number;
    status?: string;
    typeCode?: string;
    priority?: AnnouncementPriority;
    keyword?: string;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
}
export interface MyAnnouncementListParams {
    page?: number;
    pageSize?: number;
    isRead?: boolean;
    typeCode?: string;
    keyword?: string;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
}
export interface CreateAnnouncementDto {
    title: string;
    content: string;
    typeCode?: string;
    priority?: AnnouncementPriority;
    targetType: AnnouncementTargetType;
    targetIds?: string[];
    isPinned?: boolean;
    pinExpiresAt?: string;
    publishAt?: string;
    expiresAt?: string;
    attachmentUrls?: string[];
    requireConfirm?: boolean;
}
export interface UpdateAnnouncementDto extends Partial<CreateAnnouncementDto> {
    id: string;
}
export interface ReadStatsResult {
    list: ReadStatsUser[];
    total: number;
    page: number;
    pageSize: number;
    readCount: number;
    totalTargetCount: number;
}
export interface ReadStatsUser {
    id: string;
    username: string;
    realName: string | null;
    departmentId: string | null;
    isRead: boolean;
    readAt: string | null;
}
export declare const announcementService: {
    create: (dto: CreateAnnouncementDto) => Promise<Announcement>;
    update: (dto: UpdateAnnouncementDto) => Promise<Announcement>;
    publish: (id: string) => Promise<void>;
    archive: (id: string) => Promise<void>;
    delete: (id: string) => Promise<void>;
    list: (params?: AnnouncementListParams) => Promise<PaginatedList<Announcement>>;
    detail: (id: string) => Promise<Announcement>;
    readStats: (params: {
        id: string;
        page?: number;
        pageSize?: number;
        isRead?: boolean;
    }) => Promise<ReadStatsResult>;
    myList: (params?: MyAnnouncementListParams) => Promise<PaginatedList<Announcement>>;
    myDetail: (id: string) => Promise<Announcement>;
    pinned: () => Promise<Announcement[]>;
    unconfirmedUrgent: () => Promise<Announcement[]>;
    confirmRead: (id: string) => Promise<void>;
    unreadCount: () => Promise<number>;
};

import type { AppReleaseHistoryItemDto } from '../generated/models/AppReleaseHistoryItemDto.d.ts';
import type { AppReleaseHistoryResponseDto } from '../generated/models/AppReleaseHistoryResponseDto.d.ts';
import { type AppUpdateSource } from './app-update.logic.d.ts';
export type { AppUpdateSource } from './app-update.logic.d.ts';
export declare class AppUpdateRequestInvalidatedError extends Error {
    constructor();
}
interface AppUpdateCheckOptions {
    source?: AppUpdateSource;
}
export interface AppDownloadInfo {
    source: AppUpdateSource;
    url: string | null;
    versionName?: string | null;
    versionCode?: number | null;
    forceUpdate?: boolean | null;
    releaseNotes?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    fileSha256?: string | null;
    uploadedAt?: string | null;
}
export interface AppUpdateInfo {
    hasUpdate: boolean;
    versionName?: string | null;
    versionCode?: number | null;
    forceUpdate?: boolean;
    releaseNotes?: string | null;
    message?: string | null;
    downloadUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    fileSha256?: string | null;
    source: AppUpdateSource;
}
export type AppReleaseHistoryItem = AppReleaseHistoryItemDto;
export type AppReleaseHistory = AppReleaseHistoryResponseDto;
export declare const appUpdateService: {
    getRequestScope(source: AppUpdateSource): string;
    getDownloadInfo(options?: AppUpdateCheckOptions): Promise<AppDownloadInfo>;
    getOfficialDownloadInfo(): Promise<AppDownloadInfo>;
    getHistory(): Promise<AppReleaseHistory>;
    checkUpdate(options?: AppUpdateCheckOptions): Promise<AppUpdateInfo>;
};

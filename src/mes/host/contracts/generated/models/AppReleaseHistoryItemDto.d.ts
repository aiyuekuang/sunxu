export type AppReleaseHistoryItemDto = {
    /**
     * 版本记录 ID
     */
    id: string;
    /**
     * 是否当前版本
     */
    isCurrent: boolean;
    platform: AppReleaseHistoryItemDto.platform;
    publishedAt?: string | null;
    releaseNotes?: string | null;
    versionCode?: number | null;
    versionName?: string | null;
};
export declare namespace AppReleaseHistoryItemDto {
    enum platform {
        ANDROID = "android",
        IOS = "ios"
    }
}

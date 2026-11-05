export type AppUpdateSource = 'instance' | 'official';
export interface AppUpdateVersionInput {
    url: string | null;
    fileName?: string | null;
    forceUpdate?: boolean | null;
    releaseNotes?: string | null;
    versionCode?: number | null;
    versionName?: string | null;
}
export interface EvaluatedAppUpdate {
    hasUpdate: boolean;
    message: string | null;
    releaseNotes: string | null;
    versionCode: number | null;
    versionName: string | null;
}
export declare function normalizeSha256(value: string | null | undefined): string | null;
export declare function extractVersion(input?: string | null): string | null;
export declare function compareVersions(left: string, right: string): number;
export declare function canForceAppUpdate(hasUpdate: boolean, forceUpdate: boolean | null | undefined, fileSha256: string | null | undefined): boolean;
/**
 * 历史买断实例可能只有旧 appDownloadUrl，且没有版本元数据。它不是“存在 URL 即更新”，
 * 否则用户会被永久误报。只有服务端明确提供可比较的版本号时才提示更新。
 */
export declare function evaluateAppUpdate(input: AppUpdateVersionInput, currentVersionName: string, currentVersionCode: number): EvaluatedAppUpdate;

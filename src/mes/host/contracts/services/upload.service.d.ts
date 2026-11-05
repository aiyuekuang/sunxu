export interface UploadFileInput {
    uri: string;
    name?: string;
    mimeType?: string | null;
}
export declare const uploadService: {
    uploadImage(uri: string): Promise<string>;
    /** Batch upload with concurrency limit to avoid overwhelming the server */
    uploadImages(uris: string[], concurrency?: number): Promise<string[]>;
    uploadDrawingFiles(files: UploadFileInput[], batchSize?: number): Promise<string[]>;
    uploadBusinessFiles(files: UploadFileInput[], batchSize?: number): Promise<string[]>;
};
export interface FileDisplayInfo {
    url: string;
    fileName?: string | null;
    mimeType?: string | null;
    size?: number | null;
    thumbnailUrl?: string | null;
}
/** 批量加载附件显示名；同一事件循环内的多个附件组件会合并成一次请求。 */
export declare function loadFileDisplayInfos(urls: string[]): Promise<void>;
/** 读取已缓存的附件显示名；未加载或没有文件记录时返回 null。 */
export declare function getCachedFileDisplayName(url: string): string | null;

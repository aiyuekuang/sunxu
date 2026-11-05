export type CopyBomDto = {
    /**
     * 新版本号（不传则自动递增）
     */
    newVersion?: string;
    /**
     * 源BOM ID
     */
    sourceId: string;
};

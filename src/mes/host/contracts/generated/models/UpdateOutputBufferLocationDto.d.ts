export type UpdateOutputBufferLocationDto = {
    /**
     * 生产输出暂存ID
     */
    id: string;
    /**
     * 结构化暂存仓位ID
     */
    locationId?: string;
    /**
     * 暂存位置文本
     */
    storageLocation?: string;
};

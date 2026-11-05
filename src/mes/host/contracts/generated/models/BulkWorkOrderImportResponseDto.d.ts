export type BulkWorkOrderImportResponseDto = {
    /**
     * 成功创建数量
     */
    created: number;
    /**
     * 错误信息列表
     */
    errors: Array<string>;
    /**
     * 跳过数量
     */
    skipped: number;
};

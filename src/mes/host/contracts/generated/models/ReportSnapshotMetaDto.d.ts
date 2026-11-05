export type ReportSnapshotMetaDto = {
    coverage: ReportSnapshotMetaDto.coverage;
    /**
     * 结果数据截至时间；无法确定时返回 null
     */
    dataAsOf?: Record<string, any> | null;
    /**
     * 本次响应生成时间
     */
    generatedAt: string;
    warnings: Array<string>;
};
export declare namespace ReportSnapshotMetaDto {
    enum coverage {
        COMPLETE = "complete",
        PARTIAL = "partial",
        UNAVAILABLE = "unavailable"
    }
}

export type ReverseToolingUsageRecordDto = {
    /**
     * 工装寿命使用记录ID
     */
    id: string;
    /**
     * 冲回原因
     */
    remark: string;
    /**
     * 本次冲回的寿命消耗数量
     */
    useCount: number;
};

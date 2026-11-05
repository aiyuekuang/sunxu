export type ChangeBatchStatusDto = {
    id: string;
    /**
     * 状态变更原因
     */
    reason?: string;
    status: ChangeBatchStatusDto.status;
};
export declare namespace ChangeBatchStatusDto {
    enum status {
        AVAILABLE = "available",
        QUARANTINE = "quarantine",
        EXPIRED = "expired",
        CONSUMED = "consumed"
    }
}

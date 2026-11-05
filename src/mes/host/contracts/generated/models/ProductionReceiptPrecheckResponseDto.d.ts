export type ProductionReceiptPrecheckResponseDto = {
    blockers: Array<string>;
    /**
     * 确认时是否必须选择仓位（严格仓位仓）
     */
    locationRequired: boolean;
    /**
     * 当前生产入库单的实际闭环方式
     */
    mode: ProductionReceiptPrecheckResponseDto.mode;
    /**
     * 是否需要确认时手工选择包装规格
     */
    packageSpecRequired: boolean;
    /**
     * 质量门控是否阻断确认
     */
    qualityBlocked: boolean;
    /**
     * 质量门控阻断原因（qualityBlocked=true 时返回）
     */
    qualityBlockedReason?: string;
    /**
     * 确认时是否必须选择入库仓（单据未带仓库）
     */
    warehouseRequired: boolean;
    warnings: Array<string>;
};
export declare namespace ProductionReceiptPrecheckResponseDto {
    /**
     * 当前生产入库单的实际闭环方式
     */
    enum mode {
        AUTO_ON_REPORT = "auto_on_report",
        PENDING_CONFIRMATION = "pending_confirmation"
    }
}

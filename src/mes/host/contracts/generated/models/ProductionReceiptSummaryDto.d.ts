export type ProductionReceiptSummaryDto = {
    blockers: Array<string>;
    /**
     * 本次生成的包装单元数（箱数）
     */
    generatedPackageCount: number;
    /**
     * 本次生成的待确认生产入库数量
     */
    generatedReceiptCount: number;
    /**
     * 生成的生产入库单ID
     */
    generatedReceiptId?: string;
    /**
     * 生成的生产入库单编号
     */
    generatedReceiptNo?: string;
    /**
     * 本次生成的待确认入库总数量
     */
    generatedReceiptQty: number;
    /**
     * 本次报工生效的生产入库单闭环方式
     */
    mode: ProductionReceiptSummaryDto.mode;
    /**
     * 暂存位置
     */
    outputBufferLocation?: string;
    /**
     * 生产输出暂存待处理数量
     */
    outputBufferOpenQty: number;
    /**
     * 不足完整包装数量（仅启用完整包装策略时返回，策略计算值）
     */
    packageRemainderQty?: number;
    /**
     * 是否因缺包装规格未生成生产入库单（已生成维护待办）
     */
    packageSpecMissing?: boolean;
    warnings: Array<string>;
};
export declare namespace ProductionReceiptSummaryDto {
    /**
     * 本次报工生效的生产入库单闭环方式
     */
    enum mode {
        AUTO_ON_REPORT = "auto_on_report",
        PENDING_CONFIRMATION = "pending_confirmation"
    }
}

export type SaleOrderProductionPreparationBomDto = {
    /**
     * 已确认或已冻结的订单行本单 BOM 数
     */
    activeConfirmedCount: number;
    /**
     * BOM 来源类型
     */
    sourceType?: string | null;
    /**
     * 单据 BOM 状态
     */
    status?: SaleOrderProductionPreparationBomDto.status | null;
    /**
     * 关联 BOM 数
     */
    totalCount: number;
};
export declare namespace SaleOrderProductionPreparationBomDto {
    /**
     * 单据 BOM 状态
     */
    enum status {
        DRAFT = "draft",
        CONFIRMED = "confirmed",
        FROZEN = "frozen",
        CHANGED = "changed",
        OBSOLETE = "obsolete"
    }
}

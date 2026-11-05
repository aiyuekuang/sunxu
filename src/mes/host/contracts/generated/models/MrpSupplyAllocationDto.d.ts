export type MrpSupplyAllocationDto = {
    /**
     * 配给数量
     */
    allocatedQty: number;
    /**
     * 已消费数量
     */
    consumedQty?: number;
    demandPlanId?: string | null;
    /**
     * 需求生产计划号
     */
    demandPlanNo?: string | null;
    sourcePlanId?: string | null;
    /**
     * 来源生产计划号
     */
    sourcePlanNo?: string | null;
    sourceType: MrpSupplyAllocationDto.sourceType;
    sourceWorkOrderId?: string | null;
    /**
     * 来源工单号
     */
    sourceWorkOrderNo?: string | null;
    /**
     * 执行配给状态
     */
    status?: string;
};
export declare namespace MrpSupplyAllocationDto {
    enum sourceType {
        STOCK = "stock",
        WORK_ORDER = "work_order",
        PURCHASE_ORDER = "purchase_order",
        PURCHASE_REQUISITION = "purchase_requisition",
        NEW_PRODUCTION = "new_production"
    }
}

export type WorkOrderBomComponentOutsourcingOrderDto = {
    /**
     * 委外加工单ID
     */
    id: string;
    /**
     * 委外产出物料编码
     */
    materialCode?: string;
    /**
     * 委外产出物料ID
     */
    materialId: string;
    /**
     * 委外产出物料名称
     */
    materialName?: string;
    /**
     * 委外产出物料规格
     */
    materialSpec?: string;
    /**
     * 委外加工单号
     */
    orderNo: string;
    /**
     * 来源，固定为 BOM 委外组件
     */
    origin: WorkOrderBomComponentOutsourcingOrderDto.origin;
    /**
     * 委外计划产出数量
     */
    qty: number;
    /**
     * 冻结单据 BOM 来源行
     */
    sourceDocumentBomLineId?: string;
    /**
     * 委外单状态
     */
    status: WorkOrderBomComponentOutsourcingOrderDto.status;
    /**
     * 委外产出单位
     */
    unit: string;
};
export declare namespace WorkOrderBomComponentOutsourcingOrderDto {
    /**
     * 来源，固定为 BOM 委外组件
     */
    enum origin {
        MANUAL = "manual",
        DEFAULT_OPERATION = "default_operation",
        TEMPORARY_OPERATION = "temporary_operation",
        BOM_COMPONENT = "bom_component"
    }
    /**
     * 委外单状态
     */
    enum status {
        DRAFT = "draft",
        IN_PROGRESS = "in_progress",
        PARTIAL_RECEIVED = "partial_received",
        RECEIVED = "received",
        REPAIRING = "repairing",
        QUALIFIED = "qualified",
        UNQUALIFIED = "unqualified",
        CLOSED = "closed",
        CANCELLED = "cancelled"
    }
}

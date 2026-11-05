export type RegisterCustomerInboundDto = {
    /**
     * 附件URL
     */
    attachmentUrls?: Array<string>;
    /**
     * 登记阶段禁止传入：批号
     */
    batchNo?: string;
    /**
     * BOM 行ID
     */
    bomItemId?: string;
    /**
     * 保管仓库ID
     */
    custodyWarehouseId: string;
    /**
     * 客户ID
     */
    customerId: string;
    /**
     * 物品名称；未关联物料档案时必填
     */
    itemName?: string;
    /**
     * 规格/型号
     */
    itemSpec?: string;
    /**
     * 物品类型：耗材、标准件、工装、检具、包装物、临时用品等
     */
    itemType?: string;
    /**
     * 保管责任人ID
     */
    keeperUserId: string;
    /**
     * 登记关联的物料档案ID；传入后名称、规格、单位以后端物料档案为准
     */
    linkedMaterialId?: string;
    /**
     * 照片URL
     */
    photoUrls?: Array<string>;
    /**
     * 生产计划ID
     */
    productionPlanId?: string;
    /**
     * 项目号
     */
    projectCode?: string;
    /**
     * 数量（库存数量精度为 4 位小数）
     */
    qty: number;
    /**
     * 到厂登记时间
     */
    receivedAt?: string;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 销售订单ID
     */
    saleOrderId?: string;
    /**
     * 销售订单行ID
     */
    saleOrderItemId?: string;
    /**
     * 具体存放位置
     */
    storageLocation?: string;
    /**
     * 单位；未关联物料档案时必填
     */
    unit?: string;
    /**
     * 用途类型
     */
    usageType: RegisterCustomerInboundDto.usageType;
    /**
     * 登记阶段禁止传入：入库仓库ID
     */
    warehouseId?: string;
    /**
     * 工单ID
     */
    workOrderId?: string;
};
export declare namespace RegisterCustomerInboundDto {
    /**
     * 用途类型
     */
    enum usageType {
        EXTERNAL_ITEM = "external_item",
        PRODUCTION_MATERIAL = "production_material"
    }
}

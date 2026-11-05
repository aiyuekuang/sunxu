export type UpdateCustomerInboundDto = {
    /**
     * 附件URL
     */
    attachmentUrls?: Array<string>;
    /**
     * 保管仓库ID
     */
    custodyWarehouseId?: string;
    /**
     * ID
     */
    id: string;
    /**
     * 物品名称
     */
    itemName?: string;
    /**
     * 规格/型号
     */
    itemSpec?: string;
    /**
     * 物品类型
     */
    itemType?: string;
    /**
     * 保管责任人ID
     */
    keeperUserId?: string;
    /**
     * 登记关联的物料档案ID；传入后名称、规格、单位以后端物料档案为准
     */
    linkedMaterialId?: string;
    /**
     * 照片URL
     */
    photoUrls?: Array<string>;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 具体存放位置
     */
    storageLocation?: string;
    /**
     * 单位
     */
    unit?: string;
    /**
     * 是否解除已关联的物料档案；解除后物品名称、规格、单位按手工登记字段保存
     */
    unlinkLinkedMaterial?: boolean;
};

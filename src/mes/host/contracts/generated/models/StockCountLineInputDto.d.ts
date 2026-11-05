export type StockCountLineInputDto = {
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 前端当前盘点明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 盘点明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 盘点行ID；编辑已有行时用于继承行自定义字段
     */
    id?: string;
    /**
     * 仓位ID；启用严格仓位管控的仓库手工补行时必填
     */
    locationId?: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 客户/供应商货主ID；公司货主不需要填写
     */
    ownerRefId?: string;
    /**
     * 库存货主类型；手工盘点行必须确认公司、客户或供应商货主
     */
    ownerType?: StockCountLineInputDto.ownerType;
    /**
     * 行备注
     */
    remarks?: string;
    /**
     * 位置文本快照
     */
    storageLocation?: string;
};
export declare namespace StockCountLineInputDto {
    /**
     * 库存货主类型；手工盘点行必须确认公司、客户或供应商货主
     */
    enum ownerType {
        COMPANY = "company",
        CUSTOMER = "customer",
        SUPPLIER = "supplier"
    }
}

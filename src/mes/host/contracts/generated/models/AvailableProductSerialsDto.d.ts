export type AvailableProductSerialsDto = {
    /**
     * 当前库存批号
     */
    batchNo: string;
    /**
     * 编辑销售出库单时排除本单已选序列号
     */
    deliveryOrderId?: string;
    /**
     * 序列号关键字；用于扫码或快速筛选
     */
    keyword?: string;
    /**
     * 成品物料ID
     */
    materialId: string;
    /**
     * 出库仓库ID
     */
    warehouseId: string;
};

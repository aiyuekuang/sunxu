export type ConvertCustomerInboundToStockDto = {
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 转客户货主库存的实际入库业务日期；不传时后端按当天处理
     */
    businessDate?: string;
    /**
     * 客户来料批号有效期至；供应商标签日期优先
     */
    expiryDate?: string;
    /**
     * ID
     */
    id: string;
    /**
     * 转正式客户货主库存的入库仓位ID；是否必填由入库仓库仓位管控模式决定
     */
    locationId?: string;
    /**
     * 正式物料档案ID
     */
    materialId: string;
    /**
     * 客户来料批号生产日期
     */
    productionDate?: string;
    /**
     * 转换备注
     */
    remark?: string;
    /**
     * 入库仓库ID
     */
    warehouseId: string;
};

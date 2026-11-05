export type StockOutDto = {
    /**
     * 批号；批号追踪物料出库时必填
     */
    batchNo?: string;
    /**
     * 实际出库日期；不传默认当天，不能晚于当天
     */
    businessDate?: string;
    /**
     * 客户ID；普通库存出库无需填写，销售出库由销售出库生成
     */
    customerId?: string;
    /**
     * 出库仓位ID；是否必填由仓库仓位管控模式决定
     */
    locationId?: string;
    /**
     * 出库物料档案ID
     */
    materialId: string;
    /**
     * 出库数量
     */
    qty: number;
    /**
     * 出库原因码；成品其他出库仅允许 sample/gift/internal_non_production/trial_consumption/non_operating/stock_adjustment 等非经营性原因
     */
    reasonCode?: string;
    /**
     * 关联单据ID
     */
    referenceId?: string;
    /**
     * 关联单号
     */
    referenceNo?: string;
    /**
     * 备注/出库原因
     */
    remarks?: string;
    /**
     * P0 存放位置文本；不参与库存余额主键
     */
    storageLocation?: string;
    /**
     * 直接出库类型：out_scrap=报废出库，out_other=其他出库；正式盘点差异优先使用 stock.stock_count.* 盘点单流程
     */
    type: StockOutDto.type;
    /**
     * 出库仓库ID
     */
    warehouseId: string;
};
export declare namespace StockOutDto {
    /**
     * 直接出库类型：out_scrap=报废出库，out_other=其他出库；正式盘点差异优先使用 stock.stock_count.* 盘点单流程
     */
    enum type {
        OUT_SCRAP = "out_scrap",
        OUT_OTHER = "out_other"
    }
}

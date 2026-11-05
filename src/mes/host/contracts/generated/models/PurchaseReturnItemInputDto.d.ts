export type PurchaseReturnItemInputDto = {
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 交易币别；独立退料且处理财务时必填，不从公司默认币别伪造
     */
    currency?: string;
    /**
     * 前端当前采购退料明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 采购退料明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 交易币别兑本位币汇率；独立退料且处理财务时必填
     */
    exchangeRate?: number;
    /**
     * 既有采购退料明细ID；编辑独立退料时用于保留行级自定义字段
     */
    id?: string;
    /**
     * 退库出库仓位ID
     */
    locationId?: string;
    /**
     * 物料ID；按现存库存退料时必填
     */
    materialId?: string;
    /**
     * 单价是否含税；独立退料且处理财务时必填
     */
    priceIncludesTax?: boolean;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 申请退货数量
     */
    returnQty: number;
    /**
     * 来源采购入库单明细ID；从采购入库单下推时必填
     */
    sourceReceiptItemId?: string;
    /**
     * 出库存放位置文本
     */
    storageLocation?: string;
    /**
     * 税率(%)；独立退料且处理财务时必填，可为 0
     */
    taxRate?: number;
    /**
     * 退货单价（每基础库存单位）；应付冲减或退款时必填
     */
    unitPrice?: number;
};

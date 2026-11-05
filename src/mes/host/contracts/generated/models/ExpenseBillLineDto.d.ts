export type ExpenseBillLineDto = {
    /**
     * 金额（正数）
     */
    amount: number;
    /**
     * 收支类别ID（费用单每行必填）
     */
    categoryId: string;
    /**
     * 前端当前费用明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 费用明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 费用说明
     */
    description?: string;
    /**
     * 费用明细ID；更新时用于保留行级自定义字段
     */
    id?: string;
    /**
     * 行备注
     */
    remark?: string;
    /**
     * 关联采购来源单ID
     */
    sourceId?: string;
    /**
     * 关联采购来源单号快照
     */
    sourceNo?: string;
    /**
     * 关联采购来源单类型（可选追溯，采购运费/杂费挂到采购单据）
     */
    sourceType?: ExpenseBillLineDto.sourceType;
};
export declare namespace ExpenseBillLineDto {
    /**
     * 关联采购来源单类型（可选追溯，采购运费/杂费挂到采购单据）
     */
    enum sourceType {
        PURCHASE_RECEIPT = "purchase_receipt",
        PURCHASE_ORDER = "purchase_order"
    }
}

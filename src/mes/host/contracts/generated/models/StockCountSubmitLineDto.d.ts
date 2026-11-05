export type StockCountSubmitLineDto = {
    /**
     * 实盘数量
     */
    actualQty: number;
    /**
     * 前端当前盘点明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 盘点明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 盘点行ID
     */
    id: string;
    /**
     * 行备注
     */
    remarks?: string;
};

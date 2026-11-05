import type { SaleDeliveryExecutionItemDto } from './SaleDeliveryExecutionItemDto.d.ts';
export type UpdateSaleDeliveryExecutionBodyDto = {
    /**
     * 出库附件URL
     */
    attachmentUrls?: Array<string>;
    /**
     * 前端当前销售出库单自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 销售出库单自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 出库日期
     */
    deliveryDate?: string;
    /**
     * 销售出库单ID
     */
    id: string;
    /**
     * 仓储执行明细；不传则只更新单头执行字段
     */
    items?: Array<SaleDeliveryExecutionItemDto>;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 出库仓库ID
     */
    warehouseId?: string;
};

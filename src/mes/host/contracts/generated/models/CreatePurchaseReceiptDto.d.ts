import type { CreatePurchaseReceiptItemDto } from './CreatePurchaseReceiptItemDto.d.ts';
export type CreatePurchaseReceiptDto = {
    /**
     * 客户端收货动作幂等键；同一请求重试时保持不变
     */
    clientRequestId?: string;
    /**
     * 前端当前采购入库单表头自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 采购入库单表头自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 表头默认入库仓ID；仅用于带入未明确仓库的明细行，不是实际库存仓；传 null 清空默认仓
     */
    defaultWarehouseId?: string | null;
    /**
     * 入库明细行
     */
    items: Array<CreatePurchaseReceiptItemDto>;
    /**
     * 送货单据照片URL列表
     */
    photoUrls?: Array<string>;
    /**
     * 无采购订单入库的受控例外原因；仅无订单且具备例外权限时填写
     */
    purchaseOrderExceptionReason?: string;
    /**
     * 关联采购订单ID
     */
    purchaseOrderId?: string;
    /**
     * 入库业务日期；不传默认当天，不能晚于当天
     */
    receiptDate?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 供应商送货单号
     */
    supplierDeliveryNo?: string;
    /**
     * 供应商ID
     */
    supplierId?: string;
    /**
     * 是否同步更新供应商物料价格（有审批流则延后到确认时执行）
     */
    syncSupplierMaterialPrice?: boolean;
    /**
     * 旧版表头入库仓字段兼容别名；新调用请使用 defaultWarehouseId，实际库存仓请传明细 warehouseId；传 null 清空默认仓
     */
    warehouseId?: string | null;
};

import type { IncomingInspectionReferenceDto } from './IncomingInspectionReferenceDto.d.ts';
import type { IncomingQualityGateStatus } from './IncomingQualityGateStatus.d.ts';
import type { Material } from './Material.d.ts';
import type { PurchaseOrderItem } from './PurchaseOrderItem.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type PurchaseReceiptItem = {
    amount?: number | null;
    /**
     * 实际到货数量（基础库存单位）
     */
    arrivalQty: number;
    /**
     * 实际到货数量（收货单位）
     */
    arrivalReceiptQty?: number | null;
    /**
     * 基础库存单位快照
     */
    baseUnit?: string | null;
    batchNo?: string | null;
    /**
     * 收货单位到基础单位换算系数
     */
    conversionFactorToBase?: number | null;
    createdAt: string;
    /**
     * 现场直接拒收数量（基础库存单位）
     */
    directRejectedQty: number;
    /**
     * 折扣金额
     */
    discountAmount?: number | null;
    /**
     * 折扣率（%），100 表示无折扣
     */
    discountRate: number;
    /**
     * 折后未税金额
     */
    discountedAmount?: number | null;
    /**
     * 供应商批号有效期至
     */
    expiryDate?: string | null;
    /**
     * 入库品质等级（material_grade 字典值），向批次成本快照传播
     */
    grade?: string | null;
    id: string;
    /**
     * 创建采购入库草稿时冻结的 IQC 策略；后续规则变更不影响该单据
     */
    incomingInspectionRequired: boolean;
    /**
     * 创建采购入库草稿时冻结的 IQC 质检模板ID
     */
    incomingInspectionTemplateId?: string | null;
    location?: WarehouseLocation | null;
    /**
     * 确认入库仓位ID
     */
    locationId?: string | null;
    material?: Material;
    materialId: string;
    /**
     * 价格例外审批ID
     */
    priceExceptionApprovalId?: string | null;
    /**
     * 单价是否含税
     */
    priceIncludesTax?: boolean | null;
    /**
     * 入库价格快照
     */
    priceSnapshot?: Record<string, any> | null;
    /**
     * 供应商批号生产日期
     */
    productionDate?: string | null;
    purchaseOrderItem?: PurchaseOrderItem | null;
    /**
     * 来源采购订单明细ID
     */
    purchaseOrderItemId?: string | null;
    /**
     * 质量门禁说明或阻断原因
     */
    qualityGateReason?: string | null;
    /**
     * 采购入库单明细质量门禁状态（运行时派生）
     */
    qualityGateStatus?: IncomingQualityGateStatus;
    /**
     * 当前有效的关联IQC质检单
     */
    qualityInspection?: IncomingInspectionReferenceDto | null;
    quantity: number;
    receiptOrder?: Record<string, any>;
    receiptOrderId: string;
    /**
     * 收货单位数量
     */
    receiptQty?: number | null;
    /**
     * 收货单位
     */
    receiptUnit?: string | null;
    /**
     * 拒收原因(字典 reject_reason 或自由文本)
     */
    rejectReason?: string | null;
    /**
     * 拒收数量(基础单位，不入库、不计应付)
     */
    rejectedQty: number;
    remarks?: string | null;
    /**
     * 确认入仓位置快照
     */
    storageLocationSnapshot?: string | null;
    /**
     * 供应商原始来料批号
     */
    supplierBatchNo?: string | null;
    /**
     * 来源价目行ID
     */
    supplierPriceTierId?: string | null;
    /**
     * 税额
     */
    taxAmount?: number | null;
    /**
     * 税率（%）
     */
    taxRate?: number | null;
    /**
     * 总金额（价税合计）
     */
    totalAmount?: number | null;
    unitPrice?: number | null;
    updatedAt: string;
    warehouse?: Warehouse | null;
    /**
     * 实际入库仓库ID
     */
    warehouseId?: string | null;
};

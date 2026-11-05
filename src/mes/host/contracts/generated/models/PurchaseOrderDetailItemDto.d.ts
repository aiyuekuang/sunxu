import type { Material } from './Material.d.ts';
import type { PurchaseOrderIncomingInspectionDto } from './PurchaseOrderIncomingInspectionDto.d.ts';
import type { PurchaseOrderStatus } from './PurchaseOrderStatus.d.ts';
import type { User } from './User.d.ts';
export type PurchaseOrderDetailItemDto = {
    /**
     * 采购金额；无价格查看权限时为空
     */
    amount?: number | null;
    /**
     * 当前明细可用业务动作；receive 表示可发起收货
     */
    availableActions: Array<string>;
    /**
     * 基础库存单位快照
     */
    baseUnit?: string | null;
    /**
     * 采购单位到基础单位换算系数
     */
    conversionFactorToBase?: number | null;
    customComputedErrors?: Record<string, any> | null;
    customComputedValues?: Record<string, any> | null;
    customFieldSchemaVersion?: number | null;
    customValues?: Record<string, any> | null;
    /**
     * 明细交货日期
     */
    deliveryDate?: string | null;
    /**
     * 折扣金额；无价格查看权限时为空
     */
    discountAmount?: number | null;
    /**
     * 折后未税金额；无价格查看权限时为空
     */
    discountedAmount?: number | null;
    /**
     * 有效交货日期（明细交货日期优先，回退整单预计到货）
     */
    effectiveDeliveryDate?: string | null;
    /**
     * 整单预计到货日期
     */
    expectedDate?: string | null;
    /**
     * 采购订单明细ID
     */
    id: string;
    /**
     * 关联采购入库行的来料检验摘要；无到货或该到货无需IQC时为空，不改变采购订单履约状态
     */
    incomingInspection?: PurchaseOrderIncomingInspectionDto | null;
    /**
     * 物料档案
     */
    material?: Material | null;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 采购订单创建时间
     */
    orderCreatedAt: string;
    /**
     * 采购订单号
     */
    orderNo: string;
    /**
     * 采购订单更新时间
     */
    orderUpdatedAt: string;
    /**
     * 订购基础数量
     */
    orderedQty: number;
    /**
     * 待收基础数量（订购-已收，最小为0）
     */
    outstandingQty: number;
    /**
     * 采购超收比例快照（%）
     */
    overReceiptPercent: number;
    /**
     * 单价是否含税；无价格查看权限时为空
     */
    priceIncludesTax?: boolean | null;
    /**
     * 采购订单ID
     */
    purchaseOrderId: string;
    /**
     * 待收采购单位数量（按基础未收量折算）
     */
    purchaseOutstandingQty?: number | null;
    /**
     * 采购单位数量
     */
    purchaseQty?: number | null;
    /**
     * 采购单位
     */
    purchaseUnit?: string | null;
    /**
     * 采购员
     */
    purchasingRep?: User | null;
    /**
     * 采购员ID
     */
    purchasingRepId?: string | null;
    /**
     * 建议收货基础数量（合同待收扣除草稿/审批中占用，不含超收）
     */
    receivableQty: number;
    /**
     * 已收基础数量
     */
    receivedQty: number;
    /**
     * 最大允许再收基础数量（含超收上限并扣除已收及待处理占用）
     */
    remainingReceiptCapacityQty: number;
    /**
     * 采购订单行备注
     */
    remarks?: string | null;
    /**
     * 来源采购申请ID
     */
    requisitionId?: string | null;
    /**
     * 来源采购申请明细ID
     */
    requisitionItemId?: string | null;
    /**
     * 草稿或审批中采购入库已占用的基础数量
     */
    reservedReceiptQty: number;
    /**
     * 采购订单状态
     */
    status: PurchaseOrderStatus;
    /**
     * 供应商ID
     */
    supplierId?: string | null;
    /**
     * 供应商名称（快照优先）
     */
    supplierName?: string | null;
    /**
     * 税额；无价格查看权限时为空
     */
    taxAmount?: number | null;
    /**
     * 税率；无价格查看权限时为空
     */
    taxRate?: number | null;
    /**
     * 总金额（价税合计）；无价格查看权限时为空
     */
    totalAmount?: number | null;
    /**
     * 采购单价；无价格查看权限时为空
     */
    unitPrice?: number | null;
};

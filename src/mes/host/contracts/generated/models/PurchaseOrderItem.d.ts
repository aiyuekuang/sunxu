import type { Material } from './Material.d.ts';
import type { PurchaseInquiryAwardItem } from './PurchaseInquiryAwardItem.d.ts';
import type { PurchaseInquiryItem } from './PurchaseInquiryItem.d.ts';
import type { PurchaseOrderItemPriceSource } from './PurchaseOrderItemPriceSource.d.ts';
import type { PurchaseRequisitionItem } from './PurchaseRequisitionItem.d.ts';
import type { SupplierQuotationItem } from './SupplierQuotationItem.d.ts';
export type PurchaseOrderItem = {
    amount: number;
    /**
     * 基础库存单位快照
     */
    baseUnit?: string | null;
    /**
     * 采购单位到基础单位换算系数
     */
    conversionFactorToBase?: number | null;
    createdAt: string;
    /**
     * 明细交货日期（分批采购时各明细交货日期可不同；为空回退整单预计到货日期）
     */
    deliveryDate?: string | null;
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
     * 采购品质等级（material_grade 字典值）
     */
    grade?: string | null;
    id: string;
    material?: Material;
    materialId: string;
    order?: Record<string, any>;
    orderId: string;
    orderedQty: number;
    /**
     * 采购超收比例快照（%）；来源于建单时物料档案，用于收货上限校验
     */
    overReceiptPercent: number;
    /**
     * 价格例外审批ID
     */
    priceExceptionApprovalId?: string | null;
    /**
     * 单价是否含税
     */
    priceIncludesTax?: boolean | null;
    /**
     * 采购价格快照
     */
    priceSnapshot?: Record<string, any> | null;
    /**
     * 价格来源
     */
    priceSource?: PurchaseOrderItemPriceSource | null;
    /**
     * 采购单位数量
     */
    purchaseQty?: number | null;
    /**
     * 采购单位
     */
    purchaseUnit?: string | null;
    receivedQty: number;
    remarks?: string | null;
    requisitionItem?: PurchaseRequisitionItem | null;
    requisitionItemId?: string | null;
    sortOrder: number;
    sourceInquiryAwardItem?: PurchaseInquiryAwardItem | null;
    /**
     * 来源定标明细ID
     */
    sourceInquiryAwardItemId?: string | null;
    sourceInquiryItem?: PurchaseInquiryItem | null;
    /**
     * 来源询价明细ID
     */
    sourceInquiryItemId?: string | null;
    sourceQuotationItem?: SupplierQuotationItem | null;
    /**
     * 来源供应商报价明细ID
     */
    sourceQuotationItemId?: string | null;
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
};

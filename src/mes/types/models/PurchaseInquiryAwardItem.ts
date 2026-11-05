/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Material } from './Material';
import type { PurchaseInquiryItem } from './PurchaseInquiryItem';
import type { Supplier } from './Supplier';
import type { SupplierQuotationItem } from './SupplierQuotationItem';
export type PurchaseInquiryAwardItem = {
    /**
     * 中标金额
     */
    amount: number;
    /**
     * 定标记录
     */
    award?: Record<string, any>;
    /**
     * 定标单ID
     */
    awardId: string;
    /**
     * 中标价格快照
     */
    awardPriceSnapshot?: Record<string, any> | null;
    /**
     * 中标数量
     */
    awardQty: number;
    /**
     * 是否已转采购订单
     */
    convertedToOrder?: boolean;
    createdAt: string;
    /**
     * 币别
     */
    currency?: string | null;
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
     * 中标等级（material_grade 字典值）
     */
    grade?: Record<string, any> | null;
    id: string;
    inquiryItem?: PurchaseInquiryItem;
    /**
     * 询价明细ID
     */
    inquiryItemId: string;
    material?: Material | null;
    /**
     * 物料档案ID；临时询价品定标可为空，转采购订单前必须绑定正式物料档案
     */
    materialId?: string | null;
    /**
     * 中标价是否含税
     */
    priceIncludesTax?: boolean | null;
    /**
     * 承诺交期
     */
    promisedDate?: string | null;
    /**
     * 生成的采购订单
     */
    purchaseOrder?: Record<string, any> | null;
    /**
     * 生成的采购订单ID
     */
    purchaseOrderId?: string | null;
    /**
     * 生成的采购订单明细
     */
    purchaseOrderItem?: Record<string, any> | null;
    /**
     * 生成的采购订单明细ID
     */
    purchaseOrderItemId?: string | null;
    quotationItem?: SupplierQuotationItem;
    /**
     * 供应商报价明细ID
     */
    quotationItemId: string;
    /**
     * 备注
     */
    remarks?: string | null;
    supplier?: Supplier;
    /**
     * 中标供应商ID
     */
    supplierId: string;
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
    /**
     * 中标单价
     */
    unitPrice: number;
    updatedAt: string;
};

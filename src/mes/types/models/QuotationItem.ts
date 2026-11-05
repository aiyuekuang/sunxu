/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomHeader } from './BomHeader';
import type { Material } from './Material';
export type QuotationItem = {
    amount: number;
    /**
     * 报价时 BOM 成本快照
     */
    bomCostSnapshot?: Record<string, any> | null;
    /**
     * BOM 选择原因
     */
    bomSelectionReason?: string | null;
    /**
     * BOM 选择来源
     */
    bomSelectionSource?: string | null;
    createdAt: string;
    /**
     * 客户料号快照
     */
    customerMaterialCode?: string | null;
    /**
     * 客户物料名称快照
     */
    customerMaterialName?: string | null;
    /**
     * 客户规格/型号快照
     */
    customerMaterialSpec?: string | null;
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
    id: string;
    /**
     * 报价阶段产品参考图片URL列表
     */
    imageUrls?: Array<string>;
    material?: Material | null;
    /**
     * 物料档案ID；临时报价品可为空
     */
    materialId?: string | null;
    /**
     * 价格例外审批ID
     */
    priceExceptionApprovalId?: string | null;
    /**
     * 单价是否含税
     */
    priceIncludesTax?: boolean | null;
    /**
     * 价格来源快照
     */
    priceSnapshot?: Record<string, any> | null;
    quantity: number;
    quotation?: Record<string, any>;
    quotationId: string;
    remarks?: string | null;
    selectedBomHeader?: BomHeader | null;
    /**
     * 报价确认使用的 BOM 版本ID
     */
    selectedBomHeaderId?: string | null;
    sortOrder: number;
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

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Material } from './Material';
import type { PurchaseInquiryItem } from './PurchaseInquiryItem';
export type SupplierQuotationItem = {
    /**
     * 金额
     */
    amount: number;
    createdAt: string;
    /**
     * 交货周期天数
     */
    deliveryDays?: number | null;
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
     * 报价等级（material_grade 字典值）
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
     * 物料档案ID；临时询价品报价可为空
     */
    materialId?: string | null;
    /**
     * 最大订购量
     */
    maxOrderQty?: number | null;
    /**
     * 最小起订量
     */
    minOrderQty?: number | null;
    /**
     * 报价价格快照
     */
    priceSnapshot?: Record<string, any> | null;
    /**
     * 承诺交期
     */
    promisedDate?: string | null;
    /**
     * 供应商报价
     */
    quotation?: Record<string, any>;
    /**
     * 供应商报价ID
     */
    quotationId: string;
    /**
     * 报价数量
     */
    quoteQty: number;
    /**
     * 备注
     */
    remarks?: string | null;
    /**
     * 供应商物料编号
     */
    supplierMaterialCode?: string | null;
    /**
     * 供应商物料名称
     */
    supplierMaterialName?: string | null;
    /**
     * 供应商型号编码/牌号
     */
    supplierModelCode?: string | null;
    /**
     * 供应商规格描述
     */
    supplierSpec?: string | null;
    /**
     * 税额
     */
    taxAmount?: number | null;
    /**
     * 是否含税价
     */
    taxIncluded?: boolean;
    /**
     * 行税率
     */
    taxRate?: number | null;
    /**
     * 总金额（价税合计）
     */
    totalAmount?: number | null;
    /**
     * 供应商单价
     */
    unitPrice: number;
    updatedAt: string;
};

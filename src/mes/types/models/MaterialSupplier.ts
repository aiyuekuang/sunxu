/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Material } from './Material';
import type { Supplier } from './Supplier';
export type MaterialSupplier = {
    companyId: string;
    createdAt: string;
    id: string;
    /**
     * 是否为默认供应商
     */
    isDefault: boolean;
    /**
     * 该供应商的交货提前期（天）
     */
    leadTimeDays?: number | null;
    material: Material;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 该供应商的最小起订量
     */
    minOrderQty?: number | null;
    /**
     * 备注
     */
    remarks?: string | null;
    /**
     * 来源定标明细ID
     */
    sourceInquiryAwardItemId?: string | null;
    /**
     * 来源采购询价ID
     */
    sourceInquiryId?: string | null;
    /**
     * 来源供应商报价明细ID
     */
    sourceQuotationItemId?: string | null;
    /**
     * 价格来源回写时间
     */
    sourceSyncedAt?: string | null;
    /**
     * 价格来源回写人ID
     */
    sourceSyncedById?: string | null;
    supplier: Supplier;
    /**
     * 供应商ID
     */
    supplierId: string;
    /**
     * 供应商物料编号
     */
    supplierMaterialCode?: string | null;
    /**
     * 供应商物料名称
     */
    supplierMaterialName?: string | null;
    updatedAt: string;
    /**
     * 价格生效日期
     */
    validFrom?: string;
};

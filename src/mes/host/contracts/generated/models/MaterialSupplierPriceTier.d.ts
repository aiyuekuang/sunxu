import type { Material } from './Material.d.ts';
import type { MaterialSupplier } from './MaterialSupplier.d.ts';
import type { Supplier } from './Supplier.d.ts';
export type MaterialSupplierPriceTier = {
    companyId: string;
    createdAt: string;
    /**
     * 币别
     */
    currency: string;
    /**
     * 供应品质等级（material_grade 字典值，可空）
     */
    grade?: string | null;
    id: string;
    /**
     * 是否默认价目；同条件多价格时用于自动带出
     */
    isDefault: boolean;
    /**
     * 交期天数（空则继承供应商关系）
     */
    leadTimeDays?: number | null;
    material?: Material;
    /**
     * 物料档案ID（冗余，必须与关系表一致）
     */
    materialId: string;
    materialSupplier?: MaterialSupplier;
    /**
     * 物料供应商关系ID
     */
    materialSupplierId: string;
    /**
     * 最大订购量；为空表示无上限
     */
    maxOrderQty?: number | null;
    /**
     * 起订量（空则继承供应商关系）
     */
    minOrderQty?: number | null;
    /**
     * 计价单位→基本单位的换算因子（1 计价单位 = priceFactorToBase 个基本单位）。每基本单位价 = unitPrice / priceFactorToBase。默认 1（按基本单位计价）。
     */
    priceFactorToBase: number;
    /**
     * 录入价是否为含税价
     */
    priceIncludesTax: boolean;
    /**
     * 计价单位（unitPrice 按此单位计；为空表示按物料基本单位计价）。例如基本单位 g、按 kg 报价时填 kg。
     */
    priceUnit?: string | null;
    /**
     * 推荐优先级（小值优先）
     */
    priority?: number | null;
    /**
     * 配额比例（%）
     */
    quotaPercent?: number | null;
    /**
     * 备注
     */
    remarks?: string | null;
    /**
     * 来源定标明细ID
     */
    sourceInquiryAwardItemId?: string | null;
    /**
     * 原始录入价格快照（含税口径换算依据等）
     */
    sourcePriceSnapshot?: Record<string, any> | null;
    /**
     * 状态
     */
    status: MaterialSupplierPriceTier.status;
    supplier?: Supplier;
    /**
     * 供应商ID（冗余，必须与关系表一致）
     */
    supplierId: string;
    /**
     * 供应商物料编号
     */
    supplierMaterialCode?: string | null;
    /**
     * 供应商型号编码/牌号
     */
    supplierModelCode?: string | null;
    /**
     * 供应商规格描述
     */
    supplierSpec?: string | null;
    /**
     * 税率（%）
     */
    taxRate?: number | null;
    /**
     * 采购单价（未税口径）
     */
    unitPrice: number;
    updatedAt: string;
    /**
     * 生效日期
     */
    validFrom: string;
    /**
     * 失效日期（可空）
     */
    validTo?: string | null;
};
export declare namespace MaterialSupplierPriceTier {
    /**
     * 状态
     */
    enum status {
        ACTIVE = "active",
        INACTIVE = "inactive"
    }
}

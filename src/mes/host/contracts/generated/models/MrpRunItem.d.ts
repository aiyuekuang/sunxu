import type { InventoryOwnerType } from './InventoryOwnerType.d.ts';
import type { Material } from './Material.d.ts';
import type { MrpRun } from './MrpRun.d.ts';
import type { MrpRunItemReleaseStatus } from './MrpRunItemReleaseStatus.d.ts';
import type { ProductionQtyRoundingMode } from './ProductionQtyRoundingMode.d.ts';
import type { PurchaseRequisition } from './PurchaseRequisition.d.ts';
export type MrpRunItem = {
    companyId: string;
    createdAt: string;
    currentStock: number;
    grossRequirement: number;
    id: string;
    ignoreReason?: string | null;
    ignoredAt?: string | null;
    inProductionQty: number;
    /**
     * 本计划工单已领料(净)=Σ(issuedQty−returnedQty)，参与净需求扣减
     */
    issuedQty: number;
    latestOrderDate?: string | null;
    leadTimeDays?: number | null;
    leadTimeWarning: boolean;
    material?: Material;
    materialCode: string;
    materialId: string;
    materialName: string;
    netRequirement: number;
    onOrderQty: number;
    ownerRefId?: string | null;
    /**
     * 本次需求对应的库存归属方；历史结果为空时按公司自有库存兼容
     */
    ownerType?: InventoryOwnerType | null;
    pendingPrQty: number;
    /**
     * 本次 MRP 计算采用的投产数量取整方式
     */
    productionQtyRoundingMode: ProductionQtyRoundingMode;
    releaseStatus: MrpRunItemReleaseStatus;
    releasedAt?: string | null;
    releasedPr?: PurchaseRequisition | null;
    releasedPrId?: string | null;
    releasedQty: number;
    run?: MrpRun;
    runId: string;
    safetyStock: number;
    sources: Array<string>;
    suggestedAction: string;
    /**
     * 建议采购单位到基础单位换算系数
     */
    suggestedPurchaseFactorToBase?: number | null;
    /**
     * 按默认采购单位展示的建议数量
     */
    suggestedPurchaseQty?: number | null;
    /**
     * 建议采购单位
     */
    suggestedPurchaseUnit?: string | null;
    suggestedQty: number;
    supplyAllocations?: Array<string>;
    /**
     * 本次 MRP 计算采用的自制物料供应倍量；空或1表示不限制
     */
    supplyMultipleQty?: number | null;
    unit: string;
    updatedAt: string;
};

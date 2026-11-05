import type { InventoryOwnerType } from './InventoryOwnerType.d.ts';
import type { MrpItemSourceDto } from './MrpItemSourceDto.d.ts';
import type { MrpSupplyAllocationDto } from './MrpSupplyAllocationDto.d.ts';
import type { ProductionQtyRoundingMode } from './ProductionQtyRoundingMode.d.ts';
export type MrpItemDto = {
    /**
     * 当前可用库存（已扣除预留和冻结）
     */
    currentStock: number;
    /**
     * 毛需求量
     */
    grossRequirement: number;
    /**
     * 在产工单量（未完成WO剩余量，排除本次MRP关联计划的工单）
     */
    inProductionQty: number;
    /**
     * 本次纳入计划关联工单已领料净额
     */
    issuedQty: number;
    /**
     * 最晚下单日（最早开工日-提前期）
     */
    latestOrderDate: string | null;
    /**
     * 供应商交期或生产周期(天)
     */
    leadTimeDays: number | null;
    /**
     * 提前期预警（最晚下单日已过或今天）
     */
    leadTimeWarning: boolean;
    /**
     * 物料档案编码
     */
    materialCode: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 物料档案名称
     */
    materialName: string;
    /**
     * 规格型号
     */
    materialSpec?: string | null;
    /**
     * 净需求量 = 毛需求 - 库存 - 在途采购 - 待审批PR - 在产 + 安全库存
     */
    netRequirement: number;
    /**
     * 采购供给量（未收货采购订单剩余量）
     */
    onOrderQty: number;
    /**
     * 本次需求对应的库存归属方ID
     */
    ownerRefId?: string | null;
    /**
     * 本次需求对应的库存归属方类型
     */
    ownerType?: InventoryOwnerType | null;
    /**
     * 待审批采购申请量（PR已提交/已批准但未转PO）
     */
    pendingPrQty: number;
    /**
     * 本次 MRP 计算采用的投产数量取整方式
     */
    productionQtyRoundingMode: ProductionQtyRoundingMode;
    /**
     * MRP运行明细ID
     */
    runItemId?: string;
    /**
     * 安全库存
     */
    safetyStock: number;
    /**
     * 需求来源（Pegging）：该物料需求来自哪些计划
     */
    sources: Array<MrpItemSourceDto>;
    /**
     * 建议操作
     */
    suggestedAction: MrpItemDto.suggestedAction;
    /**
     * 建议采购单位到基础单位换算系数
     */
    suggestedPurchaseFactorToBase: number | null;
    /**
     * 按默认采购单位展示的建议采购数量
     */
    suggestedPurchaseQty: number | null;
    /**
     * 建议采购单位
     */
    suggestedPurchaseUnit: string | null;
    /**
     * 建议采购/生产数量（采购按最小采购量；生产在净需求后应用物料投产取整规则与供应倍量）
     */
    suggestedQty: number;
    /**
     * 库存、执行中工单及在途供给的计划级配给关系
     */
    supplyAllocations: Array<MrpSupplyAllocationDto>;
    /**
     * 自制供应倍量；空或1表示不限制
     */
    supplyMultipleQty?: number | null;
    /**
     * 单位
     */
    unit: string;
};
export declare namespace MrpItemDto {
    /**
     * 建议操作
     */
    enum suggestedAction {
        PURCHASE = "purchase",
        PRODUCE = "produce",
        CUSTOMER_SUPPLY = "customer_supply",
        SUFFICIENT = "sufficient"
    }
}

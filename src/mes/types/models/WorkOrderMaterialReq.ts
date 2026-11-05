/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomItem } from './BomItem';
import type { BomItemPartType } from './BomItemPartType';
import type { BomItemSubstitute } from './BomItemSubstitute';
import type { BomLineAdjustmentMode } from './BomLineAdjustmentMode';
import type { BomQuantityMode } from './BomQuantityMode';
import type { DocumentBomLine } from './DocumentBomLine';
import type { InventoryOwnerType } from './InventoryOwnerType';
import type { IssueMode } from './IssueMode';
import type { Material } from './Material';
import type { MaterialConsumptionMode } from './MaterialConsumptionMode';
import type { MaterialIssueOrder } from './MaterialIssueOrder';
import type { MaterialReqStatus } from './MaterialReqStatus';
import type { Warehouse } from './Warehouse';
import type { WorkOrder } from './WorkOrder';
export type WorkOrderMaterialReq = {
    /**
     * 当前需求行可执行的 BOM 行批准替代料；仅物料需求列表等执行入口返回
     */
    approvedSubstitutes?: Array<BomItemSubstitute>;
    /**
     * 基础库存单位快照
     */
    baseUnit?: string | null;
    /**
     * 参与计算的基准指标数值，如面积、长度、体积
     */
    basisQty?: number | null;
    /**
     * 参与计算的基准指标单位，如 m2/m/m3/kg
     */
    basisUnit?: string | null;
    bomItem?: BomItem | null;
    bomItemId?: string | null;
    /**
     * BOM 用量计算快照
     */
    calculationSnapshot: Record<string, any>;
    companyId: string;
    /**
     * 显示单位到基础单位换算系数
     */
    conversionFactorToBase?: number | null;
    /**
     * 单位换算快照
     */
    conversionSnapshot: Record<string, any>;
    createdAt: string;
    /**
     * BOM/生产单位显示需求数量
     */
    demandQty?: number | null;
    /**
     * BOM/生产显示单位
     */
    demandUnit?: string | null;
    documentBomLine?: DocumentBomLine | null;
    /**
     * 来源工单单据 BOM 行 ID
     */
    documentBomLineId?: string | null;
    id: string;
    /**
     * 供料策略
     */
    issueMode: IssueMode;
    /**
     * 关联领料单摘要；仅工单详情等聚合查询返回
     */
    issueOrders?: Array<MaterialIssueOrder>;
    issuedQty: number;
    /**
     * 来源 BOM 行可调整能力模式快照
     */
    lineAdjustmentMode: BomLineAdjustmentMode;
    /**
     * 由 lineAdjustmentMode 推导的行级可调整能力；仅物料需求列表等执行入口返回
     */
    lineCapabilities?: Record<string, any>;
    /**
     * 线边仓
     */
    lineSideWarehouse?: Warehouse | null;
    /**
     * 线边仓ID
     */
    lineSideWarehouseId?: string | null;
    /**
     * 人工覆盖时间
     */
    manualOverrideAt?: string | null;
    /**
     * 人工覆盖人ID
     */
    manualOverrideBy?: string | null;
    /**
     * 人工覆盖原因
     */
    manualOverrideReason?: string | null;
    material?: Material;
    /**
     * 工单物料需求冻结的消耗方式：manual_issue=仓库确认发料，backflush_on_report=报工自动倒冲
     */
    materialConsumptionMode: MaterialConsumptionMode;
    materialId: string;
    /**
     * 来源BOM用料角色快照
     */
    materialType: string;
    /**
     * 投料工序序号（来自 BOM 行）
     */
    operationSequence?: number | null;
    /**
     * 需求行领料库存货主 ID；公司库存为 companyId，客户供料为 customerId
     */
    ownerRefId: string;
    /**
     * 需求行领料库存货主类型；默认 company，客户供料为 customer
     */
    ownerType: InventoryOwnerType;
    /**
     * BOM 行零件类型，用于区分自制、标准件、采购件、委外件和客户供料
     */
    partType: BomItemPartType;
    /**
     * 来源 BOM 行用量模式快照
     */
    quantityMode: BomQuantityMode;
    /**
     * 指定批次ID（最高优先级要求）
     */
    requiredBatchId?: string | null;
    /**
     * 要求等级（material_grade 字典值）
     */
    requiredGrade?: string | null;
    /**
     * 来源价目行ID
     */
    requiredPriceTierId?: string | null;
    requiredQty: number;
    /**
     * 要求供应商ID
     */
    requiredSupplierId?: string | null;
    /**
     * 选中原因（人读摘要）
     */
    resolutionReason?: string | null;
    /**
     * 解算过程快照：候选清单、淘汰原因、策略参数
     */
    resolutionSnapshot?: Record<string, any> | null;
    /**
     * 解算策略：manual / auto_preferred / cost_first / inventory_first
     */
    resolutionStrategy?: string | null;
    /**
     * 解算价币别
     */
    resolvedCurrency?: string | null;
    /**
     * 解算时单价快照（未税）；差异分析基准，不随价目表漂移
     */
    resolvedUnitPrice?: number | null;
    returnedQty: number;
    status: MaterialReqStatus;
    updatedAt: string;
    /**
     * 来源仓
     */
    warehouse?: Warehouse | null;
    warehouseId?: string | null;
    workOrder?: WorkOrder;
    workOrderId: string;
    workOrderOperation?: Record<string, any> | null;
    /**
     * 工单工序ID；优先于 operationSequence
     */
    workOrderOperationId?: string | null;
};

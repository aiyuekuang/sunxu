import type { Equipment } from './Equipment.d.ts';
import type { EquipmentSession } from './EquipmentSession.d.ts';
import type { OperationPayMode } from './OperationPayMode.d.ts';
import type { PieceworkQtyBasis } from './PieceworkQtyBasis.d.ts';
import type { ProductionPlanDemandLine } from './ProductionPlanDemandLine.d.ts';
import type { ProductionScrapOrderStatus } from './ProductionScrapOrderStatus.d.ts';
import type { ReportLogType } from './ReportLogType.d.ts';
import type { ReportQuantityRole } from './ReportQuantityRole.d.ts';
import type { ReportTimeSource } from './ReportTimeSource.d.ts';
import type { ScheduleEntry } from './ScheduleEntry.d.ts';
import type { TimeRateUnit } from './TimeRateUnit.d.ts';
import type { User } from './User.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
import type { WorkOrderOperation } from './WorkOrderOperation.d.ts';
export type WorkOrderReportLog = {
    /**
     * 本次报工显式记录的实际准备/换型工时；不从总工时反推
     */
    actualSetupMinutes?: number | null;
    auxiliaryPriceRatioSnapshot?: number | null;
    batchNo?: string | null;
    companyId: string;
    completedQty: number;
    /**
     * 本次折算后的产品良品数量
     */
    convertedCompletedQty: number;
    /**
     * 本次折算后的产品报废数量
     */
    convertedScrappedQty: number;
    createdAt: string;
    demandLine?: ProductionPlanDemandLine | null;
    /**
     * 本次产出归属的计划来源需求行；未归属的历史报工按工单分配比例回退
     */
    demandLineId?: string | null;
    /**
     * 本次报工有效工时（分钟）
     * 来源：手填分钟、开始/结束时间或上下机会话。
     * 冲正记录继承原记录工时，用于计时工资反向扣减
     */
    durationMinutes?: number | null;
    /**
     * 本次工时结束时间
     */
    endedAt?: string | null;
    equipment?: Equipment | null;
    equipmentId?: string | null;
    equipmentSession?: EquipmentSession | null;
    /**
     * 关联上下机会话ID
     */
    equipmentSessionId?: string | null;
    /**
     * 本次加工计数执行量，不计入良品/报废/入库
     */
    executionQty: number;
    /**
     * 执行量/仅工时原因
     */
    executionReason?: string | null;
    /**
     * 本次加工计数单位快照
     */
    executionUnit?: string | null;
    id: string;
    isAuxiliary: boolean;
    /**
     * 业务上真实发生的报工时间
     */
    occurredAt?: string | null;
    operation?: WorkOrderOperation | null;
    operationId?: string | null;
    /**
     * 快照：报工时记录的工序名称。
     * 虽然已有 operationId FK 可 JOIN 获取，但保留此快照是因为：
     * 1. 工序可能被删除（onDelete: CASCADE 会让 FK 变 null）
     * 2. 工序名可能被修改，但报工记录应反映报工时刻的名称
     * 命名未使用 Snapshot 后缀，因为改名影响面过大（83 个文件引用 operationName）。
     */
    operationName?: string | null;
    /**
     * 报工时工序报工量是否折算产品数量快照
     */
    operationReportAffectsOutputSnapshot: boolean;
    /**
     * 报工时换算基准中的产品数量快照
     */
    operationReportBaseProductQtySnapshot?: number | null;
    /**
     * 报工时换算基准中的工序报工数量快照
     */
    operationReportTargetQtySnapshot?: number | null;
    /**
     * 本次报工计薪方式快照
     */
    payModeSnapshot: OperationPayMode;
    /**
     * 本次报工现场照片
     */
    photoUrls?: Array<string>;
    pieceRateSnapshot?: number | null;
    /**
     * 本次报工计件数量基准快照
     */
    pieceworkQtyBasisSnapshot: PieceworkQtyBasis;
    /**
     * 关联生产报废单ID（非持久化字段）
     */
    productionScrapId?: string | null;
    /**
     * 关联生产报废单号（非持久化字段）
     */
    productionScrapNo?: string | null;
    /**
     * 关联生产报废单：待处置数量（处置汇总派生，非持久化字段）
     */
    productionScrapPendingQty?: number | null;
    /**
     * 关联生产报废单：让步接收转可用入库数量（处置汇总派生，单独注明，已 IN_PRODUCTION 入成品库；非持久化字段）
     */
    productionScrapResolvedConcessionQty?: number | null;
    /**
     * 关联生产报废单：让步接收/返工转可用数量（处置汇总派生，非持久化字段）
     */
    productionScrapResolvedNonScrapQty?: number | null;
    /**
     * 关联生产报废单：最终保留报废数量（处置汇总派生，非持久化字段）
     */
    productionScrapResolvedScrapQty?: number | null;
    /**
     * 关联生产报废单状态（非持久化字段）
     */
    productionScrapStatus?: ProductionScrapOrderStatus | null;
    /**
     * 本流水的数量角色：产出 / 加工计数 / 仅工时
     */
    quantityRole: ReportQuantityRole;
    remark?: string | null;
    reportedBy: string;
    /**
     * 本次现场填写的工序报工量
     */
    reportedOperationQty: number;
    /**
     * 本次工序报工单位快照
     */
    reportedOperationUnit?: string | null;
    reporter?: User;
    scheduleEntry?: ScheduleEntry | null;
    scheduleEntryId?: string | null;
    /**
     * 本次报废照片
     */
    scrapPhotoUrls?: Array<string>;
    /**
     * 本次报废命中的策略ID
     */
    scrapPolicyId?: string | null;
    /**
     * 本次报工填写的报废原因
     */
    scrapReason?: string | null;
    scrappedQty: number;
    sourceReportLog?: WorkOrderReportLog | null;
    sourceReportLogId?: string | null;
    /**
     * 本次工时开始时间
     */
    startedAt?: string | null;
    /**
     * 本次报工计时单价快照
     */
    timeRateSnapshot?: number | null;
    /**
     * 本次报工计时单价单位快照
     */
    timeRateUnitSnapshot?: TimeRateUnit | null;
    /**
     * 工时来源
     */
    timeSource?: ReportTimeSource | null;
    type: ReportLogType;
    updatedAt: string;
    workCenterId?: string | null;
    workOrder?: WorkOrder;
    workOrderId: string;
    /**
     * 零数量报工原因
     */
    zeroQuantityReason?: string | null;
};

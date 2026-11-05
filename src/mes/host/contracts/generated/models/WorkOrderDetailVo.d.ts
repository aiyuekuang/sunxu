import type { BomHeader } from './BomHeader.d.ts';
import type { ChildOrderSummaryDto } from './ChildOrderSummaryDto.d.ts';
import type { Customer } from './Customer.d.ts';
import type { Department } from './Department.d.ts';
import type { FreeReportConfig } from './FreeReportConfig.d.ts';
import type { ItemSource } from './ItemSource.d.ts';
import type { Material } from './Material.d.ts';
import type { OperationScheduleSlotDto } from './OperationScheduleSlotDto.d.ts';
import type { ProcessRoute } from './ProcessRoute.d.ts';
import type { ProcessRouteMaster } from './ProcessRouteMaster.d.ts';
import type { ProcessRouteVersion } from './ProcessRouteVersion.d.ts';
import type { ProductionPlan } from './ProductionPlan.d.ts';
import type { ReportLogItemDto } from './ReportLogItemDto.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
import type { WorkOrderActionPrecheckMapDto } from './WorkOrderActionPrecheckMapDto.d.ts';
import type { WorkOrderBomComponentOutsourcingOrderDto } from './WorkOrderBomComponentOutsourcingOrderDto.d.ts';
import type { WorkOrderDemandAllocationTraceDto } from './WorkOrderDemandAllocationTraceDto.d.ts';
import type { WorkOrderExecutionState } from './WorkOrderExecutionState.d.ts';
import type { WorkOrderMaterialReq } from './WorkOrderMaterialReq.d.ts';
import type { WorkOrderOperationDetailDto } from './WorkOrderOperationDetailDto.d.ts';
import type { WorkOrderOutputReconciliationVo } from './WorkOrderOutputReconciliationVo.d.ts';
import type { WorkOrderPlanReleaseLineTraceDto } from './WorkOrderPlanReleaseLineTraceDto.d.ts';
import type { WorkOrderProgressSummaryDto } from './WorkOrderProgressSummaryDto.d.ts';
import type { WorkOrderRiskSummaryDto } from './WorkOrderRiskSummaryDto.d.ts';
import type { WorkOrderRouteSelectionMode } from './WorkOrderRouteSelectionMode.d.ts';
import type { WorkOrderScheduleBufferSource } from './WorkOrderScheduleBufferSource.d.ts';
import type { WorkOrderStatus } from './WorkOrderStatus.d.ts';
export type WorkOrderDetailVo = {
    /**
     * 当前详情页动作预检摘要
     */
    actions: WorkOrderActionPrecheckMapDto;
    actualEndTime?: string | null;
    actualStartTime?: string | null;
    assignee?: User | null;
    assigneeId?: string | null;
    /**
     * 当前状态允许的业务操作
     */
    availableActions?: Array<string>;
    /**
     * BOM 委外组件自动派生的委外加工单
     */
    bomComponentOutsourcingOrders: Array<WorkOrderBomComponentOutsourcingOrderDto>;
    /**
     * 来源订单/报价 BOM 成本快照
     */
    bomCostSnapshot?: Record<string, any> | null;
    bomHeader?: BomHeader | null;
    bomHeaderId?: string | null;
    /**
     * 多工序按瓶颈工序计算的可交付良品数量
     */
    bottleneckCompletedQty: number;
    /**
     * 取消原因
     */
    cancelReason?: string | null;
    /**
     * 取消时间
     */
    cancelledAt?: string | null;
    /**
     * 取消人ID
     */
    cancelledBy?: string | null;
    /**
     * 取消人
     */
    canceller?: User | null;
    /**
     * 子工单摘要列表
     */
    childOrders: Array<ChildOrderSummaryDto>;
    closedAt?: string | null;
    closedBy?: string | null;
    closer?: User | null;
    companyId: string;
    /**
     * 完工说明（强制完工/欠产完工原因，系统自动完工时为系统说明）
     */
    completeReason?: string | null;
    completedQty: number;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 非标参数执行快照，如尺寸、工艺要求、客户要求等
     */
    customSnapshot?: Record<string, any>;
    customer?: Customer | null;
    customerId?: string | null;
    /**
     * 工单覆盖的来源需求分配追溯
     */
    demandAllocations: Array<WorkOrderDemandAllocationTraceDto>;
    description?: string | null;
    /**
     * 工单执行图纸附件URL快照
     */
    drawingUrls?: Array<string>;
    dueDate?: string | null;
    /**
     * 执行就绪状态：未排产 / 待确认排产 / 待开工
     */
    executionState?: WorkOrderExecutionState;
    externalId?: string | null;
    externalSource?: string | null;
    /**
     * 开放工单池关闭时间
     */
    freeReportClosedAt?: string | null;
    /**
     * 开放工单池关闭人
     */
    freeReportClosedBy?: string | null;
    freeReportConfig?: FreeReportConfig | null;
    /**
     * 自由报工配置ID
     */
    freeReportConfigId?: string | null;
    /**
     * 自由报工业务日期
     */
    freeReportDate?: string | null;
    /**
     * 自由报工班次编码
     */
    freeReportShiftCode?: string | null;
    freeReportTeam?: Department | null;
    /**
     * 自由报工班组/部门ID
     */
    freeReportTeamId?: string | null;
    id: string;
    /**
     * 是否为受控自由报工开放工单容器
     */
    isFreeReportContainer: boolean;
    /**
     * 交期已逾期或按当前计划预计无法按期完成
     */
    isOverdue: boolean;
    /**
     * 工单生产对象来源：物料档案或本单临时制造项
     */
    itemSource: ItemSource;
    material?: Material | null;
    /**
     * 产出物料档案ID；临时子工单为空
     */
    materialId?: string | null;
    materialReqStatus: string;
    /**
     * 物料需求/领料记录
     */
    materialRequisitions: Array<WorkOrderMaterialReq>;
    /**
     * 工序列表
     */
    operations: Array<WorkOrderOperationDetailDto>;
    orderNo: string;
    /**
     * 完工入库对账：良品/让步接收/净报废/待处置的工单级闭环口径（派生只读）
     */
    outputReconciliation: WorkOrderOutputReconciliationVo;
    /**
     * 总体进度百分比
     */
    overallProgress: number;
    parentWorkOrder?: WorkOrder | null;
    parentWorkOrderId?: string | null;
    pauseReason?: string | null;
    plan?: ProductionPlan | null;
    /**
     * 计划完工时刻是否已超时
     */
    planEndOverdue: boolean;
    planEndTime?: string | null;
    planId?: string | null;
    /**
     * 来源计划批次/下达批次追溯
     */
    planReleaseLine?: WorkOrderPlanReleaseLineTraceDto | null;
    planStartTime?: string | null;
    plannedQty: number;
    priority: number;
    /**
     * 工单执行进度摘要
     */
    progressSummary: WorkOrderProgressSummaryDto;
    /**
     * 完工入库仓库
     */
    receiptWarehouse?: Warehouse | null;
    /**
     * 报工改仓可选的完工入库仓列表（当前仓/默认仓优先）
     */
    receiptWarehouseCandidates: Array<Warehouse>;
    /**
     * 完工入库仓库ID（下达时冻结）
     */
    receiptWarehouseId?: string | null;
    /**
     * 是否已发生首笔完工入库（发生后锁定入库仓）
     */
    receiptWarehouseLocked: boolean;
    /**
     * 报工记录
     */
    reports: Array<ReportLogItemDto>;
    /**
     * 工单风险摘要
     */
    riskSummary: WorkOrderRiskSummaryDto;
    route?: ProcessRoute | null;
    /**
     * 工单创建时命中的路线适用规则ID快照
     */
    routeApplicabilityIdSnapshot?: string | null;
    /**
     * 路线主编码快照
     */
    routeCodeSnapshot?: string | null;
    /**
     * 路线版本生效时间快照
     */
    routeEffectiveFromSnapshot?: string | null;
    /**
     * 路线版本失效时间快照
     */
    routeEffectiveToSnapshot?: string | null;
    routeId?: string | null;
    routeMaster?: ProcessRouteMaster | null;
    /**
     * 工艺路线主数据ID快照
     */
    routeMasterId?: string | null;
    /**
     * 路线名称快照
     */
    routeNameSnapshot?: string | null;
    /**
     * 路线版本解析时间
     */
    routeResolvedAt?: string | null;
    /**
     * 路线版本解析/指定人
     */
    routeResolvedBy?: string | null;
    /**
     * 路线版本选择方式
     */
    routeSelectionMode?: WorkOrderRouteSelectionMode | null;
    /**
     * 路线版本选择原因
     */
    routeSelectionReason?: string | null;
    /**
     * 下达时的工艺路线版本号快照
     */
    routeVersion?: string | null;
    /**
     * 工艺路线版本ID快照
     */
    routeVersionId?: string | null;
    routeVersionMeta?: ProcessRouteVersion | null;
    /**
     * 路线版本号快照
     */
    routeVersionSnapshot?: string | null;
    /**
     * 排产尾部缓冲时长（分钟），仅用于甘特图派生展示，不参与产能占用
     */
    scheduleBufferMinutes: number;
    /**
     * 排产时采用的缓冲比例快照，便于解释缓冲分钟数来源
     */
    scheduleBufferRatio?: number | null;
    /**
     * 排产缓冲来源：公司默认 / 手动覆盖 / 历史迁移
     */
    scheduleBufferSource?: WorkOrderScheduleBufferSource | null;
    /**
     * 工单排程锁定原因
     */
    scheduleLockReason?: string | null;
    /**
     * 是否锁定工单排程；锁定后插单重排不会移动该工单的排产
     */
    scheduleLocked: boolean;
    /**
     * 工单排程锁定时间
     */
    scheduleLockedAt?: string | null;
    /**
     * 工单排程锁定人
     */
    scheduleLockedBy?: User | null;
    /**
     * 工单排程锁定人ID
     */
    scheduleLockedById?: string | null;
    /**
     * 工单级排产时间区间（无工序整单排产时使用）
     */
    scheduleSlots: Array<OperationScheduleSlotDto>;
    scrappedQty: number;
    /**
     * 工单正式下达时冻结的成品序列号前缀
     */
    serialNumberPrefixSnapshot?: string | null;
    /**
     * 来源需求备注（工单快照 → 计划快照 → 来源订单行备注的派生口径；归集计划为各需求行“单号/行号：备注”摘要）
     */
    sourceRemark?: string | null;
    /**
     * 来源需求备注快照
     */
    sourceRemarkSnapshot?: string | null;
    status: WorkOrderStatus;
    /**
     * 用于前端展示的状态键（含派生态，如待下达）
     */
    statusDisplay: string;
    /**
     * 临时制造项编码/图号快照
     */
    temporaryItemCode?: string | null;
    /**
     * 临时制造项名称快照
     */
    temporaryItemName?: string | null;
    /**
     * 临时制造项规格快照
     */
    temporaryItemSpec?: string | null;
    /**
     * 工单正式下达时冻结的成品追溯方式
     */
    traceabilityModeSnapshot?: WorkOrderDetailVo.traceabilityModeSnapshot | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    workOrderType: WorkOrderDetailVo.workOrderType;
};
export declare namespace WorkOrderDetailVo {
    /**
     * 工单正式下达时冻结的成品追溯方式
     */
    enum traceabilityModeSnapshot {
        QUANTITY = "quantity",
        BATCH = "batch",
        SERIAL = "serial"
    }
    enum workOrderType {
        NORMAL = "normal",
        REWORK = "rework",
        SPLIT = "split",
        SUPPLEMENT = "supplement",
        SUB_ASSEMBLY = "sub_assembly"
    }
}

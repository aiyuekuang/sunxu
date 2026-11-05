/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomHeader } from './BomHeader';
import type { Customer } from './Customer';
import type { Department } from './Department';
import type { FreeReportConfig } from './FreeReportConfig';
import type { ItemSource } from './ItemSource';
import type { Material } from './Material';
import type { ProcessRoute } from './ProcessRoute';
import type { ProcessRouteMaster } from './ProcessRouteMaster';
import type { ProcessRouteVersion } from './ProcessRouteVersion';
import type { ProductionPlan } from './ProductionPlan';
import type { User } from './User';
import type { Warehouse } from './Warehouse';
import type { WorkOrder } from './WorkOrder';
import type { WorkOrderRouteSelectionMode } from './WorkOrderRouteSelectionMode';
import type { WorkOrderScheduleBufferSource } from './WorkOrderScheduleBufferSource';
import type { WorkOrderStatus } from './WorkOrderStatus';
export type ProductionPlanWorkOrderDto = {
    actualEndTime?: string | null;
    actualStartTime?: string | null;
    assignee?: User | null;
    assigneeId?: string | null;
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
    description?: string | null;
    /**
     * 生产计划场景展示用完成良品数量
     */
    displayCompletedQty: number;
    /**
     * 生产计划场景展示用累计报废数量（有效工序合计）
     */
    displayScrappedQty: number;
    /**
     * 工单执行图纸附件URL快照
     */
    drawingUrls?: Array<string>;
    dueDate?: string | null;
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
     * 工单生产对象来源：物料档案或本单临时制造项
     */
    itemSource: ItemSource;
    material?: Material | null;
    /**
     * 产出物料档案ID；临时子工单为空
     */
    materialId?: string | null;
    materialReqStatus: string;
    orderNo: string;
    /**
     * 工单完成率（0-100）
     */
    overallProgress: number;
    parentWorkOrder?: WorkOrder | null;
    parentWorkOrderId?: string | null;
    pauseReason?: string | null;
    plan?: ProductionPlan | null;
    planEndTime?: string | null;
    planId?: string | null;
    planStartTime?: string | null;
    plannedQty: number;
    priority: number;
    /**
     * 完工入库仓库
     */
    receiptWarehouse?: Warehouse | null;
    /**
     * 完工入库仓库ID（下达时冻结）
     */
    receiptWarehouseId?: string | null;
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
    scrappedQty: number;
    /**
     * 工单正式下达时冻结的成品序列号前缀
     */
    serialNumberPrefixSnapshot?: string | null;
    /**
     * 来源需求备注快照
     */
    sourceRemarkSnapshot?: string | null;
    status: WorkOrderStatus;
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
    traceabilityModeSnapshot?: ProductionPlanWorkOrderDto.traceabilityModeSnapshot | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    workOrderType: ProductionPlanWorkOrderDto.workOrderType;
};
export namespace ProductionPlanWorkOrderDto {
    /**
     * 工单正式下达时冻结的成品追溯方式
     */
    export enum traceabilityModeSnapshot {
        QUANTITY = 'quantity',
        BATCH = 'batch',
        SERIAL = 'serial',
    }
    export enum workOrderType {
        NORMAL = 'normal',
        REWORK = 'rework',
        SPLIT = 'split',
        SUPPLEMENT = 'supplement',
        SUB_ASSEMBLY = 'sub_assembly',
    }
}

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Equipment } from './Equipment';
import type { OutsourcingOrder } from './OutsourcingOrder';
import type { ScheduleExecutionSource } from './ScheduleExecutionSource';
import type { ScheduleRuntimeStatus } from './ScheduleRuntimeStatus';
import type { ScheduleStatus } from './ScheduleStatus';
import type { SetupSource } from './SetupSource';
import type { Supplier } from './Supplier';
import type { User } from './User';
import type { WorkCenter } from './WorkCenter';
import type { WorkOrder } from './WorkOrder';
import type { WorkOrderOperation } from './WorkOrderOperation';
export type ScheduleEntry = {
    /**
     * 实例真实完工时间
     */
    actualEndAt?: string | null;
    /**
     * 实例真实开工时间
     */
    actualStartAt?: string | null;
    assignee?: User | null;
    assigneeId?: string | null;
    companyId: string;
    createdAt: string;
    /**
     * 是否存在工序前置依赖排产冲突（查询接口派生返回）
     */
    dependencyConflict?: boolean;
    /**
     * 前置依赖排产冲突原因（查询接口派生返回）
     */
    dependencyConflictReason?: string | null;
    /**
     * 前置依赖排产提醒（查询接口派生返回）
     */
    dependencyWarning?: string | null;
    /**
     * 冲正后续作实例来源条目
     */
    derivedFromEntryId?: string | null;
    /**
     * 有效工时（分钟），已扣除排班休息时间
     */
    durationMinutes?: number | null;
    equipment?: Equipment | null;
    equipmentId?: string | null;
    /**
     * 执行来源；外协条目不参与内部工作中心、设备和人员产能占用
     */
    executionSource: ScheduleExecutionSource;
    /**
     * 固定排产原因
     */
    firmReason?: string | null;
    id: string;
    /**
     * 是否为缓冲条目（尾部安全缓冲时间）
     */
    isBuffer?: boolean;
    /**
     * 是否为固定排产条目
     */
    isFirm: boolean;
    /**
     * 当前实例实际占用结束时间
     */
    occupiedEndAt?: string | null;
    /**
     * 当前实例实际占用开始时间
     */
    occupiedStartAt?: string | null;
    operation?: WorkOrderOperation | null;
    operationId?: string | null;
    /**
     * 临时委外来源单
     */
    outsourcingOrder?: OutsourcingOrder | null;
    /**
     * 临时委外排产关联的委外单ID；厂内条目为空
     */
    outsourcingOrderId?: string | null;
    plannedEnd: string;
    plannedStart: string;
    /**
     * 计划版本号
     */
    planningVersion: number;
    /**
     * 前置工序摘要（查询接口派生返回）
     */
    predecessorSummary?: string | null;
    /**
     * 编辑关键字段后是否需要重新确认
     */
    reconfirmRequired: boolean;
    /**
     * 本次排产实际采用的加工工时（分钟）快照；历史条目为空时由总工时减准备工时推导
     */
    runMinutes?: number | null;
    /**
     * 实例运行态
     */
    runtimeStatus: ScheduleRuntimeStatus;
    /**
     * 本次排产实际采用的准备/换型工时（分钟）快照；历史条目为空时从工单工序回退推导
     */
    setupMinutes?: number | null;
    /**
     * 准备/换型工时来源；历史条目无法可靠反推时为空
     */
    setupSource?: SetupSource | null;
    /**
     * 拆分组标识：同一工序拆分到多台设备的条目共享同一 splitGroup
     */
    splitGroup?: string | null;
    /**
     * 该排产条目承担的计划数量；未拆分时等于整道工序/整单计划数量
     */
    splitQty?: number | null;
    status: ScheduleStatus;
    /**
     * 委外供应商
     */
    supplier?: Supplier | null;
    /**
     * 委外排产承接供应商快照；内部工序为空
     */
    supplierId?: string | null;
    updatedAt: string;
    workCenter?: WorkCenter | null;
    workCenterId?: string | null;
    workOrder?: WorkOrder;
    workOrderId: string;
};

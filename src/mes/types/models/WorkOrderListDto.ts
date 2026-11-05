/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto';
export type WorkOrderListDto = {
    /**
     * 实际结束时间-起
     */
    actualEndFrom?: string;
    /**
     * 实际结束时间-止
     */
    actualEndTo?: string;
    /**
     * 实际开始时间-起
     */
    actualStartFrom?: string;
    /**
     * 实际开始时间-止
     */
    actualStartTo?: string;
    /**
     * 负责人ID
     */
    assigneeId?: string;
    /**
     * 客户ID
     */
    customerId?: string;
    /**
     * 仅显示可整单报工的工单（生产中、无工艺路线、无工序明细、仍有剩余可报数量）
     */
    directReportableOnly?: boolean;
    /**
     * 交货期限-起
     */
    dueDateFrom?: string;
    /**
     * 交货期限-止
     */
    dueDateTo?: string;
    /**
     * 执行就绪状态（单选）
     */
    executionState?: WorkOrderListDto.executionState;
    /**
     * 执行就绪状态（多选）
     */
    executionStates?: Array<'unscheduled' | 'pending_confirm' | 'ready_to_start'>;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 产出物料档案ID
     */
    materialId?: string;
    /**
     * 物料需求状态（多选）
     */
    materialReqStatuses?: Array<'pending' | 'partial' | 'fulfilled' | 'closed'>;
    /**
     * 仅显示我的工单（当前登录用户）
     */
    myOnly?: boolean;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: WorkOrderListDto.orderDir;
    /**
     * 工单号（模糊搜索）
     */
    orderNo?: string;
    /**
     * 仅显示交期已逾期工单
     */
    overdueOnly?: boolean;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 父工单ID（查询子工单）
     */
    parentWorkOrderId?: string;
    /**
     * 计划结束时间-起
     */
    planEndFrom?: string;
    /**
     * 计划结束时间-止
     */
    planEndTo?: string;
    /**
     * 关联计划ID
     */
    planId?: string;
    /**
     * 计划开始时间-起
     */
    planStartFrom?: string;
    /**
     * 计划开始时间-止
     */
    planStartTo?: string;
    /**
     * 优先级上限（含）
     */
    priorityMax?: number;
    /**
     * 优先级下限（含）
     */
    priorityMin?: number;
    /**
     * 状态（单选，向后兼容）
     */
    status?: WorkOrderListDto.status;
    /**
     * 状态（多选）
     */
    statuses?: Array<'draft' | 'submitted' | 'released' | 'in_progress' | 'paused' | 'completed' | 'cancelled' | 'closed'>;
    /**
     * 工作中心ID（关联工序或排产记录）
     */
    workCenterId?: string;
    /**
     * 工单类型
     */
    workOrderType?: WorkOrderListDto.workOrderType;
};
export namespace WorkOrderListDto {
    /**
     * 执行就绪状态（单选）
     */
    export enum executionState {
        UNSCHEDULED = 'unscheduled',
        PENDING_CONFIRM = 'pending_confirm',
        READY_TO_START = 'ready_to_start',
    }
    /**
     * 排序方向
     */
    export enum orderDir {
        ASC = 'ASC',
        DESC = 'DESC',
    }
    /**
     * 状态（单选，向后兼容）
     */
    export enum status {
        DRAFT = 'draft',
        SUBMITTED = 'submitted',
        RELEASED = 'released',
        IN_PROGRESS = 'in_progress',
        PAUSED = 'paused',
        COMPLETED = 'completed',
        CANCELLED = 'cancelled',
        CLOSED = 'closed',
    }
    /**
     * 工单类型
     */
    export enum workOrderType {
        NORMAL = 'normal',
        REWORK = 'rework',
        SPLIT = 'split',
        SUPPLEMENT = 'supplement',
        SUB_ASSEMBLY = 'sub_assembly',
    }
}

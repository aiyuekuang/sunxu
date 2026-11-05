import type { GanttAssigneeDto } from './GanttAssigneeDto.d.ts';
import type { GanttEquipmentDto } from './GanttEquipmentDto.d.ts';
import type { GanttOperationDto } from './GanttOperationDto.d.ts';
import type { GanttWorkCenterDto } from './GanttWorkCenterDto.d.ts';
import type { GanttWorkOrderDto } from './GanttWorkOrderDto.d.ts';
import type { ScheduleRuntimeStatus } from './ScheduleRuntimeStatus.d.ts';
export type GanttEntryDto = {
    /**
     * 实例真实完工时间
     */
    actualEndAt?: string | null;
    /**
     * 实例真实开工时间
     */
    actualStartAt?: string | null;
    assignee?: GanttAssigneeDto | null;
    assigneeId?: string | null;
    /**
     * 缓冲条目尾随的正常排产条目 ID；非缓冲条目为空
     */
    bufferAfterEntryId?: string | null;
    /**
     * 是否存在工序前置依赖排产冲突
     */
    dependencyConflict?: boolean;
    /**
     * 前置依赖排产冲突原因
     */
    dependencyConflictReason?: string | null;
    /**
     * 前置依赖排产提醒
     */
    dependencyWarning?: string | null;
    /**
     * 冲正后续作来源条目
     */
    derivedFromEntryId?: string | null;
    /**
     * 工时（分钟）
     */
    durationMinutes: number;
    equipment?: GanttEquipmentDto | null;
    equipmentId?: string | null;
    /**
     * 固定原因
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
     * 是否委外工序；委外条目展示委外计划时长，不占用内部设备产能
     */
    isOutsourced: boolean;
    /**
     * 实例当前占用结束时间
     */
    occupiedEndAt?: string | null;
    /**
     * 实例当前占用开始时间
     */
    occupiedStartAt?: string | null;
    operation?: GanttOperationDto | null;
    operationId?: string | null;
    plannedEnd: string;
    plannedStart: string;
    /**
     * 计划版本号
     */
    planningVersion: number;
    /**
     * 前置工序摘要
     */
    predecessorSummary?: string | null;
    /**
     * 正式加工开始时间（按班次有效工时推导）
     */
    productionStartTime: string;
    /**
     * 是否需要重新确认
     */
    reconfirmRequired: boolean;
    /**
     * 加工工时（分钟）
     */
    runMinutes: number;
    /**
     * 实例运行态
     */
    runtimeStatus: ScheduleRuntimeStatus;
    /**
     * 准备/换型工时（分钟）
     */
    setupMinutes: number;
    /**
     * 准备/换型工时来源；历史条目无法可靠反推时为空
     */
    setupSource?: GanttEntryDto.setupSource | null;
    /**
     * 准备/资源占用开始时间
     */
    setupStartTime: string;
    /**
     * 拆分组标识（同一工序拆分到多台设备的条目共享）
     */
    splitGroup?: string | null;
    /**
     * 该排产条目承担的计划数量
     */
    splitQty?: number | null;
    status: string;
    /**
     * 工时拆分数据来源
     */
    timeBreakdownSource: GanttEntryDto.timeBreakdownSource;
    workCenter?: GanttWorkCenterDto | null;
    workCenterId?: string | null;
    workOrder?: GanttWorkOrderDto | null;
    workOrderId: string;
};
export declare namespace GanttEntryDto {
    /**
     * 准备/换型工时来源；历史条目无法可靠反推时为空
     */
    enum setupSource {
        STANDARD = "standard",
        ACTUAL = "actual",
        DEFAULT = "default",
        NONE = "none"
    }
    /**
     * 工时拆分数据来源
     */
    enum timeBreakdownSource {
        SCHEDULE_ENTRY_SNAPSHOT = "schedule_entry_snapshot",
        OPERATION_SNAPSHOT = "operation_snapshot",
        MANUAL_ENTRY = "manual_entry",
        BUFFER_ENTRY = "buffer_entry",
        UNKNOWN = "unknown"
    }
}

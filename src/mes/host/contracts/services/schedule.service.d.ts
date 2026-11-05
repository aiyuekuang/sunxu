import type { AutoScheduleFromPlansDto } from '../generated/models/AutoScheduleFromPlansDto.d.ts';
import type { AppliedSchedulePolicyDto } from '../generated/models/AppliedSchedulePolicyDto.d.ts';
import type { GanttEntryDto as _GanttEntry } from '../generated/models/GanttEntryDto.d.ts';
import type { GanttResponseDto as _GanttData } from '../generated/models/GanttResponseDto.d.ts';
import type { GanttWorkCenterGroupDto as _GanttWorkCenter } from '../generated/models/GanttWorkCenterGroupDto.d.ts';
import type { PlanScheduleResultDto } from '../generated/models/PlanScheduleResultDto.d.ts';
import type { PlanSchedulePreviewResponseDto } from '../generated/models/PlanSchedulePreviewResponseDto.d.ts';
import type { ScheduleEntry as _ScheduleEntry } from '../generated/models/ScheduleEntry.d.ts';
import type { SchedulePolicyDto } from '../generated/models/SchedulePolicyDto.d.ts';
import type { UnconfirmScheduleResponseDto } from '../generated/models/UnconfirmScheduleResponseDto.d.ts';
import type { UpdateScheduleEntryResponseDto } from '../generated/models/UpdateScheduleEntryResponseDto.d.ts';
import type { UpdateSchedulePolicyDto } from '../generated/models/UpdateSchedulePolicyDto.d.ts';
import type { AuditLogListDto } from '../generated/models/AuditLogListDto.d.ts';
import type { AuditLogListResponseDto } from '../generated/models/AuditLogListResponseDto.d.ts';
export type ScheduleStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type CalendarExceptionType = 'holiday' | 'maintenance' | 'overtime';
export type { ShiftCalendar } from '../generated/models/ShiftCalendar.d.ts';
export type { CalendarException } from '../generated/models/CalendarException.d.ts';
export type ScheduleDependencyFields = {
    /** 是否存在工序前置依赖排产冲突 */
    dependencyConflict?: boolean;
    /** 前置依赖排产冲突原因 */
    dependencyConflictReason?: string | null;
    /** 前置依赖排产提醒 */
    dependencyWarning?: string | null;
    /** 前置工序摘要 */
    predecessorSummary?: string | null;
};
export type GanttEntry = _GanttEntry & ScheduleDependencyFields & {
    durationMinutes?: number | null;
    isBuffer?: boolean;
    bufferAfterEntryId?: string | null;
};
export type GanttWorkCenter = Omit<_GanttWorkCenter, 'entries'> & {
    entries: GanttEntry[];
};
export type GanttData = Omit<_GanttData, 'workCenters'> & {
    workCenters: GanttWorkCenter[];
};
export type ScheduleEntry = _ScheduleEntry & ScheduleDependencyFields;
export type ScheduleEntryUpdateResult = UpdateScheduleEntryResponseDto & ScheduleDependencyFields;
export type { AppliedSchedulePolicyDto, SchedulePolicyDto };
export type { UnconfirmScheduleResponseDto };
import type { ShiftCalendar } from '../generated/models/ShiftCalendar.d.ts';
import type { CalendarException } from '../generated/models/CalendarException.d.ts';
import type { ShiftCalendarListDto } from '../generated/models/ShiftCalendarListDto.d.ts';
import type { CreateShiftCalendarDto } from '../generated/models/CreateShiftCalendarDto.d.ts';
import type { UpdateShiftCalendarDto } from '../generated/models/UpdateShiftCalendarDto.d.ts';
import type { CalendarExceptionListDto } from '../generated/models/CalendarExceptionListDto.d.ts';
import type { CreateCalendarExceptionDto } from '../generated/models/CreateCalendarExceptionDto.d.ts';
import type { UpdateCalendarExceptionDto } from '../generated/models/UpdateCalendarExceptionDto.d.ts';
import type { ScheduleListDto } from '../generated/models/ScheduleListDto.d.ts';
import type { ScheduleGanttDto } from '../generated/models/ScheduleGanttDto.d.ts';
import type { CreateScheduleEntryDto } from '../generated/models/CreateScheduleEntryDto.d.ts';
import type { AutoScheduleDto } from '../generated/models/AutoScheduleDto.d.ts';
import type { UpdateScheduleEntryDto } from '../generated/models/UpdateScheduleEntryDto.d.ts';
import type { ScheduleCapacityDto } from '../generated/models/ScheduleCapacityDto.d.ts';
import type { ScheduleBottleneckDto } from '../generated/models/ScheduleBottleneckDto.d.ts';
import type { WorkOrderScheduleBufferSource } from '../generated/models/WorkOrderScheduleBufferSource.d.ts';
export declare const scheduleService: {
    listShifts: (params?: ShiftCalendarListDto) => Promise<import("./_base.d.ts").PaginatedList<ShiftCalendar>>;
    createShift: (dto: CreateShiftCalendarDto) => import("../../../types/generated/index").Promise<ShiftCalendar>;
    updateShift: (dto: UpdateShiftCalendarDto) => import("../../../types/generated/index").Promise<ShiftCalendar>;
    deleteShift: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    getShiftHistory: (dto: AuditLogListDto) => Promise<AuditLogListResponseDto>;
    listExceptions: (params?: CalendarExceptionListDto) => Promise<import("./_base.d.ts").PaginatedList<CalendarException>>;
    createException: (dto: CreateCalendarExceptionDto) => import("../../../types/generated/index").Promise<CalendarException>;
    updateException: (dto: UpdateCalendarExceptionDto) => import("../../../types/generated/index").Promise<CalendarException>;
    deleteException: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    getExceptionHistory: (dto: AuditLogListDto) => Promise<AuditLogListResponseDto>;
    listEntries: (params?: ScheduleListDto) => Promise<import("./_base.d.ts").PaginatedList<ScheduleEntry>>;
    getGantt: (params: ScheduleGanttDto) => import("../../../types/generated/index").Promise<_GanttData>;
    createEntry: (dto: CreateScheduleEntryDto) => Promise<ScheduleEntry>;
    deleteEntry: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").DeleteScheduleEntryResponseDto>;
    updateEntry: (dto: UpdateScheduleEntryDto) => Promise<ScheduleEntryUpdateResult>;
    autoSchedule: (dto: AutoScheduleDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").AutoScheduleResponseDto>;
    confirmSchedule: (ids: string[], clientRequestId?: string) => Promise<import("../../../types/generated/index").ConfirmScheduleResponseDto>;
    unconfirmSchedule: (ids: string[], clientRequestId?: string) => Promise<UnconfirmScheduleResponseDto>;
    autoSchedulePreview: (dto: AutoScheduleDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").AutoSchedulePreviewResponseDto>;
    getPolicy: () => import("../../../types/generated/index").Promise<SchedulePolicyDto>;
    updatePolicy: (dto: UpdateSchedulePolicyDto) => import("../../../types/generated/index").Promise<SchedulePolicyDto>;
    getCapacity: (params: ScheduleCapacityDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").CapacityResponseDto>;
    getBottleneck: (params: ScheduleBottleneckDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").BottleneckResponseDto>;
    scheduleFromPlans: (dto: AutoScheduleFromPlansDto) => Promise<PlanScheduleResultDto>;
    scheduleFromPlansPreview: (dto: AutoScheduleFromPlansDto) => Promise<PlanSchedulePreviewResponseDto>;
};
export type { WorkOrderScheduleBufferSource };

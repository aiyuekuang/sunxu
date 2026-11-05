/** 工单列表项 — 来自后端 WorkOrderListItemDto */
export type { WorkOrderListItemDto as WorkOrder } from '../generated/models/WorkOrderListItemDto.d.ts';
/** 工单详情 — 来自后端 WorkOrderDetailVo */
export type { WorkOrderDetailVo as WorkOrderDetail } from '../generated/models/WorkOrderDetailVo.d.ts';
/** 工序 — 来自后端 WorkOrderOperation entity */
export type { WorkOrderOperation } from '../generated/models/WorkOrderOperation.d.ts';
/** 子工单摘要 — 来自后端 ChildOrderSummaryDto */
export type { ChildOrderSummaryDto as ChildOrderSummary } from '../generated/models/ChildOrderSummaryDto.d.ts';
/** 工单状态枚举 — 来自后端 WorkOrderStatus */
export type WorkOrderStatus = 'draft' | 'submitted' | 'released' | 'in_progress' | 'paused' | 'completed' | 'cancelled' | 'closed';
export type WorkOrderExecutionState = 'unscheduled' | 'pending_confirm' | 'ready_to_start';
/** 工序状态枚举 — 来自后端 WorkOrderOperationStatus */
export type WorkOrderOperationStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
/** 报工日志项 — 来自后端 ReportLogItemDto */
export type { ReportLogItemDto as ReportLogItem } from '../generated/models/ReportLogItemDto.d.ts';
/** 工序二维码 — 来自后端 OperationQrCodeItemDto */
export type { OperationQrCodeItemDto as OperationQrCode } from '../generated/models/OperationQrCodeItemDto.d.ts';
/** 批量操作响应 — 来自后端 BatchOperationResponseDto */
export type { BatchOperationResponseDto } from '../generated/models/BatchOperationResponseDto.d.ts';
/** 批量导入工单响应 — 来自后端 BulkWorkOrderImportResponseDto */
export type { BulkWorkOrderImportResponseDto } from '../generated/models/BulkWorkOrderImportResponseDto.d.ts';
/** 工单类型 */
export type WorkOrderType = 'normal' | 'rework' | 'split' | 'sub_assembly' | 'supplement';
/** 列表项（含进度）— WorkOrderListItemDto 本身已包含 overallProgress */
import type { WorkOrderListItemDto } from '../generated/models/WorkOrderListItemDto.d.ts';
export type WorkOrderWithProgress = WorkOrderListItemDto;
import type { WorkOrderListDto } from '../generated/models/WorkOrderListDto.d.ts';
import type { CreateWorkOrderDto } from '../generated/models/CreateWorkOrderDto.d.ts';
import type { CreateSubAssemblyOrdersDto } from '../generated/models/CreateSubAssemblyOrdersDto.d.ts';
import type { EndSessionAndReportOperationDto } from '../generated/models/EndSessionAndReportOperationDto.d.ts';
import type { UpdateWorkOrderDto } from '../generated/models/UpdateWorkOrderDto.d.ts';
import type { ReportWorkOrderDto } from '../generated/models/ReportWorkOrderDto.d.ts';
import type { ReportOperationDto } from '../generated/models/ReportOperationDto.d.ts';
import type { RecordOperationExecutionDto } from '../generated/models/RecordOperationExecutionDto.d.ts';
import type { RevokeOperationExecutionDto } from '../generated/models/RevokeOperationExecutionDto.d.ts';
import type { SplitWorkOrderDto } from '../generated/models/SplitWorkOrderDto.d.ts';
import type { AppendWorkOrderQuantityDto } from '../generated/models/AppendWorkOrderQuantityDto.d.ts';
import type { SupplementWorkOrderDto } from '../generated/models/SupplementWorkOrderDto.d.ts';
import type { ExecuteWorkOrderQuantityActionDto } from '../generated/models/ExecuteWorkOrderQuantityActionDto.d.ts';
import type { WorkOrderQuantityActionPreviewDto } from '../generated/models/WorkOrderQuantityActionPreviewDto.d.ts';
import type { AddWorkOrderOperationDto as AddWorkOrderOperationDtoGenerated } from '../generated/models/AddWorkOrderOperationDto.d.ts';
import type { UpdateWorkOrderOperationDto } from '../generated/models/UpdateWorkOrderOperationDto.d.ts';
import type { RemoveWorkOrderOperationDto } from '../generated/models/RemoveWorkOrderOperationDto.d.ts';
import type { ReportLogListDto } from '../generated/models/ReportLogListDto.d.ts';
import type { CopyWorkOrderDto } from '../generated/models/CopyWorkOrderDto.d.ts';
import type { BatchReportDto } from '../generated/models/BatchReportDto.d.ts';
import type { WorkOrderDetailVo } from '../generated/models/WorkOrderDetailVo.d.ts';
import type { AllOperationsDto } from '../generated/models/AllOperationsDto.d.ts';
import type { BatchCancelDto } from '../generated/models/BatchCancelDto.d.ts';
import type { BatchReleaseDto } from '../generated/models/BatchReleaseDto.d.ts';
import type { BulkImportWorkOrderDto } from '../generated/models/BulkImportWorkOrderDto.d.ts';
import type { ImportExcelDto } from '../generated/models/ImportExcelDto.d.ts';
import type { ReportLogAdminDto } from '../generated/models/ReportLogAdminDto.d.ts';
import type { UserOperationsDto } from '../generated/models/UserOperationsDto.d.ts';
import type { WorkOrderReadinessOverrideDto } from '../generated/models/WorkOrderReadinessOverrideDto.d.ts';
import type { SetReceiptWarehouseDto } from '../generated/models/SetReceiptWarehouseDto.d.ts';
type ActualSetupMinutesInput = {
    actualSetupMinutes?: number;
};
export interface WorkOrderListParams {
    page?: number;
    pageSize?: number;
    status?: WorkOrderStatus | string;
    statuses?: WorkOrderStatus[];
    executionState?: WorkOrderExecutionState;
    executionStates?: WorkOrderExecutionState[];
    planId?: string;
    keyword?: string;
    overdueOnly?: boolean;
    myOnly?: boolean;
    workOrderType?: WorkOrderType;
    priorityMin?: number;
    priorityMax?: number;
    assigneeId?: string;
    materialId?: string;
    planStartFrom?: string;
    planStartTo?: string;
    planEndFrom?: string;
    planEndTo?: string;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
}
export type AddWorkOrderOperationDto = Omit<AddWorkOrderOperationDtoGenerated, 'standardTime' | 'equipmentType'> & {
    standardTime: number;
    equipmentType: string;
};
export interface ReportLogListResult {
    list: import('../generated/models/ReportLogItemDto.d.ts').ReportLogItemDto[];
    total: number;
    page: number;
    pageSize: number;
}
export declare const workOrderService: {
    findByNo(orderNo: string): Promise<WorkOrderListItemDto | null>;
    create: (dto: CreateWorkOrderDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    createSubAssemblyOrders: (dto: CreateSubAssemblyOrdersDto) => import("../../../types/generated/index").Promise<WorkOrderDetailVo>;
    update: (dto: UpdateWorkOrderDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    start: (id: string, readinessOverride?: WorkOrderReadinessOverrideDto, scheduleEntryId?: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    pause: (id: string, reason?: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    resume: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    reportDirect: (dto: ReportWorkOrderDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrderReportResultVo>;
    reportOperation: (dto: ReportOperationDto & ActualSetupMinutesInput) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrderReportResultVo>;
    endSessionAndReportOperation: (dto: EndSessionAndReportOperationDto & ActualSetupMinutesInput) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrderReportResultVo>;
    recordOperationExecution: (dto: RecordOperationExecutionDto & ActualSetupMinutesInput) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    complete: (id: string, forceComplete?: boolean) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    reopen: (id: string, reason: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    release: (id: string, assigneeId?: string, receiptWarehouseId?: string, readinessOverride?: WorkOrderReadinessOverrideDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    setReceiptWarehouse: (dto: SetReceiptWarehouseDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    submit: (id: string) => import("../../../types/generated/index").Promise<WorkOrderDetailVo>;
    cancel: (id: string, reason: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    close: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    revokeReport: (dto: {
        workOrderId: string;
        reportLogId?: string;
        operationId?: string;
        revokeCompletedQty?: number;
        revokeScrapQty?: number;
        remark?: string;
    }) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    revokeOperationExecution: (dto: RevokeOperationExecutionDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    assignOperation: (dto: {
        workOrderId: string;
        operationId: string;
        assigneeId: string;
    }) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    split: (dto: SplitWorkOrderDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    quantityActionPreview: (dto: WorkOrderQuantityActionPreviewDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrderQuantityActionPreviewResponseDto>;
    changeQuantity: (dto: WorkOrderQuantityActionPreviewDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrderQuantityActionResultDto>;
    appendQuantity: (dto: AppendWorkOrderQuantityDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrderQuantityActionResultDto>;
    supplementWorkOrder: (dto: SupplementWorkOrderDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrderQuantityActionResultDto>;
    executeQuantityAction: (dto: ExecuteWorkOrderQuantityActionDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrderQuantityActionResultDto>;
    getOperations: (workOrderId: string) => import("../../../types/generated/index").Promise<import("./work-order.service.d.ts").WorkOrderOperation[]>;
    addOperation: (dto: AddWorkOrderOperationDto) => import("../../../types/generated/index").Promise<import("./work-order.service.d.ts").WorkOrderOperation>;
    updateOperation: (dto: UpdateWorkOrderOperationDto) => import("../../../types/generated/index").Promise<import("./work-order.service.d.ts").WorkOrderOperation>;
    removeOperation: (dto: RemoveWorkOrderOperationDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    myOperations: () => import("../../../types/generated/index").Promise<import("./work-order.service.d.ts").WorkOrderOperation[]>;
    getReportLogs(dto: ReportLogListDto): Promise<ReportLogListResult>;
    getOperationQrCodes: (workOrderId: string) => import("../../../types/generated/index").Promise<import("./work-order.service.d.ts").OperationQrCode[]>;
    copy: (dto: CopyWorkOrderDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WorkOrder>;
    delete: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    batchReport: (dto: BatchReportDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").BatchReportResponseDto>;
    allOperations: (dto: AllOperationsDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").PaginatedListDto>;
    batchCancel: (dto: BatchCancelDto) => import("../../../types/generated/index").Promise<import("./work-order.service.d.ts").BatchOperationResponseDto>;
    batchRelease: (dto: BatchReleaseDto) => import("../../../types/generated/index").Promise<import("./work-order.service.d.ts").BatchOperationResponseDto>;
    bulkImport: (dto: BulkImportWorkOrderDto) => import("../../../types/generated/index").Promise<import("./work-order.service.d.ts").BulkWorkOrderImportResponseDto>;
    exportExcel: (dto: WorkOrderListDto) => import("../../../types/generated/index").Promise<Blob>;
    exportExcelTemplate: () => import("../../../types/generated/index").Promise<Blob>;
    importExcel: (dto: ImportExcelDto) => import("../../../types/generated/index").Promise<import("./work-order.service.d.ts").BulkWorkOrderImportResponseDto>;
    reportLogsAll: (dto: ReportLogAdminDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").PaginatedListDto>;
    userOperations: (dto: UserOperationsDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").PaginatedListDto>;
    list(params?: WorkOrderListParams): Promise<import("./_base.d.ts").PaginatedList<WorkOrderListItemDto>>;
    detail(id: string): Promise<WorkOrderListItemDto>;
};

import { type PaginatedList } from './_base.d.ts';
export type { ProductionReceiptOrder } from '../generated/models/ProductionReceiptOrder.d.ts';
export type { ProductionReceiptItem } from '../generated/models/ProductionReceiptItem.d.ts';
export type { ProductionOutputBuffer } from '../generated/models/ProductionOutputBuffer.d.ts';
export type { ProductionReceiptPrecheckResponseDto } from '../generated/models/ProductionReceiptPrecheckResponseDto.d.ts';
export type { ProductionReceiptStatsResponseDto } from '../generated/models/ProductionReceiptStatsResponseDto.d.ts';
export type { ProductionReceiptSummaryDto as ProductionReceiptReportSummary } from '../generated/models/ProductionReceiptSummaryDto.d.ts';
export type { WorkOrderReceiptSummaryResponseDto } from '../generated/models/WorkOrderReceiptSummaryResponseDto.d.ts';
export type { BusinessBatchPreviewResponseDto } from '../generated/models/BusinessBatchPreviewResponseDto.d.ts';
export type { BusinessBatchResponseDto } from '../generated/models/BusinessBatchResponseDto.d.ts';
export { ProductionReceiptStatus } from '../generated/models/ProductionReceiptStatus.d.ts';
export { ProductionOutputBufferStatus } from '../generated/models/ProductionOutputBufferStatus.d.ts';
export type { ConfirmProductionReceiptDto } from '../generated/models/ConfirmProductionReceiptDto.d.ts';
import { ConfirmProductionReceiptDto as ConfirmProductionReceiptDtoModel } from '../generated/models/ConfirmProductionReceiptDto.d.ts';
export declare const ReceiptPackageMode: typeof ConfirmProductionReceiptDtoModel.packageMode;
export type ReceiptPackageMode = ConfirmProductionReceiptDtoModel.packageMode;
export type { ReceiptPackageDto } from '../generated/models/ReceiptPackageDto.d.ts';
import type { CancelProductionReceiptDto } from '../generated/models/CancelProductionReceiptDto.d.ts';
import type { BatchConfirmProductionReceiptDto } from '../generated/models/BatchConfirmProductionReceiptDto.d.ts';
import type { ConfirmProductionReceiptDto } from '../generated/models/ConfirmProductionReceiptDto.d.ts';
import type { DisposeOutputBufferDto } from '../generated/models/DisposeOutputBufferDto.d.ts';
import type { GenerateFromOutputBufferDto } from '../generated/models/GenerateFromOutputBufferDto.d.ts';
import type { OutputBufferListDto } from '../generated/models/OutputBufferListDto.d.ts';
import type { ProductionOutputBuffer } from '../generated/models/ProductionOutputBuffer.d.ts';
import type { ProductionReceiptListDto } from '../generated/models/ProductionReceiptListDto.d.ts';
import type { ProductionReceiptOrder } from '../generated/models/ProductionReceiptOrder.d.ts';
import type { ProductionReceiptPrecheckDto } from '../generated/models/ProductionReceiptPrecheckDto.d.ts';
import type { ProductionReceiptSummaryDto } from '../generated/models/ProductionReceiptSummaryDto.d.ts';
import type { PreviewBatchConfirmProductionReceiptDto } from '../generated/models/PreviewBatchConfirmProductionReceiptDto.d.ts';
import type { ReverseProductionReceiptDto } from '../generated/models/ReverseProductionReceiptDto.d.ts';
import type { UpdateOutputBufferLocationDto } from '../generated/models/UpdateOutputBufferLocationDto.d.ts';
import type { WorkOrderReceiptSummaryQueryDto } from '../generated/models/WorkOrderReceiptSummaryQueryDto.d.ts';
import type { WorkOrderReportResultVo } from '../generated/models/WorkOrderReportResultVo.d.ts';
export declare const productionReceiptService: {
    list: (params?: ProductionReceiptListDto) => Promise<PaginatedList<ProductionReceiptOrder>>;
    detail: (id: string) => Promise<ProductionReceiptOrder>;
    /** 确认前预检（必填项/质量门控均以此为准，前端不硬编码） */
    precheck: (dto: ProductionReceiptPrecheckDto) => import("../../../types/generated/index").Promise<import("./production-receipt.service.d.ts").ProductionReceiptPrecheckResponseDto>;
    confirm: (dto: ConfirmProductionReceiptDto) => import("../../../types/generated/index").Promise<ProductionReceiptOrder>;
    previewBatchConfirm: (dto: PreviewBatchConfirmProductionReceiptDto) => import("../../../types/generated/index").Promise<import("./production-receipt.service.d.ts").BusinessBatchPreviewResponseDto>;
    batchConfirm: (dto: BatchConfirmProductionReceiptDto) => import("../../../types/generated/index").Promise<import("./production-receipt.service.d.ts").BusinessBatchResponseDto>;
    cancel: (dto: CancelProductionReceiptDto) => import("../../../types/generated/index").Promise<ProductionReceiptOrder>;
    reverse: (dto: ReverseProductionReceiptDto) => import("../../../types/generated/index").Promise<ProductionReceiptOrder>;
    stats: () => import("../../../types/generated/index").Promise<import("./production-receipt.service.d.ts").ProductionReceiptStatsResponseDto>;
    workOrderSummary: (dto: WorkOrderReceiptSummaryQueryDto) => import("../../../types/generated/index").Promise<import("./production-receipt.service.d.ts").WorkOrderReceiptSummaryResponseDto>;
    outputBufferList(params?: OutputBufferListDto): Promise<PaginatedList<ProductionOutputBuffer>>;
    updateOutputBufferLocation: (dto: UpdateOutputBufferLocationDto) => import("../../../types/generated/index").Promise<ProductionOutputBuffer>;
    disposeOutputBuffer: (dto: DisposeOutputBufferDto) => import("../../../types/generated/index").Promise<ProductionOutputBuffer>;
    generateFromOutputBuffer: (dto: GenerateFromOutputBufferDto) => import("../../../types/generated/index").Promise<ProductionReceiptOrder>;
};
/**
 * 从报工接口返回值中提取生产入库摘要。
 * 返回 null 表示本次报工不带摘要（自动入库等模式，调用方保持原有行为）。
 */
export declare function extractProductionReceiptSummary(result: WorkOrderReportResultVo): ProductionReceiptSummaryDto | null;

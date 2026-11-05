import type { OperationPayPreviewDto } from './OperationPayPreviewDto.d.ts';
import type { PieceworkQtyBasis } from './PieceworkQtyBasis.d.ts';
import type { ProductionScrapOrderStatus } from './ProductionScrapOrderStatus.d.ts';
import type { ReportTimeSource } from './ReportTimeSource.d.ts';
export type ReportLogItemDto = {
    /**
     * 本次报工显式记录的实际准备/换型工时（分钟）
     */
    actualSetupMinutes?: number | null;
    batchNo?: string;
    completedQty: number;
    convertedCompletedQty?: number;
    convertedScrappedQty?: number;
    createdAt: string;
    /**
     * 来源需求行ID
     */
    demandLineId?: string;
    durationMinutes?: number;
    /**
     * 本次工时结束时间
     */
    endedAt?: string;
    equipmentId?: string;
    equipmentName?: string;
    equipmentSessionId?: string;
    executionQty?: number;
    /**
     * 执行量/仅工时原因
     */
    executionReason?: string;
    executionUnit?: string;
    id: string;
    /**
     * 是否辅操报工
     */
    isAuxiliary?: boolean;
    occurredAt?: string;
    operationId?: string;
    operationName?: string;
    operationReportAffectsOutputSnapshot?: boolean;
    operationReportBaseProductQtySnapshot?: number;
    operationReportTargetQtySnapshot?: number;
    payPreview?: OperationPayPreviewDto;
    /**
     * 现场照片 URL 列表
     */
    photoUrls?: Array<string>;
    pieceRateSnapshot?: number;
    /**
     * 本次报工计件数量基准
     */
    pieceworkQtyBasisSnapshot?: PieceworkQtyBasis;
    productionScrapId?: string;
    productionScrapNo?: string;
    productionScrapPendingQty?: number;
    productionScrapResolvedConcessionQty?: number;
    productionScrapResolvedNonScrapQty?: number;
    productionScrapResolvedScrapQty?: number;
    productionScrapStatus?: ProductionScrapOrderStatus;
    quantityRole?: string;
    remark?: string;
    reportedBy: string;
    reportedOperationQty?: number;
    reportedOperationUnit?: string;
    reporterName?: string;
    scheduleEntryId?: string;
    /**
     * 报废照片 URL 列表
     */
    scrapPhotoUrls?: Array<string>;
    /**
     * 报废原因
     */
    scrapReason?: string;
    scrappedQty: number;
    /**
     * 来源需求行号
     */
    sourceDemandLineNo?: number;
    /**
     * 来源订单号
     */
    sourceOrderNo?: string;
    /**
     * 来源需求备注
     */
    sourceRemarkSnapshot?: string;
    /**
     * 本次工时开始时间
     */
    startedAt?: string;
    timeSource?: ReportTimeSource;
    type: ReportLogItemDto.type;
    workCenterId?: string;
    /**
     * 零数量报工原因
     */
    zeroQuantityReason?: string;
};
export declare namespace ReportLogItemDto {
    enum type {
        REPORT = "report",
        REVOKE = "revoke"
    }
}

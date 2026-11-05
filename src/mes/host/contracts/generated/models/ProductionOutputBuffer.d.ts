import type { Material } from './Material.d.ts';
import type { ProductionOutputBufferStatus } from './ProductionOutputBufferStatus.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
export type ProductionOutputBuffer = {
    /**
     * 当前质量处置单ID（派生）
     */
    activeDisposalId?: string | null;
    /**
     * 当前质量处置单号（派生）
     */
    activeDisposalNo?: string | null;
    /**
     * 当前生产不合格记录ID（派生）
     */
    activeNonconformanceId?: string | null;
    /**
     * 当前生产输出暂存允许的业务动作
     */
    availableActions?: Array<string>;
    /**
     * 产出批次（无批次时为空字符串）
     */
    batchNo: string;
    companyId: string;
    createdAt: string;
    /**
     * 已报废、返工转出、灭失或盘点核销等最终核销/转出数量
     */
    disposedQty: number;
    id: string;
    /**
     * 最近来源报工流水ID
     */
    lastReportLogId?: string | null;
    location?: WarehouseLocation | null;
    /**
     * 结构化暂存仓位ID
     */
    locationId?: string | null;
    material?: Material;
    materialId: string;
    /**
     * 仍待处理的暂存数量（可生成生产入库单、报废、返工或核销）
     */
    openQty: number;
    operationId?: string | null;
    /**
     * 已报工形成的产出数量累计（产品基础单位）
     */
    outputQty: number;
    /**
     * 已被待确认生产入库占用但未确认的数量
     */
    pendingReceiptQty: number;
    /**
     * 已发现损坏或不合格、等待质量判定和处置的冻结数量
     */
    qualityHoldQty: number;
    /**
     * 已确认入库数量
     */
    receivedQty: number;
    /**
     * 来源报工流水ID集合
     */
    sourceReportLogIds: Array<string>;
    status: ProductionOutputBufferStatus;
    /**
     * 车间暂存位置文本
     */
    storageLocation?: string | null;
    updatedAt: string;
    workOrder?: WorkOrder;
    workOrderId: string;
};

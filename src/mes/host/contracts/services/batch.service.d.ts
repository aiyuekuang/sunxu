import type { BatchListDto } from '../generated/models/BatchListDto.d.ts';
import type { ChangeBatchStatusDto } from '../generated/models/ChangeBatchStatusDto.d.ts';
import type { CreateBatchDto } from '../generated/models/CreateBatchDto.d.ts';
import type { MaterialBatch } from '../generated/models/MaterialBatch.d.ts';
import type { TraceBatchLookupDto } from '../generated/models/TraceBatchLookupDto.d.ts';
import { TraceBatchGraphDto } from '../generated/models/TraceBatchGraphDto.d.ts';
import type { TraceGraphDto } from '../generated/models/TraceGraphDto.d.ts';
import type { TraceGraphNodeDto } from '../generated/models/TraceGraphNodeDto.d.ts';
import type { TraceResultDto } from '../generated/models/TraceResultDto.d.ts';
import type { UpdateBatchDto } from '../generated/models/UpdateBatchDto.d.ts';
export type BatchStatus = 'available' | 'quarantine' | 'expired' | 'consumed';
export type { MaterialBatch } from '../generated/models/MaterialBatch.d.ts';
export type TraceBatchLookup = TraceBatchLookupDto;
export type { TraceNodeDto as LegacyTraceNode } from '../generated/models/TraceNodeDto.d.ts';
export type { ChangeBatchStatusDto } from '../generated/models/ChangeBatchStatusDto.d.ts';
export type { UpdateBatchDto } from '../generated/models/UpdateBatchDto.d.ts';
export type { BatchListDto } from '../generated/models/BatchListDto.d.ts';
export type TraceDirection = `${TraceBatchGraphDto.direction}`;
export type TraceGraph = TraceGraphDto;
export type TraceNode = TraceGraphNodeDto;
export interface BatchRelatedDocs {
    workOrders: Array<{
        id: string;
        orderNo: string;
        materialName?: string;
        status?: string;
    }>;
    stockTransactions: Array<{
        id: string;
        type: string;
        qty: number;
        batchNo?: string;
        createdAt: string;
        material?: {
            unit?: string;
        };
    }>;
    inspections: Array<{
        id: string;
        inspectionNo: string;
        type?: string;
        result?: string;
        createdAt: string;
    }>;
}
export declare const batchService: {
    create: (dto: CreateBatchDto) => Promise<MaterialBatch>;
    update: (dto: UpdateBatchDto) => Promise<MaterialBatch>;
    changeStatus: (dto: ChangeBatchStatusDto) => Promise<MaterialBatch>;
    relatedDocs: (batchId: string) => Promise<BatchRelatedDocs>;
    findByBatchNo: (batchNo: string) => Promise<TraceBatchLookup>;
    traceForward: (batchId: string, maxDepth?: number) => Promise<TraceResultDto>;
    traceBackward: (batchId: string, maxDepth?: number) => Promise<TraceResultDto>;
    traceGraph: (batchId: string, direction: TraceDirection, maxDepth?: number) => Promise<TraceGraph>;
    list(params?: BatchListDto): Promise<import("./_base.d.ts").PaginatedList<MaterialBatch>>;
    detail(id: string): Promise<MaterialBatch>;
};

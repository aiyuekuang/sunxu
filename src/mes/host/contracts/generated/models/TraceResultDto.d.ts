import type { TraceNodeDto } from './TraceNodeDto.d.ts';
export type TraceResultDto = {
    batchId: string;
    batchNo: string;
    children: Array<TraceNodeDto>;
    materialId: string;
    materialName?: string;
    materialUnit?: string;
    qty: number;
};

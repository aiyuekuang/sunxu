import type { TraceGraphEdgeDto } from './TraceGraphEdgeDto.d.ts';
import type { TraceGraphNodeDto } from './TraceGraphNodeDto.d.ts';
import type { TraceGraphSummaryDto } from './TraceGraphSummaryDto.d.ts';
import type { TraceWarningDto } from './TraceWarningDto.d.ts';
export type TraceGraphDto = {
    edges: Array<TraceGraphEdgeDto>;
    nodes: Array<TraceGraphNodeDto>;
    root: TraceGraphNodeDto;
    summary: TraceGraphSummaryDto;
    warnings: Array<TraceWarningDto>;
};

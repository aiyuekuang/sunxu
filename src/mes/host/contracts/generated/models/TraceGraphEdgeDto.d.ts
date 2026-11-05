export type TraceGraphEdgeDto = {
    from: string;
    id: string;
    label?: string;
    qty?: number;
    source: TraceGraphEdgeDto.source;
    sourceRefId?: string;
    sourceRefType?: string;
    to: string;
    type: string;
    unit?: string;
};
export declare namespace TraceGraphEdgeDto {
    enum source {
        RECORDED = "recorded",
        DERIVED = "derived",
        HISTORICAL = "historical"
    }
}

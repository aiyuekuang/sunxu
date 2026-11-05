/** 批号来源：current=本工单已出现的批号，inherited=来源工单带入（返工/补加/拆分等） */
export type ReportBatchOptionSource = 'current' | 'inherited';
/** 产出物料追溯方式（随契约回传，端侧不做模式判断） */
export type ReportBatchTraceabilityMode = 'quantity' | 'batch' | 'serial';
export interface ReportBatchOption {
    /** 生产批号 */
    batchNo: string;
    source: ReportBatchOptionSource;
    /** 来源工单号（source=inherited 时返回，用于现场核对） */
    sourceWorkOrderNo?: string | null;
    /** 最近一次报工时间（ISO 字符串） */
    lastReportedAt?: string | null;
    /** 该批号累计良品报工量 */
    reportedQty: number;
    /** 是否已产生末道产出 */
    hasOutput: boolean;
}
export interface ReportBatchOptions {
    traceabilityMode: ReportBatchTraceabilityMode;
    /** 是否要求报工归属生产批号（按批号或单件序列号追溯时为 true） */
    batchRequired: boolean;
    /** 新建生产批号时的建议批号（不要求按批时可空） */
    suggestedBatchNo?: string | null;
    options: ReportBatchOption[];
}
export declare const reportBatchOptionService: {
    /** 报工可选生产批号：候选、默认值与建议号全部以后端返回为准 */
    optionsForWorkOrder(workOrderId: string): Promise<ReportBatchOptions>;
};

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ScanOperationPredecessorDependencyDto } from './ScanOperationPredecessorDependencyDto';
import type { ScanOperationToolingSessionDto } from './ScanOperationToolingSessionDto';
export type ScanOperationInfoDto = {
    canReport: boolean;
    completedQty: number;
    dependencySummary?: string | null;
    effectiveQty: number;
    id: string;
    inputQty?: number | null;
    /**
     * 是否委外工序；委外工序必须通过委外单发料、收货和检验闭环
     */
    isOutsourced: boolean;
    maxReportQty: number;
    operationName: string;
    plannedQty?: number | null;
    predecessorDependencies?: Array<ScanOperationPredecessorDependencyDto>;
    predecessorOperationIds?: Array<string>;
    progress: number;
    qualityBlockReason?: string | null;
    /**
     * 工序准备状态：ready/blocked_by_dependency/blocked_by_quality/blocked
     */
    readyState?: string | null;
    remainingQty: number;
    reportBlockReason?: string | null;
    reportedQty: number;
    runningToolingSessions?: Array<ScanOperationToolingSessionDto>;
    scrappedQty: number;
    sequence: number;
    stageName?: string | null;
    stageNo?: number | null;
    status: string;
    transferBatchQty?: number | null;
};

export type BusinessBatchPreviewItemDto = {
    blockingReasons: Array<string>;
    documentNo?: string;
    eligible: boolean;
    id: string;
    impact?: Record<string, any>;
    status: string;
    warnings: Array<string>;
};

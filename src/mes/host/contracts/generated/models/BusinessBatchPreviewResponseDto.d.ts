import type { BusinessBatchPreviewItemDto } from './BusinessBatchPreviewItemDto.d.ts';
export type BusinessBatchPreviewResponseDto = {
    blocked: number;
    eligible: number;
    expiresAt: string;
    items: Array<BusinessBatchPreviewItemDto>;
    previewToken: string;
    summary: Record<string, any>;
    total: number;
};

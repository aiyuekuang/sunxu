/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BusinessBatchPreviewItemDto } from './BusinessBatchPreviewItemDto';
export type BusinessBatchPreviewResponseDto = {
    blocked: number;
    eligible: number;
    expiresAt: string;
    items: Array<BusinessBatchPreviewItemDto>;
    previewToken: string;
    summary: Record<string, any>;
    total: number;
};

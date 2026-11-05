import type { PieceworkSummaryResponseDto } from '../generated/models/PieceworkSummaryResponseDto.d.ts';
import type { PieceworkDetailResponseDto } from '../generated/models/PieceworkDetailResponseDto.d.ts';
export type { PieceworkSummaryItemDto as PieceworkSummaryItem } from '../generated/models/PieceworkSummaryItemDto.d.ts';
export type { PieceworkDetailItemDto as PieceworkDetailItem } from '../generated/models/PieceworkDetailItemDto.d.ts';
export type { PieceworkGlobalSummaryDto as PieceworkSummary } from '../generated/models/PieceworkGlobalSummaryDto.d.ts';
export declare const pieceworkService: {
    getSummary(dto: {
        startDate: string;
        endDate: string;
        assigneeId?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PieceworkSummaryResponseDto>;
    getDetail(dto: {
        assigneeId: string;
        startDate: string;
        endDate: string;
        page?: number;
        pageSize?: number;
    }): Promise<PieceworkDetailResponseDto>;
};

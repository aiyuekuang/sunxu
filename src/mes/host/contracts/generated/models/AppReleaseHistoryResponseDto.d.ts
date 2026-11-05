import type { AppReleaseHistoryItemDto } from './AppReleaseHistoryItemDto.d.ts';
export type AppReleaseHistoryResponseDto = {
    items: Array<AppReleaseHistoryItemDto>;
    /**
     * 当前页码
     */
    page: number;
    /**
     * 当前页条数
     */
    pageSize: number;
    /**
     * 符合条件的版本总数
     */
    total: number;
};

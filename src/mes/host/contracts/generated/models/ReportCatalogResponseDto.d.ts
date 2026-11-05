import type { ReportCatalogItemDto } from './ReportCatalogItemDto.d.ts';
export type ReportCatalogResponseDto = {
    /**
     * 当前用户可见且已收藏的报表编码
     */
    favoriteReportCodes: Array<string>;
    items: Array<ReportCatalogItemDto>;
};

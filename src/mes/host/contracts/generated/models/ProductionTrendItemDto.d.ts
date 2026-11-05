import type { ReportQuantityUnitValueDto } from './ReportQuantityUnitValueDto.d.ts';
export type ProductionTrendItemDto = {
    count: number;
    label: string;
    /**
     * 仅单一计量单位时返回；多单位时为 null
     */
    qty: number | null;
    /**
     * 按计量单位拆分的产量
     */
    unitBreakdown: Array<ReportQuantityUnitValueDto>;
};

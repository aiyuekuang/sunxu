import type { OeeByEquipmentItemDto } from './OeeByEquipmentItemDto.d.ts';
import type { OeeOverallDto } from './OeeOverallDto.d.ts';
import type { OeeTrendPointDto } from './OeeTrendPointDto.d.ts';
export type OeeDashboardResponseDto = {
    byEquipment: Array<OeeByEquipmentItemDto>;
    overall: OeeOverallDto;
    /**
     * 整体OEE趋势
     */
    trend: Array<OeeTrendPointDto>;
};

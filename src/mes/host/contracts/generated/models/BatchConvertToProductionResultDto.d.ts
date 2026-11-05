import type { BatchConvertToProductionResultItemDto } from './BatchConvertToProductionResultItemDto.d.ts';
import type { SaleOrderProductionPreparationDto } from './SaleOrderProductionPreparationDto.d.ts';
export type BatchConvertToProductionResultDto = {
    plans: Array<BatchConvertToProductionResultItemDto>;
    /**
     * 生产准备摘要
     */
    productionPreparation?: SaleOrderProductionPreparationDto;
    /**
     * 批量转生产配置提醒
     */
    warnings?: Array<string>;
};

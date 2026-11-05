import type { SaleOrderConvertInfoItemDto } from './SaleOrderConvertInfoItemDto.d.ts';
import type { SaleOrderProductionPreparationDto } from './SaleOrderProductionPreparationDto.d.ts';
export type SaleOrderConvertInfoResponseDto = {
    items: Array<SaleOrderConvertInfoItemDto>;
    /**
     * 生产准备摘要
     */
    productionPreparation: SaleOrderProductionPreparationDto;
};

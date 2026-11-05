import type { SaleReturnRefundableLineDto } from './SaleReturnRefundableLineDto.d.ts';
export type SaleReturnRefundableLinesResponseDto = {
    lines: Array<SaleReturnRefundableLineDto>;
    sourceDeliveryId: string;
};

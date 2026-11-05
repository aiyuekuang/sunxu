import type { SaleDeliveryDetailDto } from './SaleDeliveryDetailDto.d.ts';
import type { SaleDeliveryShipOutcome } from './SaleDeliveryShipOutcome.d.ts';
export type ShipSaleDeliveryResponseDto = {
    delivery: SaleDeliveryDetailDto;
    /**
     * 面向操作人的结果说明
     */
    message: string;
    /**
     * 本次销售订单出库动作的真实结果
     */
    outcome: SaleDeliveryShipOutcome;
};

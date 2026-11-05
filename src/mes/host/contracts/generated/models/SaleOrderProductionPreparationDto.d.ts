import type { SaleOrderProductionPreparationBomDto } from './SaleOrderProductionPreparationBomDto.d.ts';
import type { SaleOrderProductionPreparationDrawingDto } from './SaleOrderProductionPreparationDrawingDto.d.ts';
import type { SaleOrderProductionPreparationRouteDto } from './SaleOrderProductionPreparationRouteDto.d.ts';
import type { SaleOrderProductionPreparationTodoDto } from './SaleOrderProductionPreparationTodoDto.d.ts';
export type SaleOrderProductionPreparationDto = {
    /**
     * 阻断项
     */
    blockers: Array<string>;
    /**
     * BOM 摘要
     */
    bom: SaleOrderProductionPreparationBomDto;
    /**
     * 放行结论：ready=可转生产，warning=可转但有提醒，blocking=存在真实阻断
     */
    conclusion: string;
    /**
     * 图纸摘要
     */
    drawing: SaleOrderProductionPreparationDrawingDto;
    /**
     * 工艺路线摘要
     */
    route: SaleOrderProductionPreparationRouteDto;
    /**
     * 销售订单ID
     */
    saleOrderId: string;
    /**
     * 协同待办摘要
     */
    todo: SaleOrderProductionPreparationTodoDto;
    /**
     * 提醒项
     */
    warnings: Array<string>;
};

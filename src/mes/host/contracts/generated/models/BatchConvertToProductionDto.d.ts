import type { ConvertItemDto } from './ConvertItemDto.d.ts';
export type BatchConvertToProductionDto = {
    /**
     * 转生产后是否直接生成工单：true 时转出的每个生产计划立即确认并自动建单（销售订单一步到工单）；缺省 false 时只生成生产计划草稿，工单由生产计划页确认/下达再产出。
     */
    autoCreateWorkOrder?: boolean;
    /**
     * 备注
     */
    description?: string;
    /**
     * 转生产的明细行列表
     */
    items: Array<ConvertItemDto>;
    /**
     * 计划完成日期 YYYY-MM-DD；不填则由排程自动计算
     */
    planEndDate?: string;
    /**
     * 计划开始日期 YYYY-MM-DD；不填则由排程自动计算
     */
    planStartDate?: string;
    /**
     * 优先级 1-10
     */
    priority?: number;
    /**
     * 销售订单ID
     */
    saleOrderId: string;
};

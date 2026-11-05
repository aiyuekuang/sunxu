import type { InspectionStatus } from './InspectionStatus.d.ts';
import type { PurchaseOrderIncomingInspectionStatusCountDto } from './PurchaseOrderIncomingInspectionStatusCountDto.d.ts';
export type PurchaseOrderIncomingInspectionDto = {
    /**
     * 该采购订单行关联的有效来料检验单数量
     */
    inspectionCount: number;
    /**
     * 仅关联一张有效来料检验单时返回其ID，可直达检验详情
     */
    inspectionId?: string | null;
    /**
     * 关联有效来料检验单按状态汇总；每张检验单仅计一次
     */
    inspectionStatusCounts: Array<PurchaseOrderIncomingInspectionStatusCountDto>;
    /**
     * 当前最需要关注的来料检验状态；应检但尚未生成来料检验单时为空
     */
    status?: InspectionStatus | null;
    /**
     * 需要报检但尚无有效来料检验单的来源采购入库行数量；按到货批次统计，不代表采购订单履约状态
     */
    unreportedReceiptCount: number;
};

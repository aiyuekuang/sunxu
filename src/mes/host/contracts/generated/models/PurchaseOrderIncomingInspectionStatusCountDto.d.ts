import type { InspectionStatus } from './InspectionStatus.d.ts';
export type PurchaseOrderIncomingInspectionStatusCountDto = {
    /**
     * 该状态下的有效来料检验单数量
     */
    count: number;
    /**
     * 来料检验状态
     */
    status: InspectionStatus;
};

export type ChildOrderSummaryDto = {
    completedQty: number;
    createdAt: string;
    id: string;
    materialCode?: string;
    materialName?: string;
    orderNo: string;
    plannedQty: number;
    scrappedQty: number;
    status: string;
    /**
     * 用于前端展示的状态键（含派生态，如待下达）
     */
    statusDisplay: string;
    workOrderType: string;
};

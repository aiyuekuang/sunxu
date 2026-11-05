/** 工单摘要（来自生产计划 detail 接口的关联工单） */
export interface WorkOrderSummary {
    id: string;
    orderNo: string;
    status: string;
    plannedQty: number;
    completedQty: number;
    scrappedQty?: number;
    overallProgress: number;
    material?: {
        id: string;
        name: string;
        unit: string;
    };
    assignee?: {
        id: string;
        username: string;
        realName: string | null;
    } | null;
}
export interface PlanWithWorkOrders {
    id: string;
    planNo: string;
    status: string;
    requiredQty: number;
    completedQty: number;
    dueDate?: string | null;
    material?: {
        id: string;
        name: string;
        unit: string;
    };
    workOrders: WorkOrderSummary[];
}

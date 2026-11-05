export type SplitWorkOrderDto = {
    /**
     * 新工单负责人ID
     */
    assigneeId?: string;
    /**
     * 备注
     */
    description?: string;
    /**
     * 原工单ID
     */
    id: string;
    /**
     * 拆分数量（从原工单中拆出的数量）
     */
    splitQty: number;
};

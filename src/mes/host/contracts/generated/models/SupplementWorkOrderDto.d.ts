export type SupplementWorkOrderDto = {
    /**
     * 补产投产数量
     */
    deltaQty: number;
    /**
     * 原工单ID
     */
    id: string;
    /**
     * 补产原因
     */
    reason?: string;
};

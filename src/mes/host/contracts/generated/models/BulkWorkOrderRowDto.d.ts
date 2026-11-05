export type BulkWorkOrderRowDto = {
    /**
     * 产出物料档案编码
     */
    materialCode: string;
    /**
     * 计划结束日期 (YYYY-MM-DD)
     */
    planEndDate?: string;
    /**
     * 计划开始日期 (YYYY-MM-DD)
     */
    planStartDate?: string;
    /**
     * 计划数量
     */
    plannedQty: number;
    /**
     * 优先级（代码 1-10 或中文：最低/低/中/高/最高）
     */
    priority?: string;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 工单状态（代码 draft/released 或中文：草稿/已下达；默认草稿）
     */
    status?: string;
    /**
     * 工单类型（代码 normal/rework/split/supplement 或中文：标准/返工/拆分/补加；默认标准）
     */
    type?: string;
};

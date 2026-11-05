export type UpdateWorkCenterDto = {
    /**
     * 产能单位
     */
    capacityUnit?: string;
    code?: string;
    departmentId?: string;
    description?: string;
    id: string;
    /**
     * 供料策略
     */
    issueMode?: UpdateWorkCenterDto.issueMode;
    /**
     * 线边仓ID
     */
    lineSideWarehouseId?: string | null;
    /**
     * 最大并行任务数
     */
    maxConcurrency?: number;
    name?: string;
    parentId?: string;
    /**
     * 工作中心类型（字典：work_center_type）
     */
    type?: string;
};
export declare namespace UpdateWorkCenterDto {
    /**
     * 供料策略
     */
    enum issueMode {
        DIRECT = "direct",
        STAGED = "staged"
    }
}

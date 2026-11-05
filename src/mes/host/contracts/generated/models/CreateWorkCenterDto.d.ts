export type CreateWorkCenterDto = {
    /**
     * 产能单位
     */
    capacityUnit?: string;
    code?: string;
    departmentId?: string;
    description?: string;
    /**
     * 供料策略
     */
    issueMode?: CreateWorkCenterDto.issueMode;
    /**
     * 线边仓ID
     */
    lineSideWarehouseId?: string | null;
    /**
     * 最大并行任务数
     */
    maxConcurrency?: number;
    name: string;
    parentId?: string;
    /**
     * 工作中心类型（字典：work_center_type）
     */
    type?: string;
};
export declare namespace CreateWorkCenterDto {
    /**
     * 供料策略
     */
    enum issueMode {
        DIRECT = "direct",
        STAGED = "staged"
    }
}

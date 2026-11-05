export type WorkCenterTreeNodeDto = {
    /**
     * 子节点
     */
    children: Array<WorkCenterTreeNodeDto>;
    /**
     * 编码
     */
    code: string;
    /**
     * 部门ID
     */
    departmentId?: string | null;
    /**
     * ID
     */
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    /**
     * 供料策略
     */
    issueMode: WorkCenterTreeNodeDto.issueMode;
    /**
     * 线边仓ID
     */
    lineSideWarehouseId?: string | null;
    /**
     * 名称
     */
    name: string;
    /**
     * 上级ID
     */
    parentId?: string | null;
    /**
     * 显示排序，越小越靠前
     */
    sortOrder: number;
    /**
     * 类型
     */
    type?: string | null;
};
export declare namespace WorkCenterTreeNodeDto {
    /**
     * 供料策略
     */
    enum issueMode {
        DIRECT = "direct",
        STAGED = "staged"
    }
}

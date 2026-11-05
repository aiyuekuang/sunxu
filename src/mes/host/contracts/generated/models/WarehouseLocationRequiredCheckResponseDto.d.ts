export type WarehouseLocationRequiredCheckResponseDto = {
    /**
     * 阻断原因
     */
    blockers: Array<string>;
    /**
     * 是否允许切换为严格仓位模式
     */
    canEnableRequired: boolean;
    /**
     * 仓库ID
     */
    warehouseId: string;
    /**
     * 非阻断提示
     */
    warnings: Array<string>;
};

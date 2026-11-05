import type { WarehouseType } from './WarehouseType.d.ts';
export type UpdateWarehouseDto = {
    allowNegative?: boolean;
    id: string;
    location?: string;
    /**
     * 仓位管控模式；required 需先通过启用检查
     */
    locationControlMode?: UpdateWarehouseDto.locationControlMode;
    managerId?: string;
    name?: string;
    /**
     * 显示排序，越小越靠前
     */
    sortOrder?: number;
    /**
     * 仓库类型（系统枚举）
     */
    type?: WarehouseType;
};
export declare namespace UpdateWarehouseDto {
    /**
     * 仓位管控模式；required 需先通过启用检查
     */
    enum locationControlMode {
        NONE = "none",
        OPTIONAL = "optional",
        REQUIRED = "required"
    }
}

import type { WarehouseType } from './WarehouseType.d.ts';
export type CreateWarehouseDto = {
    allowNegative?: boolean;
    code?: string;
    location?: string;
    /**
     * 仓位管控模式；默认 none，维护仓位不等于启用仓位管控
     */
    locationControlMode?: CreateWarehouseDto.locationControlMode;
    managerId?: string;
    name: string;
    /**
     * 显示排序，越小越靠前
     */
    sortOrder?: number;
    /**
     * 仓库类型（系统枚举）
     */
    type?: WarehouseType;
};
export declare namespace CreateWarehouseDto {
    /**
     * 仓位管控模式；默认 none，维护仓位不等于启用仓位管控
     */
    enum locationControlMode {
        NONE = "none",
        OPTIONAL = "optional",
        REQUIRED = "required"
    }
}

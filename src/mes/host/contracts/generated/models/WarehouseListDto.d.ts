import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
import type { WarehouseType } from './WarehouseType.d.ts';
import type { WarehouseTypeFamily } from './WarehouseTypeFamily.d.ts';
export type WarehouseListDto = {
    /**
     * 仓库编码（模糊搜索）
     */
    code?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 仓位管控模式
     */
    locationControlMode?: WarehouseListDto.locationControlMode;
    /**
     * 仓库名称（模糊搜索）
     */
    name?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: WarehouseListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 仓库类型（系统枚举）
     */
    type?: WarehouseType;
    /**
     * 仓库类型族（按别名归一后的系统类型族筛选）
     */
    typeFamily?: WarehouseTypeFamily;
};
export declare namespace WarehouseListDto {
    /**
     * 仓位管控模式
     */
    enum locationControlMode {
        NONE = "none",
        OPTIONAL = "optional",
        REQUIRED = "required"
    }
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
}

import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type EquipmentListDto = {
    /**
     * 设备编号（模糊搜索）
     */
    code?: string;
    /**
     * 设备类型
     */
    equipmentType?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 筛选指定工作中心及其下级工作中心的设备；仅在传入 workCenterId 时生效
     */
    includeChildWorkCenters?: boolean;
    /**
     * 搜索关键词
     */
    keyword?: string;
    manufacturer?: string;
    model?: string;
    /**
     * 设备名称（模糊搜索）
     */
    name?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: EquipmentListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    status?: EquipmentListDto.status;
    statuses?: Array<'active' | 'occupied' | 'maintenance' | 'repair' | 'retired'>;
    workCenterId?: string;
};
export declare namespace EquipmentListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    enum status {
        ACTIVE = "active",
        OCCUPIED = "occupied",
        MAINTENANCE = "maintenance",
        REPAIR = "repair",
        RETIRED = "retired"
    }
}

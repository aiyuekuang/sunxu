import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type StockListDto = {
    /**
     * 客户ID；传入后等同于 ownerType=customer + ownerRefId=客户ID
     */
    customerId?: string;
    /**
     * 库存更新时间结束；按库存余额的最新更新时间筛选，支持 YYYY-MM-DD 或 ISO 时间
     */
    endDate?: string;
    /**
     * 是否按仓位展开库存明细
     */
    expandByLocation?: boolean;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 是否查看全部货主库存；true 时不按货主过滤，不传仍默认查看公司自有库存
     */
    includeAllOwners?: boolean;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 仓位ID；为空时默认按仓库汇总
     */
    locationId?: string;
    /**
     * 仓位编码/名称/路径关键词
     */
    locationKeyword?: string;
    /**
     * 仅返回低库存物料
     */
    lowStock?: boolean;
    materialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: StockListDto.orderDir;
    /**
     * 货主ID；公司库存默认为 companyId
     */
    ownerRefId?: string;
    /**
     * 库存货主类型；不传默认查看公司自有库存
     */
    ownerType?: StockListDto.ownerType;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 库存更新时间开始；按库存余额的最新更新时间筛选，支持 YYYY-MM-DD 或 ISO 时间
     */
    startDate?: string;
    warehouseId?: string;
};
export declare namespace StockListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 库存货主类型；不传默认查看公司自有库存
     */
    enum ownerType {
        COMPANY = "company",
        CUSTOMER = "customer",
        SUPPLIER = "supplier"
    }
}

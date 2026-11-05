import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type BatchListDto = {
    /**
     * 批号（模糊搜索）
     */
    batchNo?: string;
    /**
     * 客户ID；传入后等同于 ownerType=customer + ownerRefId=客户ID
     */
    customerId?: string;
    /**
     * 结束日期
     */
    endDate?: string;
    /**
     * 仅返回未过期批号；供出库批号选择使用
     */
    excludeExpired?: boolean;
    /**
     * 有效期结束日期
     */
    expiryEndDate?: string;
    /**
     * 有效期开始日期
     */
    expiryStartDate?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 批号品质等级（material_grade 字典值）
     */
    grade?: string;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 物料系统分类
     */
    materialBaseType?: BatchListDto.materialBaseType;
    /**
     * 物料业务分类ID
     */
    materialCategoryId?: string;
    /**
     * 物料档案ID
     */
    materialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: BatchListDto.orderDir;
    /**
     * 货主ID；公司批号默认为 companyId
     */
    ownerRefId?: string;
    /**
     * 批号货主类型；不传默认查看公司自有批号
     */
    ownerType?: BatchListDto.ownerType;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 批号来源类型，如 purchase_receipt / work_order
     */
    sourceDocType?: BatchListDto.sourceDocType;
    /**
     * 开始日期
     */
    startDate?: string;
    status?: BatchListDto.status;
    /**
     * 供应商原始批号（模糊搜索）
     */
    supplierBatchNo?: string;
    /**
     * 供应商ID
     */
    supplierId?: string;
    /**
     * 来源价目行ID
     */
    supplierPriceTierId?: string;
    warehouseId?: string;
};
export declare namespace BatchListDto {
    /**
     * 物料系统分类
     */
    enum materialBaseType {
        RAW = "raw",
        SEMI = "semi",
        FINISHED = "finished"
    }
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 批号货主类型；不传默认查看公司自有批号
     */
    enum ownerType {
        COMPANY = "company",
        CUSTOMER = "customer",
        SUPPLIER = "supplier"
    }
    /**
     * 批号来源类型，如 purchase_receipt / work_order
     */
    enum sourceDocType {
        MANUAL = "manual",
        PURCHASE_RECEIPT = "purchase_receipt",
        WORK_ORDER = "work_order",
        STOCK_ADJUST = "stock_adjust",
        STOCK_TRANSFER = "stock_transfer",
        STOCK_RETURN = "stock_return",
        SALE_RETURN = "sale_return",
        STOCK_CONVERSION = "stock_conversion",
        OUTSOURCING_ORDER = "outsourcing_order"
    }
    enum status {
        AVAILABLE = "available",
        QUARANTINE = "quarantine",
        EXPIRED = "expired",
        CONSUMED = "consumed"
    }
}

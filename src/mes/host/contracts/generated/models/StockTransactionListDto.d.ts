import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type StockTransactionListDto = {
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 库存业务日期结束；仅筛选已记录实际业务日期的流水
     */
    businessDateEnd?: string;
    /**
     * 库存业务日期开始；仅筛选已记录实际业务日期的流水
     */
    businessDateStart?: string;
    /**
     * 客户ID（业务往来方筛选，如销售出库客户）
     */
    customerId?: string;
    /**
     * 结束时间；按库存流水创建时间筛选，支持 YYYY-MM-DD 或 ISO 时间
     */
    endDate?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 物料等级（来源快照）
     */
    grade?: string;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 仓位ID
     */
    locationId?: string;
    /**
     * 仓位编码/名称/路径关键词
     */
    locationKeyword?: string;
    materialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: StockTransactionListDto.orderDir;
    /**
     * 货主ID
     */
    ownerRefId?: string;
    /**
     * 流水货主类型
     */
    ownerType?: StockTransactionListDto.ownerType;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 关联单号（模糊搜索）
     */
    referenceNo?: string;
    /**
     * 开始时间；按库存流水创建时间筛选，支持 YYYY-MM-DD 或 ISO 时间
     */
    startDate?: string;
    /**
     * 供应商ID（来源快照）
     */
    supplierId?: string;
    /**
     * 供应商价目来源ID（来源快照）
     */
    supplierPriceTierId?: string;
    /**
     * 流水号（模糊搜索）
     */
    transactionNo?: string;
    /**
     * 流水类型
     */
    type?: string;
    /**
     * 流水类型列表；用于按一组库存动作筛选
     */
    types?: Array<'in_purchase' | 'in_production' | 'in_customer_supplied' | 'in_owner_transfer' | 'in_transfer' | 'in_adjust' | 'in_return' | 'in_sale_return' | 'in_customer_disposition_reversal' | 'in_sale_reversal' | 'in_purchase_return_reversal' | 'in_production_reversal' | 'in_other' | 'in_conversion' | 'in_conversion_reversal' | 'in_outsourcing' | 'out_production' | 'out_sale' | 'out_customer_return' | 'out_sale_return_reversal' | 'out_owner_transfer' | 'out_transfer' | 'out_adjust' | 'out_scrap' | 'out_purchase_return' | 'out_other' | 'out_conversion' | 'out_conversion_reversal' | 'out_outsourcing' | 'out_outsourcing_return' | 'out_internal_issue'>;
    warehouseId?: string;
    /**
     * 关联工单ID
     */
    workOrderId?: string;
};
export declare namespace StockTransactionListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 流水货主类型
     */
    enum ownerType {
        COMPANY = "company",
        CUSTOMER = "customer",
        SUPPLIER = "supplier"
    }
}

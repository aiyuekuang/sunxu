import type { LowStockMaterialDto } from './LowStockMaterialDto.d.ts';
import type { LowStockWarehouseDto } from './LowStockWarehouseDto.d.ts';
export type StockWarningSummaryDto = {
    /**
     * 公司库存实际使用的安全库存预警线
     */
    companyAlertThreshold: number;
    /**
     * 公司货主可用库存
     */
    companyAvailableQty: number;
    /**
     * 公司库存是否触发低库存预警
     */
    companyLowStock: boolean;
    /**
     * 客户货主可用库存合计
     */
    customerAvailableQty: number;
    /**
     * 触发低库存预警的客户货主数量
     */
    customerLowStockCount: number;
    /**
     * 当前仓库中客户货主数量
     */
    customerOwnerCount: number;
    id: string;
    material: LowStockMaterialDto;
    materialId: string;
    /**
     * 公司与客户可用库存合计；仅用于盘点展示
     */
    totalAvailableQty: number;
    warehouse: LowStockWarehouseDto;
    warehouseId: string;
};

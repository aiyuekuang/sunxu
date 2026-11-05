import type { MaterialType } from './MaterialType.d.ts';
export type BulkMaterialRowDto = {
    /**
     * 条形码
     */
    barcode?: string;
    /**
     * 系统分类（raw/semi/finished）
     */
    baseType?: MaterialType;
    /**
     * 兼容字段：业务分类名称（历史字段 category）
     */
    category?: string;
    /**
     * 物料档案编码（留空自动生成）
     */
    code?: string;
    /**
     * 默认完工入库仓库编码
     */
    defaultProductionReceiptWarehouseCode?: string;
    /**
     * 默认完工入库仓库ID
     */
    defaultProductionReceiptWarehouseId?: string;
    /**
     * 默认完工入库仓库名称
     */
    defaultProductionReceiptWarehouseName?: string;
    /**
     * 默认仓库编码
     */
    defaultWarehouseCode?: string;
    /**
     * 默认仓库ID
     */
    defaultWarehouseId?: string;
    /**
     * 默认仓库名称
     */
    defaultWarehouseName?: string;
    /**
     * 描述
     */
    description?: string;
    /**
     * 所属既有物料系列编码；留空则创建独立物料档案
     */
    familyCode?: string;
    /**
     * 是否启用批次追踪
     */
    hasBatchTracking?: boolean;
    /**
     * 采购提前期（天）
     */
    leadTimeDays?: number;
    /**
     * 最小采购量
     */
    minOrderQty?: number;
    /**
     * 物料档案名称
     */
    name: string;
    /**
     * 采购类型
     */
    procurementType?: BulkMaterialRowDto.procurementType;
    /**
     * 投产数量取整方式：none 或 ceil_integer
     */
    productionQtyRoundingMode?: BulkMaterialRowDto.productionQtyRoundingMode;
    /**
     * 参考售价
     */
    referenceSalePrice?: number;
    /**
     * 备注（兼容列，写入描述）
     */
    remarks?: string;
    /**
     * 安全库存
     */
    safetyStock?: number;
    /**
     * 保质期（天）
     */
    shelfLifeDays?: number;
    /**
     * 规格型号
     */
    spec?: string;
    /**
     * 供应倍量；空或1表示不限制
     */
    supplyMultipleQty?: number | null;
    /**
     * 业务分类编码（历史字段 type）；必须先在物料分类维护
     */
    type: string;
    /**
     * 计量单位
     */
    unit: string;
    /**
     * 单位成本
     */
    unitCost?: number;
};
export declare namespace BulkMaterialRowDto {
    /**
     * 采购类型
     */
    enum procurementType {
        BUY = "buy",
        MAKE = "make",
        BOTH = "both",
        OUTSOURCE = "outsource"
    }
    /**
     * 投产数量取整方式：none 或 ceil_integer
     */
    enum productionQtyRoundingMode {
        NONE = "none",
        CEIL_INTEGER = "ceil_integer"
    }
}

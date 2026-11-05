import type { MaterialEffectiveDownstreamPolicyDto } from './MaterialEffectiveDownstreamPolicyDto.d.ts';
import type { MaterialFamilyBatchStrategy } from './MaterialFamilyBatchStrategy.d.ts';
import type { MaterialTraceabilityMode } from './MaterialTraceabilityMode.d.ts';
import type { MaterialType } from './MaterialType.d.ts';
import type { ProductionQtyRoundingMode } from './ProductionQtyRoundingMode.d.ts';
export type MaterialEffectiveProfileDto = {
    /**
     * 物料属性定义
     */
    attributeSchema?: Record<string, any>;
    baseType?: MaterialType | null;
    /**
     * 业务分类编码
     */
    categoryCode?: string | null;
    /**
     * 业务分类ID
     */
    categoryId?: string | null;
    /**
     * 业务分类名称
     */
    categoryName?: string | null;
    defaultBatchStrategy?: MaterialFamilyBatchStrategy | null;
    /**
     * 默认完工入库仓库ID
     */
    defaultProductionReceiptWarehouseId?: string | null;
    /**
     * 默认生产/BOM单位
     */
    defaultProductionUnit?: string | null;
    /**
     * 默认采购单位
     */
    defaultPurchaseUnit?: string | null;
    /**
     * 默认供应商ID
     */
    defaultSupplierId?: string | null;
    /**
     * 默认仓库ID
     */
    defaultWarehouseId?: string | null;
    downstreamPolicy: MaterialEffectiveDownstreamPolicyDto;
    /**
     * 系列编码
     */
    familyCode?: string | null;
    /**
     * 物料系列ID
     */
    familyId?: string | null;
    /**
     * 系列名称
     */
    familyName?: string | null;
    /**
     * 字段来源：template=系列继承，sku_override=型号覆盖，snapshot=兼容快照，manual=人工维护
     */
    fieldSources: Record<string, 'template' | 'sku_override' | 'snapshot' | 'manual'>;
    /**
     * 是否启用批次追踪
     */
    hasBatchTracking: boolean;
    /**
     * 采购提前期（天）
     */
    leadTimeDays?: number | null;
    /**
     * 制造提前期（分钟）
     */
    manufacturingLeadTimeMinutes?: number | null;
    /**
     * 物料档案编码
     */
    materialCode: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 物料档案名称
     */
    materialName: string;
    /**
     * 最小采购量
     */
    minOrderQty?: number | null;
    /**
     * 采购类型
     */
    procurementType: string;
    /**
     * 自制投产数量取整方式
     */
    productionQtyRoundingMode: ProductionQtyRoundingMode;
    /**
     * 安全库存
     */
    safetyStock?: number | null;
    /**
     * 保质期（天）
     */
    shelfLifeDays?: number | null;
    /**
     * 规格文本
     */
    specText?: string | null;
    /**
     * 供应倍量
     */
    supplyMultipleQty?: number | null;
    traceabilityMode: MaterialTraceabilityMode;
    /**
     * 库存基础单位
     */
    unit: string;
    /**
     * 配置缺失或后续补齐提示
     */
    warnings: Array<string>;
};

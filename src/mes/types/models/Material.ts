/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomItemPartType } from './BomItemPartType';
import type { MaterialCategory } from './MaterialCategory';
import type { MaterialConsumptionMode } from './MaterialConsumptionMode';
import type { MaterialTraceabilityMode } from './MaterialTraceabilityMode';
import type { MaterialType } from './MaterialType';
import type { ProcurementType } from './ProcurementType';
import type { ProductionQtyRoundingMode } from './ProductionQtyRoundingMode';
import type { Supplier } from './Supplier';
import type { User } from './User';
import type { Warehouse } from './Warehouse';
export type Material = {
    barcode?: string | null;
    /**
     * 系统基础类型（固定枚举，供规则引擎使用）
     */
    baseType?: MaterialType | null;
    /**
     * BOM 用量公式；可引用物料系统字段和物料自定义字段，结果为每父项单位用量
     */
    bomUsageFormula?: string | null;
    /**
     * 业务分类名称快照；有所属物料系列时由系列分类派生，正式分类来源为 categoryId
     */
    category?: string | null;
    /**
     * 物料分类ID
     */
    categoryId?: string | null;
    /**
     * 物料档案编码
     */
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 当前可用库存（实时聚合展示，非持久化字段；口径与库存抵扣/库存台账一致：现存-占用-冻结，仅公司自有货主，含全部仓库）
     */
    currentStockQty?: number | null;
    /**
     * 公式字段计算错误（运行时装配，非数据库列）
     */
    customComputedErrors?: Record<string, any>;
    /**
     * 公式字段计算结果（运行时装配，非数据库列）
     */
    customComputedValues?: Record<string, any>;
    /**
     * 自定义字段值（运行时装配，非数据库列；动态 key）
     */
    customValues?: Record<string, any>;
    /**
     * 新建 BOM 行的默认供料方式；为空时继承物料系列，再按采购类型兜底，仅影响新建 BOM 行
     */
    defaultBomPartType?: BomItemPartType | null;
    /**
     * 默认完工入库仓库
     */
    defaultProductionReceiptWarehouse?: Warehouse | null;
    /**
     * 默认完工入库仓库ID（生产产出默认目标）
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
    defaultSupplier?: Supplier | null;
    /**
     * 默认供应商快照；唯一业务来源为 MaterialSupplier.isDefault，同步维护
     */
    defaultSupplierId?: string | null;
    defaultWarehouse?: Warehouse | null;
    defaultWarehouseId?: string | null;
    description?: string | null;
    drawings?: Array<string> | null;
    family?: Record<string, any> | null;
    /**
     * 从所属物料模板继承的共性公式字段计算结果（只读，运行时装配）
     */
    familyCustomComputedValues?: Record<string, any>;
    /**
     * 从所属物料模板继承的共性自定义字段值（只读，运行时装配）
     */
    familyCustomValues?: Record<string, any>;
    /**
     * 所属物料系列ID（MaterialFamily）；历史兼容可空，新业务必填
     */
    familyId?: string | null;
    /**
     * 是否启用批号追踪
     */
    hasBatchTracking: boolean;
    id: string;
    isActive: boolean;
    leadTimeDays?: number | null;
    manufacturingLeadTimeMinutes?: number | null;
    materialCategory?: MaterialCategory | null;
    /**
     * 默认生产用料消耗方式；为空时继承公司设置，BOM 明细行可继续覆盖
     */
    materialConsumptionMode?: MaterialConsumptionMode | null;
    minOrderQty?: number | null;
    /**
     * 物料档案名称
     */
    name: string;
    /**
     * 物料主图原图 URL；取第一张图片图纸
     */
    primaryImageUrl?: string | null;
    procurementType: ProcurementType;
    /**
     * 自制投产数量取整方式；ceil_integer 表示不足一个整数时向上取整
     */
    productionQtyRoundingMode?: ProductionQtyRoundingMode;
    /**
     * 采购超收比例（%）；0 表示不允许超收，创建采购订单时冻结到订单明细
     */
    purchaseOverReceiptPercent: number;
    /**
     * 参考售价（默认销售单价）
     */
    referenceSalePrice?: number | null;
    safetyStock?: number | null;
    /**
     * 成品序列号前缀；为空时使用物料编码
     */
    serialNumberPrefix?: string | null;
    shelfLifeDays?: number | null;
    spec?: string | null;
    /**
     * 供应倍量；空或1表示不限制，MRP对自制物料在净需求后按该倍量向上取整
     */
    supplyMultipleQty?: number | null;
    /**
     * 物料主图缓存缩略图 URL；列表优先展示该字段
     */
    thumbnailUrl?: string | null;
    /**
     * 物料追踪粒度；serial 单件序列号追踪自动包含批号追踪
     */
    traceabilityMode: MaterialTraceabilityMode;
    /**
     * 业务分类兼容编码；有所属物料系列时由系列分类派生，新业务以 categoryId/baseType 为准
     */
    type: string;
    /**
     * 库存基础单位
     */
    unit: string;
    unitCost?: number | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

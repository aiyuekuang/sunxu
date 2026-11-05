import type { BomItemPartType } from './BomItemPartType.d.ts';
import type { MaterialType } from './MaterialType.d.ts';
export type CreateMaterialDto = {
    /**
     * 条形码/二维码
     */
    barcode?: string;
    /**
     * 系统分类；新业务由所属物料系列继承，兼容导入/历史快照
     */
    baseType?: MaterialType;
    /**
     * BOM 用量公式；可引用物料系统字段和物料自定义字段，结果为每父项单位用量
     */
    bomUsageFormula?: string | null;
    /**
     * 兼容字段：业务分类名称（历史字段 category）
     */
    category?: string;
    /**
     * 业务分类ID；新业务由所属物料系列继承，不作为型号独立事实
     */
    categoryId?: string | null;
    /**
     * 物料档案编码（留空自动生成）
     */
    code?: string;
    /**
     * 前端当前物料自定义字段 schema 版本；提交 customValues 时必填，用于阻止过期表单覆盖
     */
    customFieldSchemaVersion?: number;
    /**
     * 物料自定义字段值（key=字段 key）；不传表示本次不修改自定义字段，传则按 key 合并保存
     */
    customValues?: Record<string, any>;
    /**
     * 默认 BOM 供料方式；为空时继承物料系列或按采购类型带出，仅影响新建 BOM 行
     */
    defaultBomPartType?: BomItemPartType | null;
    /**
     * 默认完工入库仓库ID
     */
    defaultProductionReceiptWarehouseId?: string | null;
    /**
     * 默认仓库ID
     */
    defaultWarehouseId?: string | null;
    /**
     * 备注
     */
    description?: string;
    /**
     * 所属物料系列ID（MaterialFamily）；可选，不挂系列时需自行选择物料分类与单位
     */
    familyId?: string;
    /**
     * 是否启用批次追踪
     */
    hasBatchTracking?: boolean;
    /**
     * 采购提前期（天）
     */
    leadTimeDays?: number;
    /**
     * 默认生产用料消耗方式；不传或传 null 表示继承公司设置，BOM 明细可覆盖
     */
    materialConsumptionMode?: CreateMaterialDto.materialConsumptionMode | null;
    /**
     * 最小采购量
     */
    minOrderQty?: number;
    /**
     * 物料档案名称
     */
    name: string;
    /**
     * 采购类型：buy=外购, make=自制, both=自制+外购, outsource=委外
     */
    procurementType?: CreateMaterialDto.procurementType;
    /**
     * 自制投产数量取整方式；ceil_integer 表示对投产数量向上取整到整数，需求数量不变
     */
    productionQtyRoundingMode?: CreateMaterialDto.productionQtyRoundingMode;
    /**
     * 采购超收比例（%）；0 表示不允许超收，创建采购订单时冻结到订单明细
     */
    purchaseOverReceiptPercent?: number;
    /**
     * 参考售价（默认销售单价）
     */
    referenceSalePrice?: number | null;
    /**
     * 安全库存
     */
    safetyStock?: number;
    /**
     * 成品序列号前缀；为空时使用物料编码
     */
    serialNumberPrefix?: string | null;
    /**
     * 保质期（天）
     */
    shelfLifeDays?: number;
    /**
     * 规格型号
     */
    spec?: string;
    /**
     * 供应倍量；空或1表示不限制，MRP对自制物料在净需求后按该倍量向上取整
     */
    supplyMultipleQty?: number | null;
    /**
     * 物料追踪粒度；序列号追踪自动包含批号追踪
     */
    traceabilityMode?: CreateMaterialDto.traceabilityMode;
    /**
     * 兼容字段：业务分类编码（历史字段 type）
     */
    type?: string;
    /**
     * 库存基础单位（字典：material_unit）；有物料默认单位时可不传
     */
    unit?: string;
    /**
     * 单位成本
     */
    unitCost?: number;
};
export declare namespace CreateMaterialDto {
    /**
     * 默认生产用料消耗方式；不传或传 null 表示继承公司设置，BOM 明细可覆盖
     */
    enum materialConsumptionMode {
        MANUAL_ISSUE = "manual_issue",
        BACKFLUSH_ON_REPORT = "backflush_on_report"
    }
    /**
     * 采购类型：buy=外购, make=自制, both=自制+外购, outsource=委外
     */
    enum procurementType {
        BUY = "buy",
        MAKE = "make",
        BOTH = "both",
        OUTSOURCE = "outsource"
    }
    /**
     * 自制投产数量取整方式；ceil_integer 表示对投产数量向上取整到整数，需求数量不变
     */
    enum productionQtyRoundingMode {
        NONE = "none",
        CEIL_INTEGER = "ceil_integer"
    }
    /**
     * 物料追踪粒度；序列号追踪自动包含批号追踪
     */
    enum traceabilityMode {
        QUANTITY = "quantity",
        BATCH = "batch",
        SERIAL = "serial"
    }
}

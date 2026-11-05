import type { BomItemIssueOperationBindingDto } from './BomItemIssueOperationBindingDto.d.ts';
import type { BomItemSubstituteDto } from './BomItemSubstituteDto.d.ts';
import type { MaterialConsumptionMode } from './MaterialConsumptionMode.d.ts';
export type BomItemDto = {
    /**
     * 适用条件表达式；P0 支持物料档案白名单/排除名单，其他条件透传
     */
    applicabilityRule?: Record<string, any>;
    /**
     * 装配分组
     */
    assemblyGroup?: string;
    /**
     * 多基准聚合方式
     */
    baseAggregation?: BomItemDto.baseAggregation;
    /**
     * 指定计算基准 BOM 行 ID，可多选
     */
    baseBomItemIds?: Array<string>;
    /**
     * 计算基准指标
     */
    baseMetric?: BomItemDto.baseMetric;
    /**
     * 计算基准范围
     */
    baseScope?: BomItemDto.baseScope;
    /**
     * 受控公式扩展参数
     */
    calculationParams?: Record<string, any>;
    /**
     * 覆盖率；1 表示 100%
     */
    coverageRatio?: number;
    /**
     * 前端当前 BOM 明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * BOM 明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 客户零件编码/图号
     */
    customerPartCode?: string;
    /**
     * 客户零件名称
     */
    customerPartName?: string;
    /**
     * 图纸附件 URL
     */
    drawingUrls?: Array<string>;
    /**
     * 外部行号/序号
     */
    externalLineNo?: string;
    /**
     * 受控公式模板编码
     */
    formulaCode?: BomItemDto.formulaCode;
    /**
     * 受控公式模板版本
     */
    formulaVersion?: number;
    /**
     * BOM 行 ID；更新或前端临时行 UUID 用于重映射基准行
     */
    id?: string;
    /**
     * 图片 URL
     */
    imageUrls?: Array<string>;
    /**
     * 按工艺路线维护的投料工序映射；同一 BOM 行可配置多条路线
     */
    issueOperationBindings?: Array<BomItemIssueOperationBindingDto>;
    /**
     * 投料工序 ID
     */
    issueOperationId?: string;
    /**
     * 是否生成工单物料需求
     */
    issueRequirementMode?: BomItemDto.issueRequirementMode;
    /**
     * BOM 行被执行单据(销售订单/工单/生产计划等)实例化时允许调整的能力模式
     */
    lineAdjustmentMode?: BomItemDto.lineAdjustmentMode;
    /**
     * 损耗率(%)
     */
    lossRate?: number;
    /**
     * 物料匹配状态
     */
    matchStatus?: BomItemDto.matchStatus;
    /**
     * 物料匹配方式
     */
    matchedBy?: BomItemDto.matchedBy;
    /**
     * 生产用料消耗方式；为空时继承子件物料默认，再继承公司设置
     */
    materialConsumptionMode?: MaterialConsumptionMode | null;
    /**
     * 子件物料档案ID
     */
    materialId: string;
    /**
     * BOM用料角色
     */
    materialType?: string;
    /**
     * 稳定投料工序编码；跨路线版本优先按该编码匹配
     */
    operationCode?: string;
    /**
     * 投料工序序号
     */
    operationSequence?: number;
    /**
     * 工序/路线模板编码
     */
    operationTemplateCode?: string;
    /**
     * 型号差异动作
     */
    overlayAction?: BomItemDto.overlayAction;
    /**
     * 父级 BOM 行 ID
     */
    parentBomItemId?: string;
    /**
     * 零件类型
     */
    partType?: BomItemDto.partType;
    /**
     * 工艺阶段编码
     */
    phaseCode?: string;
    /**
     * 投料工艺路线工序ID；优先于投料工序序号
     */
    processOperationId?: string;
    /**
     * 工艺标签
     */
    processTags?: Array<string>;
    /**
     * 用量
     */
    quantity: number;
    /**
     * 用量模式
     */
    quantityMode?: BomItemDto.quantityMode;
    /**
     * 原材料名称快照
     */
    rawMaterialName?: string;
    /**
     * 原材料规格快照
     */
    rawMaterialSpec?: string;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 所属总成/模块编码
     */
    rootAssemblyCode?: string;
    /**
     * 用量取整规则
     */
    roundingMode?: BomItemDto.roundingMode;
    /**
     * 用量取整小数位
     */
    roundingPrecision?: number;
    /**
     * 套号
     */
    setNo?: string;
    /**
     * 排序
     */
    sortOrder?: number;
    /**
     * 来源原始字段快照
     */
    sourceAttributes?: Record<string, any>;
    /**
     * 来源系列基础 BOM 行 ID；型号差异行用于定位被覆盖/排除/替代的基础行
     */
    sourceBomItemId?: string;
    /**
     * 来源文件行号
     */
    sourceRowNo?: number;
    /**
     * 本 BOM 行批准替代料
     */
    substitutes?: Array<BomItemSubstituteDto>;
    /**
     * 面数、遍数或层数
     */
    surfaceCount?: number;
    /**
     * 计量单位（不传则自动取物料单位）
     */
    unit?: string;
    /**
     * 单位基准指标消耗量
     */
    usageRate?: number;
    /**
     * 单耗单位，格式为结果单位/基准单位，如 mL/m2、g/m2
     */
    usageRateUnit?: string;
};
export declare namespace BomItemDto {
    /**
     * 多基准聚合方式
     */
    enum baseAggregation {
        SUM = "sum"
    }
    /**
     * 计算基准指标
     */
    enum baseMetric {
        AREA = "area",
        LENGTH = "length",
        VOLUME = "volume",
        WEIGHT = "weight"
    }
    /**
     * 计算基准范围
     */
    enum baseScope {
        DEFAULT_MAIN = "default_main",
        SELECTED_ITEMS = "selected_items",
        ALL_MAIN_ITEMS = "all_main_items"
    }
    /**
     * 受控公式模板编码
     */
    enum formulaCode {
        FIXED_PER_UNIT_V1 = "fixed_per_unit_v1",
        BASIS_METRIC_USAGE_V1 = "basis_metric_usage_v1"
    }
    /**
     * 是否生成工单物料需求
     */
    enum issueRequirementMode {
        REQUIRED = "required",
        NOT_REQUIRED = "not_required"
    }
    /**
     * BOM 行被执行单据(销售订单/工单/生产计划等)实例化时允许调整的能力模式
     */
    enum lineAdjustmentMode {
        FIXED = "fixed",
        OPTIONAL = "optional",
        QUANTITY_ADJUSTABLE = "quantity_adjustable",
        APPROVED_SUBSTITUTE = "approved_substitute",
        FULLY_ADJUSTABLE = "fully_adjustable"
    }
    /**
     * 物料匹配状态
     */
    enum matchStatus {
        MATCHED = "matched",
        CANDIDATE = "candidate",
        PENDING = "pending",
        IGNORED = "ignored"
    }
    /**
     * 物料匹配方式
     */
    enum matchedBy {
        CODE = "code",
        CUSTOMER_PART = "customer_part",
        NAME_SPEC = "name_spec",
        MANUAL = "manual"
    }
    /**
     * 型号差异动作
     */
    enum overlayAction {
        INHERIT = "inherit",
        ADD = "add",
        EXCLUDE = "exclude",
        OVERRIDE_QUANTITY = "override_quantity",
        SUBSTITUTE = "substitute",
        OVERRIDE_SOURCING = "override_sourcing"
    }
    /**
     * 零件类型
     */
    enum partType {
        SELF_MADE = "self_made",
        STANDARD_PART = "standard_part",
        PURCHASED = "purchased",
        OUTSOURCED = "outsourced",
        CUSTOMER_SUPPLIED = "customer_supplied"
    }
    /**
     * 用量模式
     */
    enum quantityMode {
        FIXED = "fixed"
    }
    /**
     * 用量取整规则
     */
    enum roundingMode {
        CEIL = "ceil",
        ROUND = "round",
        FLOOR = "floor"
    }
}

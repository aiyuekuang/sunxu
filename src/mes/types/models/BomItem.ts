/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomBaseAggregation } from './BomBaseAggregation';
import type { BomBaseMetric } from './BomBaseMetric';
import type { BomBaseScope } from './BomBaseScope';
import type { BomFormulaCode } from './BomFormulaCode';
import type { BomItemIssueOperationBinding } from './BomItemIssueOperationBinding';
import type { BomItemMatchedBy } from './BomItemMatchedBy';
import type { BomItemMatchStatus } from './BomItemMatchStatus';
import type { BomItemPartType } from './BomItemPartType';
import type { BomLineAdjustmentMode } from './BomLineAdjustmentMode';
import type { BomLineIssueRequirementMode } from './BomLineIssueRequirementMode';
import type { BomOverlayAction } from './BomOverlayAction';
import type { BomQuantityMode } from './BomQuantityMode';
import type { BomQuantityRoundingMode } from './BomQuantityRoundingMode';
import type { MaterialConsumptionMode } from './MaterialConsumptionMode';
export type BomItem = {
    /**
     * 适用条件表达式；P0 支持物料档案白名单/排除名单，其他条件透传给后续策略解释器
     */
    applicabilityRule: Record<string, any>;
    /**
     * 装配分组
     */
    assemblyGroup?: string | null;
    /**
     * 多基准聚合方式
     */
    baseAggregation?: BomBaseAggregation | null;
    /**
     * 指定计算基准 BOM 行 ID
     */
    baseBomItemIds: Array<string>;
    /**
     * 计算基准指标
     */
    baseMetric?: BomBaseMetric | null;
    /**
     * 折算后的基础单位用量
     */
    baseQuantity?: number | null;
    /**
     * 计算基准范围
     */
    baseScope?: BomBaseScope | null;
    /**
     * 基础库存单位快照
     */
    baseUnit?: string | null;
    bomHeader?: Record<string, any>;
    bomHeaderId: string;
    /**
     * 受控公式扩展参数
     */
    calculationParams: Record<string, any>;
    companyId: string;
    /**
     * BOM单位到基础单位换算系数
     */
    conversionFactorToBase?: number | null;
    /**
     * BOM用量单位换算快照
     */
    conversionSnapshot: Record<string, any>;
    /**
     * 覆盖率；1 表示 100%
     */
    coverageRatio: number;
    createdAt: string;
    /**
     * 客户零件编码/图号
     */
    customerPartCode?: string | null;
    /**
     * 客户零件名称
     */
    customerPartName?: string | null;
    /**
     * 图纸附件 URL
     */
    drawingUrls: Array<string>;
    /**
     * 外部行号/序号
     */
    externalLineNo?: string | null;
    /**
     * 受控公式模板编码
     */
    formulaCode?: BomFormulaCode | null;
    /**
     * 受控公式模板版本
     */
    formulaVersion?: number | null;
    id: string;
    /**
     * 图片 URL
     */
    imageUrls: Array<string>;
    /**
     * 按工艺路线维护的投料工序映射
     */
    issueOperationBindings?: Array<BomItemIssueOperationBinding>;
    /**
     * 投料工序 ID
     */
    issueOperationId?: string | null;
    /**
     * 是否从该 BOM 行生成工单物料需求；不生成时仅作为结构、图纸或工艺参考，不参与领料
     */
    issueRequirementMode: BomLineIssueRequirementMode;
    /**
     * BOM 行被执行单据(销售订单/工单/生产计划等)实例化时允许调整的能力模式
     */
    lineAdjustmentMode: BomLineAdjustmentMode;
    lossRate: number;
    /**
     * 物料匹配状态
     */
    matchStatus: BomItemMatchStatus;
    /**
     * 物料匹配方式
     */
    matchedBy?: BomItemMatchedBy | null;
    material?: Record<string, any>;
    /**
     * 该 BOM 明细的生产消耗方式；为空时继承子件物料默认，再继承公司设置
     */
    materialConsumptionMode?: MaterialConsumptionMode | null;
    materialId: string;
    /**
     * BOM用料角色
     */
    materialType: string;
    /**
     * 稳定投料工序编码；跨路线版本优先按该编码匹配
     */
    operationCode?: string | null;
    /**
     * 投料工序序号（对应工艺路线中的工序 sequence）
     */
    operationSequence?: number | null;
    /**
     * 工序/路线模板编码
     */
    operationTemplateCode?: string | null;
    /**
     * 型号差异 BOM 对产品基础行的处理动作
     */
    overlayAction: BomOverlayAction;
    /**
     * 父级 BOM 行 ID
     */
    parentBomItemId?: string | null;
    /**
     * 零件类型
     */
    partType: BomItemPartType;
    /**
     * 工艺阶段编码
     */
    phaseCode?: string | null;
    processOperation?: Record<string, any> | null;
    /**
     * 投料工艺路线工序ID；优先于 operationSequence
     */
    processOperationId?: string | null;
    /**
     * 工艺标签
     */
    processTags: Array<string>;
    quantity: number;
    /**
     * BOM 行用量模式
     */
    quantityMode: BomQuantityMode;
    /**
     * 原材料名称快照
     */
    rawMaterialName?: string | null;
    /**
     * 原材料规格快照
     */
    rawMaterialSpec?: string | null;
    remark?: string | null;
    /**
     * 所属总成/模块编码
     */
    rootAssemblyCode?: string | null;
    /**
     * 用量取整规则
     */
    roundingMode: BomQuantityRoundingMode;
    /**
     * 用量取整小数位
     */
    roundingPrecision: number;
    /**
     * 套号
     */
    setNo?: string | null;
    sortOrder: number;
    /**
     * 来源原始字段快照
     */
    sourceAttributes: Record<string, any>;
    sourceBomItem?: BomItem | null;
    /**
     * 差异行来源的系列基础 BOM 行 ID
     */
    sourceBomItemId?: string | null;
    /**
     * 来源文件行号
     */
    sourceRowNo?: number | null;
    substitutes?: Array<Record<string, any>>;
    /**
     * 面数、遍数或层数
     */
    surfaceCount: number;
    unit: string;
    updatedAt: string;
    /**
     * 单位基准指标消耗量
     */
    usageRate?: number | null;
    /**
     * 单耗单位，格式为结果单位/基准单位，如 mL/m2、g/m2
     */
    usageRateUnit?: string | null;
};

import type { Material } from './Material.d.ts';
import type { OperationOutputMode } from './OperationOutputMode.d.ts';
import type { OperationPayMode } from './OperationPayMode.d.ts';
import type { OperationReportRoundingMode } from './OperationReportRoundingMode.d.ts';
import type { OperationStartPace } from './OperationStartPace.d.ts';
import type { PieceworkQtyBasis } from './PieceworkQtyBasis.d.ts';
import type { PostGapTimeMode } from './PostGapTimeMode.d.ts';
import type { ProcessOperationInspectionRule } from './ProcessOperationInspectionRule.d.ts';
import type { QualityTemplate } from './QualityTemplate.d.ts';
import type { StandardTimeBasis } from './StandardTimeBasis.d.ts';
import type { Supplier } from './Supplier.d.ts';
import type { TemporaryOutsourcingQualityMode } from './TemporaryOutsourcingQualityMode.d.ts';
import type { TimeCaptureMode } from './TimeCaptureMode.d.ts';
import type { TimeRateUnit } from './TimeRateUnit.d.ts';
import type { User } from './User.d.ts';
export type ProcessOperation = {
    /**
     * 默认自制工序是否允许在工单执行期临时委外
     */
    allowTemporaryOutsourcing: boolean;
    /**
     * 是否允许零数量报工
     */
    allowZeroQuantityReport: boolean;
    /**
     * 允许设备列表，数组顺序表示设备优先级（顺位1最高）
     */
    allowedEquipmentIds?: Array<string> | null;
    /**
     * 允许使用的具体工装ID列表（空=按工装类型匹配）
     */
    allowedToolingIds?: Array<string> | null;
    auxiliaryPriceRatio?: number | null;
    code?: string | null;
    companyId: string;
    createdAt: string;
    defaultAssignee: User | null;
    defaultAssigneeId?: string | null;
    /**
     * 默认委外供应商
     */
    defaultOutsourceSupplier?: Supplier | null;
    /**
     * 默认委外供应商ID；用于排产承接资源和委外单默认带出
     */
    defaultOutsourceSupplierId?: string | null;
    description?: string | null;
    /**
     * 工序图纸/作业资料 URL 列表
     */
    drawingUrls?: Array<string>;
    equipmentType?: string | null;
    /**
     * 加工计数单位，如次、面、遍、点、件次
     */
    executionUnit?: string | null;
    id: string;
    /**
     * 工序的 IPQC 模板规则；物料专属模板优先，未命中时使用默认模板
     */
    inspectionTemplateBindings?: Array<ProcessOperationInspectionRule>;
    /**
     * 是否启用；停用后不纳入后续新建工单
     */
    isEnabled: boolean;
    isOutsourced: boolean;
    isQualityCheck: boolean;
    /**
     * 最低委外批量；自动建单按兼容委外需求汇总，未达到此数量时留在待组需求池；0或空表示按现有规则逐单生成
     */
    minimumOutsourcingBatchQty?: number | null;
    name: string;
    /**
     * 工序产出口径
     */
    operationOutputMode: OperationOutputMode;
    /**
     * 本工序报工量是否折算为产品良品/报废
     */
    operationReportAffectsOutput: boolean;
    /**
     * 换算基准中的产品数量
     */
    operationReportBaseProductQty?: number | null;
    /**
     * 工序目标量小数精度
     */
    operationReportPrecision?: number | null;
    /**
     * 工序目标量舍入方式
     */
    operationReportRoundingMode: OperationReportRoundingMode;
    /**
     * 换算基准中的工序报工数量
     */
    operationReportTargetQty?: number | null;
    /**
     * 工序报工单位，例如件、面、遍、米、箱、点
     */
    operationReportUnit?: string | null;
    /**
     * 历史委外周期（分钟，墙钟）；仅用于旧数据兼容，新委外排产使用 setupTime + standardTime × 数量
     */
    outsourcingLeadTimeMinutes?: number | null;
    /**
     * 委外交付物/工序产出物料
     */
    outsourcingOutputMaterial?: Material | null;
    /**
     * 委外交付物/工序产出物料ID；仅委外工序用于生成委外单收货物料
     */
    outsourcingOutputMaterialId?: string | null;
    /**
     * 委外回货后完成检验和入库所需工作日数；用于根据后继工序计划开工日倒推出要求到货日；为空表示未配置，按0天处理
     */
    outsourcingReceiptLeadTimeDays?: number | null;
    parallelGroup?: string | null;
    /**
     * 计薪方式
     */
    payMode: OperationPayMode;
    pieceRate?: number | null;
    /**
     * 计件数量基准
     */
    pieceworkQtyBasis: PieceworkQtyBasis;
    /**
     * 后置等待/间隔时长（分钟，按所选计时方式计算）：本工序完成后产出须静置/固化/冷却的最小时长。留空按系统默认工序间隔。
     */
    postGapMinutes?: number | null;
    /**
     * 后置等待计时方式；默认按自然时间，或按承接资源排班累计
     */
    postGapTimeMode?: PostGapTimeMode;
    /**
     * 前置工序ID列表（查询接口派生返回）
     */
    predecessorOperationIds?: Array<string>;
    /**
     * 要求工装类型（字典：tooling_type，空=不限制）
     */
    requiredToolingType?: string | null;
    route?: Record<string, any>;
    routeId: string;
    sequence: number;
    /**
     * 准备组编码；用于在同一资源上识别可连续生产的工序，空值时沿用每单固定准备工时
     */
    setupGroupCode?: string | null;
    setupTime?: number | null;
    stageName?: string | null;
    stageNo?: number | null;
    /**
     * 来源标准工序
     */
    standardOperation?: Record<string, any> | null;
    /**
     * 来源标准工序ID快照；仅用于追溯和再次维护时识别来源
     */
    standardOperationId?: string | null;
    standardTime?: number | null;
    /**
     * 标准工时基准
     */
    standardTimeBasis: StandardTimeBasis;
    /**
     * 开工节奏：earliest 尽早开工（默认，正排语义）；latest 尽量晚开工（拉式，在不影响后继工序与整单完工的前提下尽量推迟本工序）。这是排产节奏，不是瓶颈识别标记；目前仅从生产计划排产时应用，工单直接排产按尽早开工处理。仅对自制工序生效。
     */
    startPace?: OperationStartPace;
    /**
     * 后继工序ID列表（查询接口派生返回）
     */
    successorOperationIds?: Array<string>;
    /**
     * 临时委外 IPQC 模板
     */
    temporaryOutsourcingInspectionTemplate?: QualityTemplate | null;
    /**
     * 临时委外 IPQC 模板ID；留档或合格后放行时必填
     */
    temporaryOutsourcingInspectionTemplateId?: string | null;
    /**
     * 临时委外收货的质量放行策略
     */
    temporaryOutsourcingQualityMode?: TemporaryOutsourcingQualityMode | null;
    /**
     * 工时采集方式
     */
    timeCaptureMode: TimeCaptureMode;
    /**
     * 计时基准单价
     */
    timeRate?: number | null;
    /**
     * 计时单价单位
     */
    timeRateUnit?: TimeRateUnit | null;
    transferBatchQty?: number | null;
    updatedAt: string;
    workCenterId?: string | null;
};

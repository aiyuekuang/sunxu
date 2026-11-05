import type { PostGapTimeMode } from './PostGapTimeMode.d.ts';
import type { ProcessOperationInspectionTemplateBindingDto } from './ProcessOperationInspectionTemplateBindingDto.d.ts';
export type ProcessOperationDto = {
    /**
     * 是否允许默认自制工序临时委外
     */
    allowTemporaryOutsourcing?: boolean;
    /**
     * 是否允许零数量报工
     */
    allowZeroQuantityReport?: boolean;
    /**
     * 允许使用的设备ID列表，数组顺序表示设备优先级（顺位1最高）；不传则按设备类型全量匹配
     */
    allowedEquipmentIds?: Array<string>;
    /**
     * 允许使用的具体工装ID列表，不传则按工装类型匹配
     */
    allowedToolingIds?: Array<string>;
    /**
     * 辅操工价比例（0~1）
     */
    auxiliaryPriceRatio?: number;
    /**
     * 工序编码
     */
    code?: string;
    /**
     * 默认操作员ID
     */
    defaultAssigneeId?: string;
    /**
     * 默认委外供应商ID；用于排产承接资源和委外单默认带出
     */
    defaultOutsourceSupplierId?: string | null;
    /**
     * 工序说明
     */
    description?: string;
    /**
     * 工序图纸/作业资料 URL 列表
     */
    drawingUrls?: Array<string>;
    /**
     * 所需设备类型；必须取自系统字典「设备类型」(equipment_type)，不可自行编造；非委外产出类工序启用前需填写设备类型或工作中心
     */
    equipmentType?: string;
    /**
     * 加工计数单位，如次、面、遍、点、件次
     */
    executionUnit?: string;
    /**
     * 工序 IPQC 模板规则；materialId 为空为唯一默认模板，可按单个 materialId 配置专属模板。routeApplicabilityId 仅兼容历史规则，不能与 materialId 同时传入
     */
    inspectionTemplateBindings?: Array<ProcessOperationInspectionTemplateBindingDto>;
    /**
     * 已废弃：旧客户端的单模板参数。服务端会把唯一模板映射为工序默认 IPQC 模板绑定
     */
    inspectionTemplateIds?: Array<string>;
    /**
     * 是否启用；停用后不纳入后续新建工单
     */
    isEnabled?: boolean;
    /**
     * 是否委外工序
     */
    isOutsourced?: boolean;
    /**
     * 是否为质检工序
     */
    isQualityCheck?: boolean;
    /**
     * 最低委外批量；自动委外需求按兼容工序汇总达到此数量后合并建单，未达量保留在待组需求池；0或留空按现有逐单规则
     */
    minimumOutsourcingBatchQty?: number;
    /**
     * 工序名称
     */
    name: string;
    /**
     * 工序产出口径
     */
    operationOutputMode?: ProcessOperationDto.operationOutputMode;
    /**
     * 本工序报工量是否折算为产品良品/报废
     */
    operationReportAffectsOutput?: boolean;
    /**
     * 换算基准中的产品数量
     */
    operationReportBaseProductQty?: number;
    /**
     * 工序目标量小数精度
     */
    operationReportPrecision?: number;
    /**
     * 工序目标量舍入方式
     */
    operationReportRoundingMode?: ProcessOperationDto.operationReportRoundingMode;
    /**
     * 换算基准中的工序报工数量
     */
    operationReportTargetQty?: number;
    /**
     * 工序报工单位，例如件、面、遍、米、箱、点
     */
    operationReportUnit?: string;
    /**
     * 历史委外周期（分钟，墙钟）；仅用于旧数据兼容，新委外排产使用准备时间 + 单件工时 × 数量
     */
    outsourcingLeadTimeMinutes?: number | null;
    /**
     * 委外交付物/工序产出物料ID；委外工序用于生成委外单收货物料
     */
    outsourcingOutputMaterialId?: string | null;
    /**
     * 委外回货后检验和入库所需工作日数；用于按后继工序计划开工日倒推要求到货日，0或留空表示不额外预留工作日
     */
    outsourcingReceiptLeadTimeDays?: number | null;
    /**
     * 并行工序组
     */
    parallelGroup?: string;
    /**
     * 计薪方式
     */
    payMode?: ProcessOperationDto.payMode;
    pieceRate?: number;
    /**
     * 计件数量基准
     */
    pieceworkQtyBasis?: ProcessOperationDto.pieceworkQtyBasis;
    /**
     * 后置等待时长（分钟，按所选计时方式计算）
     */
    postGapMinutes?: number;
    /**
     * 后置等待计时方式：自然时间（默认）或按承接资源排班累计
     */
    postGapTimeMode?: PostGapTimeMode;
    /**
     * 要求工装类型（字典：tooling_type，空=不限制）
     */
    requiredToolingType?: string;
    /**
     * 工序顺序
     */
    sequence: number;
    /**
     * 准备组编码；相同准备组可按公司排产策略连续生产，空值时保持每单固定准备工时
     */
    setupGroupCode?: string;
    /**
     * 准备/换模工时（分钟）
     */
    setupTime: number;
    /**
     * 阶段名称
     */
    stageName?: string;
    /**
     * 阶段序号，仅用于阶段式维护
     */
    stageNo?: number;
    /**
     * 来源标准工序ID；选择标准工序时带出，保存为路线工序来源快照
     */
    standardOperationId?: string;
    /**
     * 单件标准工时（分钟/件）；产出类工序启用前必填
     */
    standardTime?: number;
    /**
     * 标准工时基准
     */
    standardTimeBasis?: ProcessOperationDto.standardTimeBasis;
    /**
     * 开工节奏：earliest 尽早开工（默认）；latest 尽量晚开工（拉式，在不影响后继工序与整单完工的前提下尽量推迟本工序）。这是排产节奏，不是瓶颈识别标记；目前仅从生产计划排产时应用，工单直接排产按尽早开工处理。仅对自制工序生效。
     */
    startPace?: ProcessOperationDto.startPace;
    /**
     * 临时委外 IPQC 模板ID；留档或合格后放行时必填
     */
    temporaryOutsourcingInspectionTemplateId?: string | null;
    /**
     * 临时委外质量放行策略
     */
    temporaryOutsourcingQualityMode?: ProcessOperationDto.temporaryOutsourcingQualityMode;
    /**
     * 工时采集方式
     */
    timeCaptureMode?: ProcessOperationDto.timeCaptureMode;
    /**
     * 计时基准单价
     */
    timeRate?: number;
    /**
     * 计时单价单位
     */
    timeRateUnit?: ProcessOperationDto.timeRateUnit;
    /**
     * 转移批量：前工序每完成该数量即可转到下工序（空=需全部完成）
     */
    transferBatchQty?: number;
    /**
     * 工作中心ID
     */
    workCenterId?: string;
};
export declare namespace ProcessOperationDto {
    /**
     * 工序产出口径
     */
    enum operationOutputMode {
        QUANTITY = "quantity",
        QUANTITY_TIME = "quantity_time",
        EXECUTION_QUANTITY = "execution_quantity",
        NON_OUTPUT_EXECUTION = "non_output_execution"
    }
    /**
     * 工序目标量舍入方式
     */
    enum operationReportRoundingMode {
        NONE = "none",
        CEIL = "ceil",
        ROUND = "round",
        FLOOR = "floor"
    }
    /**
     * 计薪方式
     */
    enum payMode {
        NONE = "none",
        PIECE = "piece",
        TIME = "time"
    }
    /**
     * 计件数量基准
     */
    enum pieceworkQtyBasis {
        PRODUCT_QTY = "product_qty",
        OPERATION_REPORT_QTY = "operation_report_qty"
    }
    /**
     * 标准工时基准
     */
    enum standardTimeBasis {
        PRODUCT_QTY = "product_qty",
        OPERATION_REPORT_QTY = "operation_report_qty"
    }
    /**
     * 开工节奏：earliest 尽早开工（默认）；latest 尽量晚开工（拉式，在不影响后继工序与整单完工的前提下尽量推迟本工序）。这是排产节奏，不是瓶颈识别标记；目前仅从生产计划排产时应用，工单直接排产按尽早开工处理。仅对自制工序生效。
     */
    enum startPace {
        EARLIEST = "earliest",
        LATEST = "latest"
    }
    /**
     * 临时委外质量放行策略
     */
    enum temporaryOutsourcingQualityMode {
        NO_AUTO_INSPECTION = "no_auto_inspection",
        RECORD_NON_BLOCKING = "record_non_blocking",
        RELEASE_REQUIRED = "release_required"
    }
    /**
     * 工时采集方式
     */
    enum timeCaptureMode {
        MANUAL = "manual",
        SESSION_OPTIONAL = "session_optional",
        SESSION_REQUIRED = "session_required",
        IOT = "iot"
    }
    /**
     * 计时单价单位
     */
    enum timeRateUnit {
        HOUR = "hour",
        HALF_DAY = "half_day",
        DAY = "day",
        SHIFT = "shift"
    }
}

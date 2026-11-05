import type { PostGapTimeMode } from './PostGapTimeMode.d.ts';
import type { WorkOrderOperationPredecessorInputDto } from './WorkOrderOperationPredecessorInputDto.d.ts';
export type AddWorkOrderOperationDto = {
    /**
     * 是否允许零数量报工
     */
    allowZeroQuantityReport?: boolean;
    /**
     * 允许使用的设备ID列表，数组顺序表示设备优先级（顺位1最高）
     */
    allowedEquipmentIds?: Array<string>;
    /**
     * 辅操工价比例（0~1）
     */
    auxiliaryPriceRatio?: number | null;
    /**
     * 默认委外供应商ID快照；用于排产承接资源和委外单默认带出
     */
    defaultOutsourceSupplierId?: string | null;
    /**
     * 工序图纸/作业资料 URL 快照
     */
    drawingUrls?: Array<string>;
    /**
     * 设备类型；必须取自系统字典「设备类型」(equipment_type)，不可自行编造；产出类工序需填写设备类型或工作中心
     */
    equipmentType?: string;
    /**
     * 加工计数单位，如次、面、遍、点、件次
     */
    executionUnit?: string;
    /**
     * 工序名称（手工录入时使用）
     */
    operationName: string;
    /**
     * 工序产出口径
     */
    operationOutputMode?: AddWorkOrderOperationDto.operationOutputMode;
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
    operationReportRoundingMode?: AddWorkOrderOperationDto.operationReportRoundingMode;
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
     * 计薪方式
     */
    payMode?: AddWorkOrderOperationDto.payMode;
    /**
     * 计件单价（元/件）
     */
    pieceRate?: number | null;
    /**
     * 计件数量基准
     */
    pieceworkQtyBasis?: AddWorkOrderOperationDto.pieceworkQtyBasis;
    /**
     * 后置等待时长（分钟，按所选计时方式计算）
     */
    postGapMinutes?: number | null;
    /**
     * 后置等待计时方式：自然时间（默认）或按承接资源排班累计
     */
    postGapTimeMode?: PostGapTimeMode;
    /**
     * 前置工序依赖。生产中追加工序时必须至少选择一道前置工序；多前置用于并行汇合场景。
     */
    predecessorDependencies?: Array<WorkOrderOperationPredecessorInputDto>;
    sequence?: number;
    /**
     * 准备组编码快照；用于连续生产排产判断
     */
    setupGroupCode?: string | null;
    /**
     * 换模/准备工时（分钟）
     */
    setupTime?: number | null;
    /**
     * 阶段名称
     */
    stageName?: string | null;
    /**
     * 阶段号，用于并行工序分组展示
     */
    stageNo?: number | null;
    /**
     * 单件标准工时（分钟/件）；产出类工序必填
     */
    standardTime?: number;
    /**
     * 标准工时基准
     */
    standardTimeBasis?: AddWorkOrderOperationDto.standardTimeBasis;
    /**
     * 开工节奏：earliest 尽早开工（默认）；latest 尽量晚开工（拉式，从生产计划排产时在不影响后继工序与整单完工的前提下尽量推迟本工序）。仅对自制工序生效。
     */
    startPace?: AddWorkOrderOperationDto.startPace;
    /**
     * 工时采集方式
     */
    timeCaptureMode?: AddWorkOrderOperationDto.timeCaptureMode;
    /**
     * 计时基准单价
     */
    timeRate?: number;
    /**
     * 计时单价单位
     */
    timeRateUnit?: AddWorkOrderOperationDto.timeRateUnit;
    /**
     * 工作中心ID
     */
    workCenterId?: string | null;
    /**
     * 工单ID
     */
    workOrderId: string;
};
export declare namespace AddWorkOrderOperationDto {
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
     * 开工节奏：earliest 尽早开工（默认）；latest 尽量晚开工（拉式，从生产计划排产时在不影响后继工序与整单完工的前提下尽量推迟本工序）。仅对自制工序生效。
     */
    enum startPace {
        EARLIEST = "earliest",
        LATEST = "latest"
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

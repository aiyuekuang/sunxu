/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Equipment } from './Equipment';
import type { Material } from './Material';
import type { OperationOutputMode } from './OperationOutputMode';
import type { OperationPayMode } from './OperationPayMode';
import type { OperationReportRoundingMode } from './OperationReportRoundingMode';
import type { OperationStartPace } from './OperationStartPace';
import type { PieceworkQtyBasis } from './PieceworkQtyBasis';
import type { PostGapTimeMode } from './PostGapTimeMode';
import type { SetupSource } from './SetupSource';
import type { StandardTimeBasis } from './StandardTimeBasis';
import type { Supplier } from './Supplier';
import type { TemporaryOutsourcingQualityMode } from './TemporaryOutsourcingQualityMode';
import type { TimeCaptureMode } from './TimeCaptureMode';
import type { TimeRateUnit } from './TimeRateUnit';
import type { User } from './User';
import type { WorkOrder } from './WorkOrder';
import type { WorkOrderOperationPredecessorDependencyDto } from './WorkOrderOperationPredecessorDependencyDto';
import type { WorkOrderOperationStatus } from './WorkOrderOperationStatus';
import type { WorkOrderOperationToolingSessionDto } from './WorkOrderOperationToolingSessionDto';
export type WorkOrderOperation = {
    actualTime?: number | null;
    /**
     * 工艺路线临时委外授权快照；已下达工单不随路线修改变化
     */
    allowTemporaryOutsourcingSnapshot: boolean;
    /**
     * 是否允许零数量报工快照
     */
    allowZeroQuantityReport: boolean;
    /**
     * 允许设备列表，数组顺序表示设备优先级（顺位1最高）
     */
    allowedEquipmentIds?: Array<string> | null;
    /**
     * 允许使用的具体工装ID快照（空=按工装类型匹配）
     */
    allowedToolingIds?: Array<string> | null;
    assignee?: User | null;
    assigneeId?: string | null;
    auxiliaryPriceRatioSnapshot?: number | null;
    /**
     * 当前业务状态下是否允许报工，不包含前端权限判断
     */
    canReport?: boolean;
    /**
     * 当前业务状态下是否允许创建临时委外单，不包含前端权限判断；由后端工单状态、工序快照及可分配数量统一计算
     */
    canTemporaryOutsource?: boolean;
    companyId: string;
    completedQty: number;
    createdAt: string;
    /**
     * 默认委外供应商快照关联
     */
    defaultOutsourceSupplier?: Supplier | null;
    /**
     * 默认委外供应商ID快照；用于排产承接资源和委外单默认带出
     */
    defaultOutsourceSupplierId?: string | null;
    /**
     * 前置工序摘要，供页面/打印展示
     */
    dependencySummary?: string | null;
    /**
     * 工序图纸/作业资料 URL 快照
     */
    drawingUrls?: Array<string>;
    /**
     * 工序最终完成目标（与当前可处理量 inputQty 分离）
     */
    effectiveQty?: number;
    endTime?: string | null;
    equipment?: Equipment | null;
    equipmentId?: string | null;
    equipmentType?: string | null;
    /**
     * 累计加工计数执行量，不计入良品/报废/入库
     */
    executionQty: number;
    /**
     * 加工计数目标量，仅用于执行进度展示
     */
    executionQtyTarget?: number | null;
    /**
     * 查询派生字段：当前公司策略是否展示加工计数进度
     */
    executionQtyVisible?: boolean;
    /**
     * 加工计数单位，如次、面、遍、点、件次
     */
    executionUnit?: string | null;
    id: string;
    inputQty?: number | null;
    /**
     * 按工单物料匹配后的 IPQC 模板快照
     */
    inspectionTemplateIdSnapshot?: string | null;
    /**
     * 工单生成时冻结的 IPQC 检验方案；历史工单可能为空
     */
    inspectionTemplateSnapshot?: Record<string, any> | null;
    /**
     * 是否委外工序；从工艺路线工序克隆后冻结到工单工序
     */
    isOutsourced: boolean;
    /**
     * 是否为过程检工序快照；null 表示历史工单，自动质检时回退读取路线工序
     */
    isQualityCheckSnapshot?: boolean | null;
    /**
     * 结合前序良品约束后的本次最大可报工数量
     */
    maxReportQty?: number;
    /**
     * 当前可创建临时委外的最大数量；已扣除厂内已完成/报废数量及其他未生效临时委外占用
     */
    maxTemporaryOutsourceQty?: number;
    /**
     * 最低委外批量快照；工单生成后固定，用于自动合并委外需求
     */
    minimumOutsourcingBatchQty?: number | null;
    operationName: string;
    /**
     * 工序产出口径快照
     */
    operationOutputMode: OperationOutputMode;
    /**
     * 本工序报工量是否折算为产品良品/报废快照
     */
    operationReportAffectsOutput: boolean;
    /**
     * 换算基准中的产品数量快照
     */
    operationReportBaseProductQty?: number | null;
    /**
     * 工序目标量小数精度快照
     */
    operationReportPrecision?: number | null;
    /**
     * 按工序单位计算的剩余可报量
     */
    operationReportRemainingQty?: number;
    /**
     * 累计工序报工量
     */
    operationReportReportedQty: number;
    /**
     * 工序目标量舍入方式快照
     */
    operationReportRoundingMode: OperationReportRoundingMode;
    /**
     * 工序报工单位换算摘要
     */
    operationReportSummary?: string | null;
    /**
     * 换算基准中的工序报工数量快照
     */
    operationReportTargetQty?: number | null;
    /**
     * 按工单计划数量计算出的目标工序报工量
     */
    operationReportTargetQtySnapshot?: number | null;
    /**
     * 工序报工单位快照，例如件、面、遍、米、箱、点
     */
    operationReportUnit?: string | null;
    /**
     * 历史委外周期快照（分钟，墙钟）；仅用于旧工单兼容，新委外排产使用 setupTime + standardTime × 数量
     */
    outsourcingLeadTimeMinutes?: number | null;
    /**
     * 委外交付物/工序产出物料快照关联
     */
    outsourcingOutputMaterial?: Material | null;
    /**
     * 委外交付物/工序产出物料ID快照；仅委外工序用于生成委外单收货物料
     */
    outsourcingOutputMaterialId?: string | null;
    /**
     * 委外回货后检验和入库所需工作日数快照；按后继工序计划开工日倒推出要求到货日；为空表示未配置，按0天处理
     */
    outsourcingReceiptLeadTimeDays?: number | null;
    parallelGroup?: string | null;
    pausedAt?: string | null;
    /**
     * 计薪方式快照
     */
    payModeSnapshot: OperationPayMode;
    /**
     * 受权限控制的计薪/工价展示预览
     */
    payPreview?: Record<string, any> | null;
    pieceRateSnapshot?: number | null;
    /**
     * 计件数量基准快照
     */
    pieceworkQtyBasisSnapshot: PieceworkQtyBasis;
    plannedQty?: number | null;
    /**
     * 后置等待/间隔时长（分钟，按所选计时方式计算）：本工序完成后产出须静置/固化/冷却的最小时长。留空按系统默认工序间隔。
     */
    postGapMinutes?: number | null;
    /**
     * 后置等待计时方式快照；默认按自然时间，或按承接资源排班累计
     */
    postGapTimeMode?: PostGapTimeMode;
    /**
     * 前置依赖边明细（查询接口派生返回）
     */
    predecessorDependencies?: Array<WorkOrderOperationPredecessorDependencyDto>;
    /**
     * 前置工序ID列表（查询接口派生返回）
     */
    predecessorOperationIds?: Array<string>;
    processOperationId?: string | null;
    /**
     * 工序进度百分比，口径为已报工数量 / 有效数量
     */
    progress?: number;
    /**
     * 前序质检未放行时的阻塞原因
     */
    qualityBlockReason?: string | null;
    /**
     * 工序准备状态：ready/blocked_by_dependency/blocked_by_quality/blocked
     */
    readyState?: string | null;
    /**
     * 距离工序最终完成目标的剩余数量
     */
    remainingQty?: number;
    remark?: string | null;
    /**
     * 不可报工时的业务原因
     */
    reportBlockReason?: string | null;
    reportedAt?: string | null;
    reportedBy?: string | null;
    /**
     * 已报工数量（良品 + 报废），由查询接口派生返回
     */
    reportedQty?: number;
    reporter?: User | null;
    /**
     * 要求工装类型快照（字典：tooling_type，空=不限制）
     */
    requiredToolingType?: string | null;
    /**
     * 当前绑定在本工序上的运行中工装会话
     */
    runningToolingSessions?: Array<WorkOrderOperationToolingSessionDto>;
    scrappedQty: number;
    sequence: number;
    /**
     * 准备组编码快照；工单生成后不随工艺路线修改，用于排产连续生产判断
     */
    setupGroupCode?: string | null;
    /**
     * 准备工时标准快照来源；历史工序无法可靠反推时为空
     */
    setupSource?: SetupSource | null;
    setupTime?: number | null;
    stageName?: string | null;
    stageNo?: number | null;
    /**
     * 来源标准工序
     */
    standardOperation?: Record<string, any> | null;
    /**
     * 来源标准工序ID快照；从工艺路线工序继承，仅用于追溯
     */
    standardOperationId?: string | null;
    standardTime?: number | null;
    /**
     * 标准工时基准快照
     */
    standardTimeBasis: StandardTimeBasis;
    /**
     * 开工节奏快照：earliest 尽早开工（默认，正排语义）；latest 尽量晚开工（拉式）。仅对自制工序生效。
     */
    startPace?: OperationStartPace;
    startTime?: string | null;
    status: WorkOrderOperationStatus;
    /**
     * 后继工序ID列表（查询接口派生返回）
     */
    successorOperationIds?: Array<string>;
    /**
     * 当前不能创建临时委外时的后端业务原因
     */
    temporaryOutsourceBlockReason?: string | null;
    /**
     * 临时委外 IPQC 模板快照
     */
    temporaryOutsourcingInspectionTemplateIdSnapshot?: string | null;
    /**
     * 临时委外质量策略快照
     */
    temporaryOutsourcingQualityModeSnapshot?: TemporaryOutsourcingQualityMode | null;
    /**
     * 工时采集方式快照
     */
    timeCaptureMode: TimeCaptureMode;
    /**
     * 计时单价快照
     */
    timeRateSnapshot?: number | null;
    /**
     * 计时单价单位快照
     */
    timeRateUnitSnapshot?: TimeRateUnit | null;
    totalPausedMinutes: number;
    transferBatchQty?: number | null;
    updatedAt: string;
    workCenterId?: string | null;
    workOrder?: WorkOrder;
    workOrderId: string;
};

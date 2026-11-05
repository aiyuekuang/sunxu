export type ReportOperationDto = {
    /**
     * 确认本次为跨日作业或事后补录的异常工时（单次工时超过 24 小时时必须显式确认）
     */
    abnormalDurationConfirmed?: boolean;
    /**
     * 跨日/补录工时说明（确认异常工时时必填）
     */
    abnormalDurationNote?: string;
    /**
     * 本次报工实测的准备/换型工时（分钟）；不传时不从 durationMinutes 反推
     */
    actualSetupMinutes?: number;
    actualTime?: number;
    /**
     * 生产批号：按批号/单件序列号追溯的物料必填；不传时系统沿用本工单批号，首次报工自动生成默认批号
     */
    batchNo?: string;
    /**
     * 本次完成数量（可为0，表示仅报废）
     */
    completedQty: number;
    /**
     * 本次产出归属的来源需求行；来源计划需求完成按该归属汇总，每道工序均受该来源在工单中的投产分配数量限制。多来源工单必须选择
     */
    demandLineId?: string;
    /**
     * 本次报工有效工时（分钟），优先于开始/结束时间或上下机会话推导
     */
    durationMinutes?: number;
    /**
     * 本次工时结束时间
     */
    endedAt?: string;
    /**
     * 使用设备ID
     */
    equipmentId?: string;
    /**
     * 关联上下机会话ID
     */
    equipmentSessionId?: string;
    /**
     * 是否辅操报工
     */
    isAuxiliary?: boolean;
    /**
     * 业务实际发生时间，不传则默认当前时间
     */
    occurredAt?: string;
    /**
     * 工序报工记录ID
     */
    operationId: string;
    /**
     * 报工时改入库仓ID（仅末道报工允许受控覆盖）
     */
    overrideReceiptWarehouseId?: string;
    /**
     * 现场照片 URL 列表
     */
    photoUrls?: Array<string>;
    /**
     * 本次完工自动入库仓位ID；仅实际生成完工入库且入库仓严格仓位时必填
     */
    receiptLocationId?: string;
    /**
     * 改入库仓原因（改仓时必填）
     */
    receiptWarehouseChangeReason?: string;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 本次工序单位良品报工量，例如报 1 箱、12 米
     */
    reportedOperationQty?: number;
    /**
     * 本次工序单位报废报工量，例如报废 0.1 箱、2 米
     */
    reportedOperationScrappedQty?: number;
    /**
     * 报工人ID（不传则工序指定人员优先，否则默认当前登录用户；代他人报工时传入）
     */
    reporterId?: string;
    /**
     * 本次报工绑定的具体排产实例ID
     */
    scheduleEntryId?: string;
    /**
     * 报废照片 URL 列表
     */
    scrapPhotoUrls?: Array<string>;
    /**
     * 报废原因
     */
    scrapReason?: string;
    /**
     * 本次报废数量
     */
    scrappedQty?: number;
    /**
     * 单件追踪物料本次已贴码报废产品的实际序列号；选填，未填写的报废数量只按数量记录，不绑定序列号
     */
    scrappedSerialNumbers?: Array<string>;
    /**
     * 单件追踪物料本次合格产出的序列号；允许少填，未填写的号码由后端从当前工单已分配的可用序列号中补齐，填写数量不能超过本次良品数量
     */
    serialNumbers?: Array<string>;
    /**
     * 本次工时开始时间
     */
    startedAt?: string;
    /**
     * 本次完工自动入库的存放位置文本；未启用仓位管控时仅作为位置快照记录
     */
    storageLocation?: string;
    /**
     * 工时来源
     */
    timeSource?: ReportOperationDto.timeSource;
    /**
     * 工作中心ID（不传则自动从排产记录推导）
     */
    workCenterId?: string;
    /**
     * 工单ID
     */
    workOrderId: string;
    /**
     * 零数量报工原因
     */
    zeroQuantityReason?: string;
};
export declare namespace ReportOperationDto {
    /**
     * 工时来源
     */
    enum timeSource {
        MANUAL = "manual",
        SESSION = "session",
        IOT = "iot",
        DERIVED = "derived"
    }
}

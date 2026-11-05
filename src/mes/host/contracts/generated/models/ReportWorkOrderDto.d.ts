export type ReportWorkOrderDto = {
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
     * 使用设备ID
     */
    equipmentId?: string;
    /**
     * 工单ID
     */
    id: string;
    /**
     * 是否辅操报工
     */
    isAuxiliary?: boolean;
    /**
     * 业务实际发生时间，不传则默认当前时间
     */
    occurredAt?: string;
    /**
     * 报工时改入库仓ID（整单报工视同末道报工）
     */
    overrideReceiptWarehouseId?: string;
    /**
     * 现场照片 URL 列表
     */
    photoUrls?: Array<string>;
    /**
     * 本次整单完工自动入库仓位ID；仅实际生成完工入库且入库仓严格仓位时必填
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
     * 报工人ID（不传则默认当前登录用户，代他人报工时传入）
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
     * 本次整单完工自动入库的存放位置文本；未启用仓位管控时仅作为位置快照记录
     */
    storageLocation?: string;
};

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BatchReportItemDto = {
    /**
     * 生产批号：按批号/单件序列号追溯的物料必填；不传时系统沿用本工单批号，首次报工自动生成默认批号
     */
    batchNo?: string;
    /**
     * 完成数量
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
     * 是否辅操报工
     */
    isAuxiliary?: boolean;
    /**
     * 业务实际发生时间，不传则默认当前时间
     */
    occurredAt?: string;
    /**
     * 工序ID
     */
    operationId: string;
    /**
     * 现场照片 URL 列表
     */
    photoUrls?: Array<string>;
    /**
     * 本报工项触发完工自动入库时的入库仓位ID；仅实际生成库存入库时按仓库策略校验
     */
    receiptLocationId?: string;
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
     * 报工人ID（不传则该报工项对应工序的指定人员优先，否则默认当前登录用户；代他人报工时传入）
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
     * 报废数量
     */
    scrappedQty?: number;
    /**
     * 末道产出报工时本次已贴码报废产品的实际序列号；选填，未填写的报废数量只按数量记录，不绑定序列号
     */
    scrappedSerialNumbers?: Array<string>;
    /**
     * 末道产出报工时本次实际合格产出的序列号清单
     */
    serialNumbers?: Array<string>;
    /**
     * 本报工项触发完工自动入库时的存放位置文本
     */
    storageLocation?: string;
};

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomHeader } from './BomHeader';
import type { BomItem } from './BomItem';
import type { Material } from './Material';
import type { OutsourcingLossSummary } from './OutsourcingLossSummary';
import type { OutsourcingOrderAllocation } from './OutsourcingOrderAllocation';
import type { OutsourcingOrderIssueMaterial } from './OutsourcingOrderIssueMaterial';
import type { OutsourcingOrderOrigin } from './OutsourcingOrderOrigin';
import type { OutsourcingOrderStatus } from './OutsourcingOrderStatus';
import type { QualityInspection } from './QualityInspection';
import type { StockTransaction } from './StockTransaction';
import type { Supplier } from './Supplier';
import type { TemporaryOutsourcingQualityMode } from './TemporaryOutsourcingQualityMode';
import type { User } from './User';
import type { Warehouse } from './Warehouse';
import type { WorkOrder } from './WorkOrder';
import type { WorkOrderOperation } from './WorkOrderOperation';
export type OutsourcingOrder = {
    /**
     * 当前委外单允许的业务动作
     */
    availableActions?: Array<string>;
    /**
     * BOM 委外组件的稳定来源键；仅 bom_component 使用，作为工单内自动生成的幂等边界
     */
    bomComponentSourceKey?: string | null;
    bomHeader?: BomHeader | null;
    /**
     * BOM 头ID
     */
    bomHeaderId?: string | null;
    bomItem?: BomItem | null;
    /**
     * BOM 行ID
     */
    bomItemId?: string | null;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 委外过程事件
     */
    eventJson: Record<string, any>;
    id: string;
    /**
     * 临时委外客户端幂等键；重复提交返回同一张委外单
     */
    idempotencyKey?: string | null;
    /**
     * 委外发料明细（用料清单，多行子件）
     */
    issueMaterials?: Array<OutsourcingOrderIssueMaterial>;
    /**
     * 已发料数量
     */
    issuedQty: number;
    /**
     * 最近发料批号
     */
    lastIssueBatchNo?: string | null;
    /**
     * 最近发料库存流水
     */
    lastIssueStockTransaction?: StockTransaction | null;
    /**
     * 最近发料库存流水ID
     */
    lastIssueStockTransactionId?: string | null;
    /**
     * 最近发料仓库
     */
    lastIssueWarehouse?: Warehouse | null;
    /**
     * 最近发料仓库ID
     */
    lastIssueWarehouseId?: string | null;
    /**
     * 最近委外质检单
     */
    lastQualityInspection?: QualityInspection | null;
    /**
     * 最近委外质检单ID
     */
    lastQualityInspectionId?: string | null;
    /**
     * 最近收货批号
     */
    lastReceiveBatchNo?: string | null;
    /**
     * 最近收货库存流水
     */
    lastReceiveStockTransaction?: StockTransaction | null;
    /**
     * 最近收货库存流水ID
     */
    lastReceiveStockTransactionId?: string | null;
    /**
     * 最近收货仓库
     */
    lastReceiveWarehouse?: Warehouse | null;
    /**
     * 最近收货仓库ID
     */
    lastReceiveWarehouseId?: string | null;
    /**
     * 委外损耗/差异摘要；不新增报废事实，只归集收货差异、累计不合格和投入退回余额；处置进度以质量处置单为准
     */
    lossSummary?: OutsourcingLossSummary;
    /**
     * 委外收货/产出物料
     */
    material?: Material;
    /**
     * 委外收货/产出物料ID
     */
    materialId: string;
    /**
     * 来源工单工序名称快照
     */
    operationNameSnapshot?: string | null;
    /**
     * 来源工单工序序号快照
     */
    operationSequenceSnapshot?: number | null;
    /**
     * 委外单号
     */
    orderNo: string;
    /**
     * 委外单来源；历史数据默认为手工委外
     */
    origin: OutsourcingOrderOrigin;
    /**
     * 待确认收货数量
     */
    pendingReceiptQty?: number;
    /**
     * 按当前有效排程推导的计划到货时间；工序委外按明确后继工序计划开工时间倒推回货检验入库工作日，BOM 委外组件按对应投料工序的计划开工时间计算；为空表示暂无可推导的要求到货日期；排程变更后更新，不代表供应商承诺
     */
    plannedArrivalAt?: string | null;
    /**
     * 委外计划总时长快照（分钟）= 准备时间 + 单件加工时间 × 委外数量；旧数据可为空
     */
    plannedDurationMinutes?: number | null;
    /**
     * 加工费总额包干（total 模式权威字段）；结算时按已收货数量反算单价。是否含税由 processingFeePriceIncludesTax 决定
     */
    processingFeeAmount?: number | null;
    /**
     * 加工费录入口径：unit=按件单价（processingFeePrice）/ total=按批总额包干（processingFeeAmount）；默认 unit
     */
    processingFeeMode?: OutsourcingOrder.processingFeeMode;
    /**
     * 加工费单价（按件，unit 模式权威字段）；是否含税由 processingFeePriceIncludesTax 决定。维护后委外收货批次成本 = 发料材料成本 + 加工费，未维护则批次成本待补录
     */
    processingFeePrice?: number | null;
    /**
     * 加工费录入价是否含税；含税时结算按税率换算为未税单价进成品成本（进项税单独抵扣）
     */
    processingFeePriceIncludesTax?: boolean | null;
    /**
     * 加工费税率（%）；仅用于含税换算与对账留痕，可抵扣进项税不计入成品成本
     */
    processingFeeTaxRate?: number | null;
    /**
     * 供应商承诺回货日期；临时委外创建时必填，历史及其他来源委外可为空
     */
    promisedReceiptDate?: string | null;
    /**
     * 委外扫码报工二维码版本；重新生成(作废旧码)时递增，扫码 token 的版本需与此一致才有效
     */
    qrTokenVersion: number;
    /**
     * 委外数量
     */
    qty: number;
    /**
     * 合格数量
     */
    qualifiedQty: number;
    /**
     * 已收货数量
     */
    receivedQty: number;
    /**
     * 备注
     */
    remark?: string | null;
    /**
     * 来源工单工序准备时间快照（分钟）；用于解释委外计划总时长
     */
    setupTimeSnapshot?: number | null;
    /**
     * 自动合并委外单的工单工序来源分配与 FIFO 回货进度
     */
    sourceAllocations?: Array<OutsourcingOrderAllocation>;
    /**
     * 触发本委外单的工单单据 BOM 行 ID；仅 bom_component 使用，保留冻结执行依据
     */
    sourceDocumentBomLineId?: string | null;
    /**
     * 触发本委外单的标准 BOM 行 ID；仅无单据 BOM 回退时使用
     */
    sourceStandardBomItemId?: string | null;
    /**
     * 来源工单工序单件加工时间快照（分钟/件）；委外和自制统一使用该计划口径
     */
    standardTimeSnapshot?: number | null;
    /**
     * 委外状态
     */
    status: OutsourcingOrderStatus;
    /**
     * 建议收货仓：按产出物料默认完工入库仓解析；为空表示没有可用默认仓，仅作动作默认值，不保存
     */
    suggestedReceiveWarehouse?: Warehouse | null;
    supplier?: Supplier | null;
    /**
     * 供应商ID
     */
    supplierId?: string | null;
    /**
     * 临时委外 IPQC 模板快照；仅 temporary_operation 使用
     */
    temporaryOutsourcingInspectionTemplateIdSnapshot?: string | null;
    /**
     * 临时委外质量策略快照；仅 temporary_operation 使用
     */
    temporaryOutsourcingQualityModeSnapshot?: TemporaryOutsourcingQualityMode | null;
    /**
     * 单位
     */
    unit: string;
    /**
     * 不合格数量
     */
    unqualifiedQty: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    workOrder?: WorkOrder | null;
    /**
     * 工单ID
     */
    workOrderId?: string | null;
    /**
     * 来源工单工序
     */
    workOrderOperation?: WorkOrderOperation | null;
    /**
     * 来源工单工序ID
     */
    workOrderOperationId?: string | null;
    /**
     * 已回写到工单工序完成数量的委外累计数量
     */
    workOrderOperationReportedQty: number;
};
export namespace OutsourcingOrder {
    /**
     * 加工费录入口径：unit=按件单价（processingFeePrice）/ total=按批总额包干（processingFeeAmount）；默认 unit
     */
    export enum processingFeeMode {
        UNIT = 'unit',
        TOTAL = 'total',
    }
}

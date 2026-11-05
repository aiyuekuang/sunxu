import type { Customer } from './Customer.d.ts';
import type { FqcLotFormationMode } from './FqcLotFormationMode.d.ts';
import type { InspectionStatus } from './InspectionStatus.d.ts';
import type { InspectionType } from './InspectionType.d.ts';
import type { Material } from './Material.d.ts';
import type { OutsourcingReceiptOrder } from './OutsourcingReceiptOrder.d.ts';
import type { PurchaseReceiptItem } from './PurchaseReceiptItem.d.ts';
import type { PurchaseReceiptOrder } from './PurchaseReceiptOrder.d.ts';
import type { QualityDefect } from './QualityDefect.d.ts';
import type { QualityInspectionCoverage } from './QualityInspectionCoverage.d.ts';
import type { QualityInspectionItem } from './QualityInspectionItem.d.ts';
import type { QualityInspectionRecord } from './QualityInspectionRecord.d.ts';
import type { SaleDeliveryItem } from './SaleDeliveryItem.d.ts';
import type { SaleDeliveryOrder } from './SaleDeliveryOrder.d.ts';
import type { User } from './User.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
export type QualityInspectionListItemDto = {
    /**
     * 被哪个新检验单修正
     */
    amendedBy?: string | null;
    /**
     * 从哪个检验单修正而来
     */
    amendedFrom?: string | null;
    /**
     * 当前可用业务动作
     */
    availableActions: Array<string>;
    batchNo?: string | null;
    /**
     * 生产业务日 YYYY-MM-DD
     */
    businessDate?: string | null;
    /**
     * 取消原因
     */
    cancelReason?: string | null;
    companyId: string;
    conclusion?: string | null;
    /**
     * 本质检单覆盖的报工产出明细（IPQC/FQC）
     */
    coverages?: Array<QualityInspectionCoverage>;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    customer?: Customer | null;
    customerId?: string | null;
    /**
     * 客户名称
     */
    customerName?: string | null;
    defects?: Array<QualityDefect>;
    disposalNote?: string | null;
    failQty: number;
    /**
     * 命中的 FQC 质量控制规则ID快照
     */
    fqcControlRuleId?: string | null;
    id: string;
    /**
     * 自动IPQC周期幂等键；同公司、同工单工序、同生产批次只允许一张有效质检单
     */
    inspectionCycleKey?: string | null;
    /**
     * 检验批代表的整批业务数量；sampleQty 仅表示实际抽样数量，IQC/FQC均使用
     */
    inspectionLotQty?: number | null;
    inspectionNo: string;
    inspector?: User | null;
    inspectorId?: string | null;
    /**
     * 检验员姓名
     */
    inspectorName?: string | null;
    isAutoCreated: boolean;
    /**
     * 是否为升级前历史FQC；仅历史单允许沿用无coverage的旧门控
     */
    isLegacyFqc: boolean;
    items?: Array<QualityInspectionItem>;
    /**
     * 自动 FQC 形成规则的历史快照
     */
    lotFormationMode?: FqcLotFormationMode | null;
    /**
     * 检验批封批时间；封批后不得继续归集新报工
     */
    lotSealedAt?: string | null;
    /**
     * 检验批归集键；自动FQC幂等归集使用
     */
    lotWindowKey?: string | null;
    material?: Material;
    /**
     * 物料档案编码
     */
    materialCode?: string | null;
    materialId: string;
    /**
     * 物料档案名称
     */
    materialName?: string | null;
    /**
     * 规格型号
     */
    materialSpec?: string | null;
    operationId?: string | null;
    outsourcingReceiptOrder?: OutsourcingReceiptOrder | null;
    /**
     * 来源委外收货单ID（临时委外 IPQC 的权威关联）
     */
    outsourcingReceiptOrderId?: string | null;
    passQty: number;
    photoUrls: Array<string>;
    purchaseReceiptItem?: PurchaseReceiptItem | null;
    /**
     * 来源采购入库单明细ID（IQC自动创建与入库门禁的权威关联）
     */
    purchaseReceiptItemId?: string | null;
    purchaseReceiptOrder?: PurchaseReceiptOrder | null;
    /**
     * 来源采购入库单ID（IQC自动创建时写入）
     */
    purchaseReceiptOrderId?: string | null;
    records?: Array<QualityInspectionRecord>;
    remarks?: string | null;
    /**
     * 应完成的有效检查记录数（从质检模板快照，默认1）
     */
    requiredRecordCount: number;
    saleDeliveryItem?: SaleDeliveryItem | null;
    /**
     * 来源销售出库单明细ID（OQC自动创建与出库门禁的权威关联）
     */
    saleDeliveryItemId?: string | null;
    saleDeliveryOrder?: SaleDeliveryOrder | null;
    /**
     * 来源销售出库单ID（OQC自动创建与出库门禁的权威关联）
     */
    saleDeliveryOrderId?: string | null;
    sampleQty: number;
    /**
     * 班次日历ID快照
     */
    shiftCalendarId?: string | null;
    /**
     * 班次编码快照
     */
    shiftCode?: string | null;
    /**
     * 班次实例结束时间快照
     */
    shiftEndedAt?: string | null;
    /**
     * 班次名称快照
     */
    shiftName?: string | null;
    /**
     * 班次实例开始时间快照
     */
    shiftStartedAt?: string | null;
    status: InspectionStatus;
    submittedAt?: string | null;
    supplierId?: string | null;
    templateId?: string | null;
    /**
     * 自动建单时冻结的模板抽样数量；FQC 归集时不得受模板后续修改影响
     */
    templateSampleSizeSnapshot?: number | null;
    /**
     * 自动建单时冻结的模板抽样方式；FQC 归集时不得受模板后续修改影响
     */
    templateSamplingMethodSnapshot?: string | null;
    type: InspectionType;
    /**
     * 库存基础单位
     */
    unit?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    workOrder?: WorkOrder | null;
    workOrderId?: string | null;
};

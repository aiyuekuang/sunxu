import type { BatchStatus } from './BatchStatus.d.ts';
import type { InventoryOwnerType } from './InventoryOwnerType.d.ts';
import type { Material } from './Material.d.ts';
import type { MaterialBatchSourceDocType } from './MaterialBatchSourceDocType.d.ts';
import type { Supplier } from './Supplier.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type MaterialBatch = {
    allocationRefId?: string | null;
    allocationRefType?: string | null;
    batchNo: string;
    companyId: string;
    /**
     * 成本币别
     */
    costCurrency?: string | null;
    /**
     * 成本快照 JSON：原始价格、税率、价税口径、多次入库明细 entries[]、结算依据 settlement
     */
    costSnapshot?: Record<string, any> | null;
    /**
     * 成本来源
     */
    costSource?: MaterialBatch.costSource | null;
    /**
     * 成本状态：pending=待结算，settled=已定；空视为未维护
     */
    costStatus?: MaterialBatch.costStatus | null;
    /**
     * 成本单价快照（未税）：采购价 / 工单结算成本 / 委外成本 / 手工补录价；不随价目表修改
     */
    costUnitPrice?: number | null;
    createdAt: string;
    expiryDate?: string | null;
    /**
     * 入库批次等级（material_grade 字典值）
     */
    grade?: string | null;
    id: string;
    location?: WarehouseLocation | null;
    /**
     * 当前仓位ID
     */
    locationId?: string | null;
    material?: Material;
    materialId: string;
    /**
     * 批次归属方 ID；公司自有库存默认等于 companyId
     */
    ownerRefId: string;
    /**
     * 批次归属方类型，默认 company=公司自有库存
     */
    ownerType: InventoryOwnerType;
    productionDate?: string | null;
    /**
     * 采购入库单明细ID（costSource=purchase 时）
     */
    purchaseReceiptItemId?: string | null;
    qty: number;
    sourceDocId?: string | null;
    /**
     * 批次来源类型：purchase_receipt=外部采购来料，work_order=内部完工入库
     */
    sourceDocType?: MaterialBatchSourceDocType;
    status: BatchStatus;
    statusReason?: string | null;
    /**
     * 批次入库时的仓位快照
     */
    storageLocationSnapshot?: string | null;
    supplier?: Supplier | null;
    /**
     * 供应商原始来料批号，入库确认从采购入库单行传播，用于外部追责/质量召回
     */
    supplierBatchNo?: string | null;
    supplierId?: string | null;
    /**
     * 来源价目行ID
     */
    supplierPriceTierId?: string | null;
    updatedAt: string;
    warehouse?: Warehouse;
    warehouseId: string;
};
export declare namespace MaterialBatch {
    /**
     * 成本来源
     */
    enum costSource {
        PURCHASE = "purchase",
        MANUFACTURE = "manufacture",
        OUTSOURCING = "outsourcing",
        CONVERSION = "conversion",
        MANUAL = "manual",
        OPENING = "opening"
    }
    /**
     * 成本状态：pending=待结算，settled=已定；空视为未维护
     */
    enum costStatus {
        NONE = "none",
        PENDING = "pending",
        SETTLED = "settled"
    }
}

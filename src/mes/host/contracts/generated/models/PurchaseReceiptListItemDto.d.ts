import type { IncomingQualityGateStatus } from './IncomingQualityGateStatus.d.ts';
import type { PurchaseOrder } from './PurchaseOrder.d.ts';
import type { PurchaseReceiptActualWarehouseSummaryDto } from './PurchaseReceiptActualWarehouseSummaryDto.d.ts';
import type { PurchaseReceiptItem } from './PurchaseReceiptItem.d.ts';
import type { PurchaseReceiptStatus } from './PurchaseReceiptStatus.d.ts';
import type { Supplier } from './Supplier.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
export type PurchaseReceiptListItemDto = {
    /**
     * 正数量明细的实际入库仓汇总；由明细 warehouseId 派生，混仓时用于列表展示
     */
    actualWarehouses: Array<PurchaseReceiptActualWarehouseSummaryDto>;
    /**
     * 地址快照
     */
    addressSnapshot?: string | null;
    /**
     * 当前可用业务动作
     */
    availableActions: Array<string>;
    /**
     * 收货动作请求内容指纹；与 clientRequestId 一起防止复用幂等键提交另一份业务数据。
     */
    clientRequestFingerprint: string | null;
    /**
     * 收货动作客户端幂等键；同公司内重复提交返回同一张采购入库单
     */
    clientRequestId?: string | null;
    companyId: string;
    /**
     * 联系人快照
     */
    contactNameSnapshot?: string | null;
    /**
     * 联系电话快照
     */
    contactPhoneSnapshot?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    defaultWarehouse?: Warehouse | null;
    /**
     * 表头默认入库仓ID
     */
    defaultWarehouseId?: string | null;
    id: string;
    /**
     * 明细行数
     */
    itemCount: number;
    items?: Array<PurchaseReceiptItem>;
    /**
     * 往来方名称快照
     */
    partnerNameSnapshot?: string | null;
    /**
     * 送货单据照片URL列表
     */
    photoUrls: Array<string>;
    purchaseOrder?: PurchaseOrder | null;
    /**
     * 无采购订单入库的受控例外原因
     */
    purchaseOrderExceptionReason?: string | null;
    purchaseOrderId?: string | null;
    /**
     * 采购订单号
     */
    purchaseOrderNo?: string | null;
    /**
     * 整单质量门禁说明
     */
    qualityGateReason?: string | null;
    /**
     * 整单采购入库单质量门禁状态（按明细汇总，运行时派生）
     */
    qualityGateStatus?: IncomingQualityGateStatus;
    /**
     * 实际采购入库单日期
     */
    receiptDate?: string | null;
    receiptNo: string;
    remarks?: string | null;
    /**
     * 采购入库单冲正日期
     */
    reversalDate?: string | null;
    status: PurchaseReceiptStatus;
    supplier?: Supplier | null;
    /**
     * 供应商送货单号
     */
    supplierDeliveryNo?: string | null;
    supplierId?: string | null;
    /**
     * 供应商名称
     */
    supplierName?: string | null;
    /**
     * 是否存在待执行的供应商物料价格同步
     */
    syncSupplierPricePending: boolean;
    /**
     * 订单总金额；存在未定价明细时为空
     */
    totalAmount?: number | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    warehouse?: Warehouse | null;
    /**
     * 兼容仓库摘要；实际入库仓以明细行 warehouseId 为准
     */
    warehouseId?: string | null;
};

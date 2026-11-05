import type { PurchaseOrder } from './PurchaseOrder.d.ts';
import type { PurchaseReceiptOrder } from './PurchaseReceiptOrder.d.ts';
import type { PurchaseReturnDeductionLine } from './PurchaseReturnDeductionLine.d.ts';
import type { PurchaseReturnFinancialAction } from './PurchaseReturnFinancialAction.d.ts';
import type { PurchaseReturnItem } from './PurchaseReturnItem.d.ts';
import type { PurchaseReturnStatus } from './PurchaseReturnStatus.d.ts';
import type { PurchaseReturnType } from './PurchaseReturnType.d.ts';
import type { Supplier } from './Supplier.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
export type PurchaseReturnListItemDto = {
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    deductionLines?: Array<PurchaseReturnDeductionLine>;
    financialAction: PurchaseReturnFinancialAction;
    id: string;
    inspectionRequired: boolean;
    /**
     * 明细行数
     */
    itemCount: number;
    items?: Array<PurchaseReturnItem>;
    /**
     * 实际退库出库日期
     */
    outboundDate?: string | null;
    outboundWarehouse?: Warehouse | null;
    outboundWarehouseId?: string | null;
    /**
     * 退库仓库名称
     */
    outboundWarehouseName?: string | null;
    partnerNameSnapshot?: string | null;
    reasonCode?: string | null;
    /**
     * 退货原因名称快照
     */
    reasonLabelSnapshot?: string | null;
    remarks?: string | null;
    returnDate?: string | null;
    returnNo: string;
    returnType: PurchaseReturnType;
    /**
     * 采购退料冲正日期
     */
    reversalDate?: string | null;
    /**
     * 冲正原因
     */
    reversalReason?: string | null;
    /**
     * 冲正时间
     */
    reversedAt?: string | null;
    /**
     * 冲正人ID
     */
    reversedBy?: string | null;
    /**
     * 冲正人
     */
    reverser?: User | null;
    sourcePurchaseOrder?: PurchaseOrder | null;
    sourcePurchaseOrderId?: string | null;
    /**
     * 来源采购订单号
     */
    sourcePurchaseOrderNo?: string | null;
    sourceReceipt?: PurchaseReceiptOrder | null;
    sourceReceiptId?: string | null;
    /**
     * 来源采购入库单编号
     */
    sourceReceiptNo?: string | null;
    status: PurchaseReturnStatus;
    /**
     * 状态显示颜色
     */
    statusColor: string;
    /**
     * 状态显示文案
     */
    statusLabel: string;
    supplier?: Supplier | null;
    supplierId?: string | null;
    /**
     * 供应商名称
     */
    supplierName?: string | null;
    /**
     * 退货总金额；存在未定价明细时为空
     */
    totalAmount?: number | null;
    /**
     * 退库出库总数量
     */
    totalOutboundQty: number;
    /**
     * 申请退货总数量
     */
    totalReturnQty: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

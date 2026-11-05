import type { PurchaseOrder } from './PurchaseOrder.d.ts';
import type { PurchaseReceiptOrder } from './PurchaseReceiptOrder.d.ts';
import type { PurchaseReturnDeductionLine } from './PurchaseReturnDeductionLine.d.ts';
import type { PurchaseReturnFinanceDocumentSummaryDto } from './PurchaseReturnFinanceDocumentSummaryDto.d.ts';
import type { PurchaseReturnFinancialAction } from './PurchaseReturnFinancialAction.d.ts';
import type { PurchaseReturnItem } from './PurchaseReturnItem.d.ts';
import type { PurchaseReturnReversalSummaryDto } from './PurchaseReturnReversalSummaryDto.d.ts';
import type { PurchaseReturnStatus } from './PurchaseReturnStatus.d.ts';
import type { PurchaseReturnType } from './PurchaseReturnType.d.ts';
import type { Supplier } from './Supplier.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
export type PurchaseReturnDetailDto = {
    /**
     * 当前可用业务动作
     */
    availableActions: Array<string>;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 采购退料产生的供应商贷项通知
     */
    creditNote?: PurchaseReturnFinanceDocumentSummaryDto | null;
    /**
     * 采购退料协商扣款应付单
     */
    deductionInvoice?: PurchaseReturnFinanceDocumentSummaryDto | null;
    deductionLines?: Array<PurchaseReturnDeductionLine>;
    /**
     * 扣款合计（Σ扣款明细金额）
     */
    deductionTotal: number;
    financialAction: PurchaseReturnFinancialAction;
    id: string;
    inspectionRequired: boolean;
    /**
     * 明细行数
     */
    itemCount: number;
    items?: Array<PurchaseReturnItem>;
    /**
     * 实退金额 = 退货总金额 − 扣款合计；存在未定价明细时为空
     */
    netRefundAmount?: number | null;
    /**
     * 实际退库出库日期
     */
    outboundDate?: string | null;
    outboundWarehouse?: Warehouse | null;
    outboundWarehouseId?: string | null;
    partnerNameSnapshot?: string | null;
    /**
     * 当前用户是否可见采购退料价格与金额
     */
    priceVisible: boolean;
    reasonCode?: string | null;
    /**
     * 退货原因名称快照
     */
    reasonLabelSnapshot?: string | null;
    /**
     * 采购退料供应商退款收款单
     */
    refundPayment?: PurchaseReturnFinanceDocumentSummaryDto | null;
    remarks?: string | null;
    returnDate?: string | null;
    returnNo: string;
    returnType: PurchaseReturnType;
    /**
     * 冲正信息
     */
    reversal?: PurchaseReturnReversalSummaryDto | null;
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
    /**
     * 创建来源方式：采购入库单下推 / 按现存库存退料
     */
    sourceMode: PurchaseReturnDetailDto.sourceMode;
    sourcePurchaseOrder?: PurchaseOrder | null;
    sourcePurchaseOrderId?: string | null;
    sourceReceipt?: PurchaseReceiptOrder | null;
    sourceReceiptId?: string | null;
    status: PurchaseReturnStatus;
    supplier?: Supplier | null;
    supplierId?: string | null;
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
export declare namespace PurchaseReturnDetailDto {
    /**
     * 创建来源方式：采购入库单下推 / 按现存库存退料
     */
    enum sourceMode {
        PURCHASE_RECEIPT = "purchase_receipt",
        INDEPENDENT_INVENTORY = "independent_inventory"
    }
}

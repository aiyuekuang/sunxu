import type { FinanceBillingRequirement } from './FinanceBillingRequirement.d.ts';
import type { FinanceBillingSource } from './FinanceBillingSource.d.ts';
import type { FinanceBillingStatus } from './FinanceBillingStatus.d.ts';
import type { FinanceInvoiceCategory } from './FinanceInvoiceCategory.d.ts';
import type { FinanceInvoiceStatus } from './FinanceInvoiceStatus.d.ts';
import type { FinanceInvoiceType } from './FinanceInvoiceType.d.ts';
import type { FinanceRecognitionBasis } from './FinanceRecognitionBasis.d.ts';
import type { User } from './User.d.ts';
export type FinanceInvoiceListItemDto = {
    amount: number;
    /**
     * 当前单据允许的业务操作
     */
    availableActions?: Array<string>;
    /**
     * 需开票金额；需开票时默认等于单据金额
     */
    billableAmount: number;
    /**
     * 已开票金额快照；非税务权威
     */
    billedAmount: number;
    /**
     * 开票要求：需开票/无需开票/未知；不是税务发票本身
     */
    billingRequirement: FinanceBillingRequirement;
    /**
     * 已开票金额来源；未登记时为空
     */
    billingSource?: FinanceBillingSource | null;
    /**
     * 开票状态快照；权威来源优先为完整财务 ERP 税票台账
     */
    billingStatus: FinanceBillingStatus;
    /**
     * 取消时间
     */
    cancelledAt?: string | null;
    /**
     * 取消操作人ID
     */
    cancelledBy?: string | null;
    /**
     * 取消操作人
     */
    canceller?: User | null;
    category: FinanceInvoiceCategory;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 币种；未知时为空，不做默认兜底
     */
    currency?: string | null;
    description?: string | null;
    dueDate: string;
    /**
     * 汇率；未知时为空，不做默认兜底
     */
    exchangeRate?: number | null;
    id: string;
    invoiceDate: string;
    invoiceNo: string;
    operator?: User | null;
    operatorId?: string | null;
    paidAmount: number;
    partnerCode: string;
    partnerId: string;
    partnerName: string;
    /**
     * 正式应收应付的确认依据
     */
    recognitionBasis?: FinanceRecognitionBasis | null;
    /**
     * 确认日期
     */
    recognitionDate?: string | null;
    /**
     * 确认依据来源ID
     */
    recognitionSourceId?: string | null;
    residualAmount: number;
    /**
     * 应收/应付单作废的实际冲销日期
     */
    reversalDate?: string | null;
    saleOrderId?: string | null;
    /**
     * 关联销售订单号；仅财务单据明确关联一个销售订单时返回；为空表示未唯一关联销售订单，汇总多个订单来源时不指定单一订单
     */
    saleOrderNo: string | null;
    sourceId?: string | null;
    sourceNo?: string | null;
    sourceType?: string | null;
    status: FinanceInvoiceStatus;
    type: FinanceInvoiceType;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

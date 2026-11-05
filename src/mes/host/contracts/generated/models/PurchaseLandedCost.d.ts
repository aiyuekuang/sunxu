import type { AccountingExpenseType } from './AccountingExpenseType.d.ts';
import type { FinanceInvoice } from './FinanceInvoice.d.ts';
import type { PurchaseLandedCostAllocation } from './PurchaseLandedCostAllocation.d.ts';
import type { Supplier } from './Supplier.d.ts';
import type { User } from './User.d.ts';
export type PurchaseLandedCost = {
    /**
     * 分摊基数
     */
    allocationBasis: PurchaseLandedCost.allocationBasis;
    allocations: Array<PurchaseLandedCostAllocation>;
    /**
     * 价税合计/派生物流商应付金额；红字冲销为负数
     */
    amount: number;
    /**
     * 不含税可资本化成本金额；红字冲销为负数
     */
    amountExcludingTax: number;
    /**
     * 当前单据允许的业务操作
     */
    availableActions?: Array<string>;
    /**
     * 成本确认业务日期
     */
    businessDate: string;
    carrier?: Supplier;
    /**
     * 承运方/物流商供应商ID
     */
    carrierId: string;
    /**
     * 物流商名称快照
     */
    carrierNameSnapshot?: Record<string, any> | null;
    companyId: string;
    confirmedAt?: string | null;
    confirmedBy?: string | null;
    /**
     * 采购附加费用分摊单号
     */
    costNo: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 交易币别
     */
    currency: string;
    /**
     * 单据类型
     */
    documentType: PurchaseLandedCost.documentType;
    /**
     * 交易币别兑本位币汇率
     */
    exchangeRate: number;
    expenseType?: AccountingExpenseType;
    /**
     * 费用类型编码快照
     */
    expenseTypeCodeSnapshot?: Record<string, any> | null;
    /**
     * 费用类型ID
     */
    expenseTypeId: string;
    /**
     * 费用类型名称快照
     */
    expenseTypeNameSnapshot?: Record<string, any> | null;
    /**
     * 物流账单号或运单号；同承运方、同公司内唯一
     */
    externalRefNo: string;
    financeInvoice?: FinanceInvoice | null;
    /**
     * 派生物流商应付/贷项ID
     */
    financeInvoiceId?: string | null;
    id: string;
    /**
     * 备注
     */
    remark?: string | null;
    reversalOf?: PurchaseLandedCost | null;
    /**
     * 被冲销的原分摊单ID
     */
    reversalOfId?: string | null;
    /**
     * 冲销原因
     */
    reversalReason?: string | null;
    reversedAt?: string | null;
    reversedBy?: string | null;
    /**
     * 单据状态
     */
    status: PurchaseLandedCost.status;
    /**
     * 税额；红字冲销为负数，不计入采购存货成本
     */
    taxAmount: number;
    /**
     * 税率（%）；未取得税务信息时为空，不能据此猜算税额
     */
    taxRate?: number | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
export declare namespace PurchaseLandedCost {
    /**
     * 分摊基数
     */
    enum allocationBasis {
        AMOUNT = "amount",
        QUANTITY = "quantity",
        WEIGHT = "weight",
        MANUAL = "manual"
    }
    /**
     * 单据类型
     */
    enum documentType {
        NORMAL = "normal",
        CREDIT = "credit"
    }
    /**
     * 单据状态
     */
    enum status {
        DRAFT = "draft",
        SUBMITTED = "submitted",
        CONFIRMED = "confirmed",
        REVERSED = "reversed",
        CANCELLED = "cancelled"
    }
}

import type { FinanceInvoice } from './FinanceInvoice.d.ts';
import type { FinanceInvoiceType } from './FinanceInvoiceType.d.ts';
import type { StatementLineDto } from './StatementLineDto.d.ts';
export type StatementResponseDto = {
    /**
     * 往来余额（兼容字段，等于期末余额 closingBalance）
     */
    balance: number;
    /**
     * 期末余额 = 期初 + 本期开单 + 本期贷项 − 本期收付款
     */
    closingBalance: number;
    /**
     * 期末待冲抵贷项余额（按核销日期截至期末回溯，负数）
     */
    creditNoteAmount: number;
    /**
     * 本对账单的原币币别；无发生额且未选择币别时为空
     */
    currency?: string | null;
    /**
     * 起始日期
     */
    dateFrom?: string | null;
    /**
     * 截止日期
     */
    dateTo?: string | null;
    /**
     * 本期内单据明细（兼容字段，与 lines 中单据行同源）
     */
    invoices: Array<FinanceInvoice>;
    /**
     * 本期流水行（单据/贷项/收付款按日期混排，含滚动余额）
     */
    lines: Array<StatementLineDto>;
    /**
     * 期末未核销收付款（预收/预付等待应用信用，正数）
     */
    openCreditAmount: number;
    /**
     * 期初余额（期间起始日前：单据签名金额合计 − 收付款合计）
     */
    openingBalance: number;
    /**
     * 期末未清单据合计（按核销日期截至期末回溯）
     */
    outstandingAmount: number;
    /**
     * 往来单位编码
     */
    partnerCode: string;
    /**
     * 往来单位ID
     */
    partnerId: string;
    /**
     * 往来单位名称
     */
    partnerName: string;
    /**
     * 本期贷项合计（负数）；期末 = 期初 + 本期开单 + 本期贷项 − 本期收付款
     */
    periodCreditNoteAmount: number;
    /**
     * 期前累计贷项（负数）
     */
    priorCreditNoteAmount: number;
    /**
     * 期前累计开单（仅正单，正数）
     */
    priorInvoicedAmount: number;
    /**
     * 期前累计收付款（正数），对外对账口径的「上期已付/已收金额」
     */
    priorPaidAmount: number;
    /**
     * 本期开单合计（仅正单）
     */
    totalInvoiced: number;
    /**
     * 本期收付款合计
     */
    totalPaid: number;
    type: FinanceInvoiceType;
};

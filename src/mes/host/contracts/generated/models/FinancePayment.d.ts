import type { FinancePaymentBusinessCategory } from './FinancePaymentBusinessCategory.d.ts';
import type { FinancePaymentStatus } from './FinancePaymentStatus.d.ts';
import type { FinancePaymentType } from './FinancePaymentType.d.ts';
import type { FundsAccount } from './FundsAccount.d.ts';
import type { User } from './User.d.ts';
export type FinancePayment = {
    allocatedAmount: number;
    amount: number;
    /**
     * 当前收付款单允许的业务操作
     */
    availableActions?: Array<string>;
    /**
     * Core 收付款业务类别（受限）；出纳类业务归属完整财务 ERP
     */
    businessCategory: FinancePaymentBusinessCategory;
    /**
     * 撤销时间
     */
    cancelledAt?: string | null;
    /**
     * 撤销操作人ID
     */
    cancelledBy?: string | null;
    /**
     * 撤销操作人
     */
    canceller?: User | null;
    /**
     * 明确选择的资金账户编码；仅作为来源事实透传给完整财务 ERP，Core 不据此生成资金流水
     */
    cashBankAccountCode?: string | null;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 币种；未知时为空，不做默认兜底
     */
    currency?: string | null;
    description?: string | null;
    /**
     * 汇率；未知时为空，不做默认兜底
     */
    exchangeRate?: number | null;
    fundsAccount?: FundsAccount | null;
    /**
     * 核心资金账户：创建收付款时选择、据此生成核心资金流水（单一资金真相）。
     * 落在本单上作为账户事实的权威归属，列表/详情/导出直接读关联展示；
     * cashBankAccountCode 是另一事实（透传完整财务 ERP 的账户编码），二者并存不冲突。
     */
    fundsAccountId?: string | null;
    id: string;
    operator?: User | null;
    operatorId?: string | null;
    partnerCode: string;
    partnerId: string;
    partnerName: string;
    paymentDate: string;
    paymentMethod?: string | null;
    paymentNo: string;
    /**
     * 来源付款申请 ID；用于审批后付款执行幂等
     */
    paymentRequestId?: string | null;
    referenceNo?: string | null;
    /**
     * 业务来源ID；系统生成收付款用于来源幂等与追溯
     */
    sourceId?: string | null;
    /**
     * 业务来源类型；系统生成收付款用于来源幂等与追溯
     */
    sourceType?: string | null;
    /**
     * 单据状态：active 有效 / cancelled 已撤销（撤销留档不删除，保持可追溯）
     */
    status: FinancePaymentStatus;
    type: FinancePaymentType;
    unallocatedAmount: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

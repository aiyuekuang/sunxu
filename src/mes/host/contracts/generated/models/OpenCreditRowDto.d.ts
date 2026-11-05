import type { FinancePaymentType } from './FinancePaymentType.d.ts';
import type { OpenCreditSourceType } from './OpenCreditSourceType.d.ts';
export type OpenCreditRowDto = {
    /**
     * 当前可用余额
     */
    availableAmount: number;
    /**
     * 原始信用金额
     */
    creditAmount: number;
    /**
     * 备注
     */
    description?: string | null;
    /**
     * 信用方向
     */
    direction: FinancePaymentType;
    /**
     * 单据日期
     */
    documentDate: string;
    /**
     * 来源单号
     */
    documentNo: string;
    /**
     * 显示行ID
     */
    id: string;
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
     * 参考号
     */
    referenceNo?: string | null;
    /**
     * 来源单据ID
     */
    sourceId: string;
    /**
     * 来源类型
     */
    sourceType: OpenCreditSourceType;
};

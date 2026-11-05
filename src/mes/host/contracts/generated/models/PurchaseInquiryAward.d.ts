import type { PurchaseInquiryAwardItem } from './PurchaseInquiryAwardItem.d.ts';
import type { PurchaseInquiryAwardStatus } from './PurchaseInquiryAwardStatus.d.ts';
import type { User } from './User.d.ts';
export type PurchaseInquiryAward = {
    /**
     * 定标原因
     */
    awardReason?: string | null;
    /**
     * 定标时间
     */
    awardedAt?: string | null;
    awardedBy?: User | null;
    /**
     * 定标人ID
     */
    awardedById?: string | null;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    /**
     * 采购询价
     */
    inquiry?: Record<string, any>;
    /**
     * 询价单ID
     */
    inquiryId: string;
    /**
     * 定标明细
     */
    items?: Array<PurchaseInquiryAwardItem>;
    /**
     * 定标状态
     */
    status: PurchaseInquiryAwardStatus;
    /**
     * 定标总金额
     */
    totalAmount: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

import type { CustomerStatus } from './CustomerStatus.d.ts';
import type { User } from './User.d.ts';
export type Customer = {
    address?: string | null;
    companyId: string;
    contactEmail?: string | null;
    /**
     * 飞书账号
     */
    contactFeishu?: string | null;
    contactName?: string | null;
    contactPhone?: string | null;
    /**
     * 微信号
     */
    contactWechat?: string | null;
    /**
     * 企业微信账号
     */
    contactWecom?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    creditLimit?: number | null;
    customerCode: string;
    id: string;
    industry?: string | null;
    level?: string | null;
    name: string;
    paymentTerms?: string | null;
    /**
     * 客户订单进度公开查询二维码是否启用
     */
    portalEnabled: boolean;
    /**
     * 客户订单进度二维码版本；重新生成时递增，旧码立即失效
     */
    portalQrTokenVersion: number;
    /**
     * 客户订单查询二维码是否允许查看该客户来料库存
     */
    portalStockVisible: boolean;
    remarks?: string | null;
    salesRep?: User | null;
    salesRepId?: string | null;
    shortName?: string | null;
    status: CustomerStatus;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

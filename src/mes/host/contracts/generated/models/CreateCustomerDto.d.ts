export type CreateCustomerDto = {
    address?: string;
    contactEmail?: string;
    /**
     * 飞书账号
     */
    contactFeishu?: string;
    contactName?: string;
    contactPhone?: string;
    /**
     * 微信号
     */
    contactWechat?: string;
    /**
     * 企业微信账号
     */
    contactWecom?: string;
    /**
     * 信用额度
     */
    creditLimit?: number;
    customerCode?: string;
    /**
     * 所属行业（字典：customer_industry）
     */
    industry?: string;
    level?: string;
    name: string;
    /**
     * 收款条件（字典：payment_terms）
     */
    paymentTerms?: string;
    remarks?: string;
    /**
     * 负责销售员ID
     */
    salesRepId?: string;
    shortName?: string;
};

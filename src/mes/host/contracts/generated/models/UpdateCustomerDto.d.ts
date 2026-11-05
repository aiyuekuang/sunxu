export type UpdateCustomerDto = {
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
    creditLimit?: number;
    id: string;
    industry?: string;
    level?: string;
    name?: string;
    paymentTerms?: string;
    remarks?: string;
    /**
     * 负责销售员ID
     */
    salesRepId?: string;
    shortName?: string;
    status?: UpdateCustomerDto.status;
};
export declare namespace UpdateCustomerDto {
    enum status {
        ACTIVE = "active",
        INACTIVE = "inactive"
    }
}

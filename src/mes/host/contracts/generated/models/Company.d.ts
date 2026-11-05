export type Company = {
    appDownloadUrl?: string | null;
    children?: Array<Company>;
    companyNo?: string | null;
    contactName?: string | null;
    contactPhone?: string | null;
    createdAt: string;
    /**
     * 公司默认币种
     */
    defaultCurrency: string;
    description?: string | null;
    expireDate?: string | null;
    id: string;
    level: number;
    lockReason?: string | null;
    /**
     * 公司 Logo 图片地址
     */
    logoUrl?: string | null;
    manufacturingType: string | null;
    maxSeats: number;
    name: string;
    overheadRate: number;
    parent?: Company;
    parentId?: string | null;
    path?: string | null;
    planType: string;
    status: number;
    updatedAt: string;
    /**
     * 是否通过官方 SaaS 更新源提供 App 更新
     */
    useOfficialAppUpdate: boolean;
};

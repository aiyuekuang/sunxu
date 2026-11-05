import type { User } from './User.d.ts';
export type TemporaryWorker = {
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    /**
     * 临时工姓名
     */
    name: string;
    /**
     * 归一化后的手机号（公司内唯一）
     */
    phone: string;
    /**
     * 登记来源：admin=管理端，qr_portal=扫码页
     */
    registrationSource: string;
    /**
     * 备注
     */
    remark?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    /**
     * 实际合作截止日；扫码登记后由管理员补录
     */
    validUntil?: string | null;
};

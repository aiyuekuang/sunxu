/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type FundsAccount = {
    /**
     * 银行账号
     */
    accountNo?: string | null;
    /**
     * 账户类型
     */
    accountType: FundsAccount.accountType;
    /**
     * 开户行
     */
    bankName?: string | null;
    /**
     * 账户编码（公司内唯一）
     */
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 币种
     */
    currency: string;
    /**
     * 当前余额（由资金流水驱动，禁手改）
     */
    currentBalance: number;
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    /**
     * 账户名称
     */
    name: string;
    /**
     * 期初余额
     */
    openingBalance: number;
    /**
     * 备注
     */
    remark?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
export namespace FundsAccount {
    /**
     * 账户类型
     */
    export enum accountType {
        CASH = 'cash',
        BANK = 'bank',
        ONLINE = 'online',
        OTHER = 'other',
    }
}

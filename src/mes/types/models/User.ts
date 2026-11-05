/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from './Company';
export type User = {
    companies?: Array<Company>;
    company?: Company;
    companyId?: string | null;
    createdAt: string;
    deletedAt?: string | null;
    department?: Record<string, any>;
    departmentId?: string | null;
    email?: string;
    id: string;
    isActive: boolean;
    managedCompanyIds: Array<string>;
    password: string;
    phone?: string | null;
    /**
     * Expo 推送 Token 列表（来自 expo-notifications）
     */
    pushTokens?: Array<string>;
    realName?: string | null;
    roles?: Array<string>;
    updatedAt: string;
    username: string;
};

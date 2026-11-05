/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type ApprovalConfig = {
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 实体类型
     */
    entityType: string;
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    /**
     * 审批链步骤 JSON
     */
    steps: Array<string>;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

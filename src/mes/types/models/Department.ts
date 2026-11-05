/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type Department = {
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    description?: string | null;
    id: string;
    leader?: Record<string, any>;
    leaderId?: string | null;
    name: string;
    parentId?: string | null;
    sortOrder: number;
    status: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

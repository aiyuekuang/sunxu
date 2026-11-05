/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SupplierStatus } from './SupplierStatus';
import type { User } from './User';
export type Supplier = {
    address?: string | null;
    category?: string | null;
    companyId: string;
    contactEmail?: string | null;
    contactName?: string | null;
    contactPhone?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    deliveryRate?: number | null;
    evaluationScore?: number | null;
    id: string;
    leadTimeDays?: number | null;
    name: string;
    paymentTerms?: string | null;
    purchasingRep?: User | null;
    purchasingRepId?: string | null;
    qualityRate?: number | null;
    rating?: string | null;
    remarks?: string | null;
    shortName?: string | null;
    status: SupplierStatus;
    supplierCode: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

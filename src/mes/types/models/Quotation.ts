/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Customer } from './Customer';
import type { QuotationItem } from './QuotationItem';
import type { QuotationStatus } from './QuotationStatus';
import type { User } from './User';
export type Quotation = {
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    customer?: Customer | null;
    customerId?: string | null;
    id: string;
    items?: Array<QuotationItem>;
    paymentTerms?: string | null;
    quotationDate?: string | null;
    quotationNo: string;
    remarks?: string | null;
    salesRep?: User | null;
    salesRepId?: string | null;
    status: QuotationStatus;
    totalAmount: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    validUntil?: string | null;
};

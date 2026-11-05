/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QualityInspection } from './QualityInspection';
export type QualityDefect = {
    companyId: string;
    createdAt: string;
    defectCode?: string | null;
    description: string;
    id: string;
    inspection?: QualityInspection;
    inspectionId: string;
    qty: number;
    remarks?: string | null;
    severity?: string;
    updatedAt: string;
};

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Equipment } from './Equipment';
import type { User } from './User';
import type { WorkOrder } from './WorkOrder';
export type EquipmentInspectionGateRelease = {
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    decidedAt?: string | null;
    decidedBy?: string | null;
    decider?: User | null;
    decisionNote?: string | null;
    equipment?: Equipment;
    equipmentId: string;
    id: string;
    inspectionDate: string;
    reason: string;
    requestedBy: string;
    requester?: User;
    status: EquipmentInspectionGateRelease.status;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    usedAt?: string | null;
    workOrder?: WorkOrder;
    workOrderId: string;
};
export namespace EquipmentInspectionGateRelease {
    export enum status {
        PENDING = 'pending',
        APPROVED = 'approved',
        REJECTED = 'rejected',
        USED = 'used',
    }
}

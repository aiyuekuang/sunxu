import type { QualityInspection } from './QualityInspection.d.ts';
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

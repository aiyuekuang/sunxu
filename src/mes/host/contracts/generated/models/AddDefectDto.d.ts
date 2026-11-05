export type AddDefectDto = {
    defectCode?: string;
    description: string;
    inspectionId: string;
    qty: number;
    remarks?: string;
    severity: string;
};

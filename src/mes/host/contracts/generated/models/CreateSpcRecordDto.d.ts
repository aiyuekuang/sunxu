export type CreateSpcRecordDto = {
    characteristicName: string;
    inspectionId?: string;
    materialId: string;
    measuredValue: number;
    sampleGroup: number;
};

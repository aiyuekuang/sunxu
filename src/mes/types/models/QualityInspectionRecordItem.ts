/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QualityInspectionItem } from './QualityInspectionItem';
import type { QualityInspectionMeasurement } from './QualityInspectionMeasurement';
import type { QualityInspectionRecord } from './QualityInspectionRecord';
export type QualityInspectionRecordItem = {
    companyId: string;
    createdAt: string;
    id: string;
    inspectionItem: QualityInspectionItem;
    inspectionItemId: string;
    isPassed: boolean;
    measuredValue?: string | null;
    measurements?: Array<QualityInspectionMeasurement>;
    /**
     * 本次检验项照片
     */
    photoUrls: Array<string>;
    record: QualityInspectionRecord;
    recordId: string;
    remarks?: string | null;
    updatedAt: string;
};

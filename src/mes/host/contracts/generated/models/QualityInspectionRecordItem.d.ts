import type { QualityInspectionItem } from './QualityInspectionItem.d.ts';
import type { QualityInspectionMeasurement } from './QualityInspectionMeasurement.d.ts';
import type { QualityInspectionRecord } from './QualityInspectionRecord.d.ts';
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

import type { InspectionType } from './InspectionType.d.ts';
import type { User } from './User.d.ts';
export type QualityTemplate = {
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    isActive: boolean;
    /**
     * 检验项目列表
     */
    items: Array<{
        acceptedValues?: Array<string> | null;
        code?: string;
        isRequired?: boolean;
        lowerLimit?: number | null;
        name?: string;
        options?: Array<string> | null;
        /**
         * 该检验项是否必须上传照片
         */
        photoRequired?: boolean;
        /**
         * 一次检查记录中该数值检验项要求录入的测量值数量
         */
        requiredMeasurementCount?: number;
        resultType?: 'numeric' | 'judgement' | 'selection' | 'text';
        spcEnabled?: boolean | null;
        specType?: string;
        standard?: string;
        unit?: string | null;
        upperLimit?: number | null;
    }>;
    name: string;
    /**
     * 一张质检单应完成的有效检查记录数
     */
    requiredRecordCount: number;
    sampleSize?: number | null;
    samplingMethod: string;
    type: InspectionType;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

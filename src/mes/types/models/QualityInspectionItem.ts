/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QualityResultType } from './QualityResultType';
export type QualityInspectionItem = {
    /**
     * 选择型合格值
     */
    acceptedValues?: Array<string> | null;
    companyId: string;
    createdAt: string;
    id: string;
    inspection?: Record<string, any>;
    inspectionId: string;
    isPassed?: boolean | null;
    isRequired: boolean;
    itemName: string;
    lowerLimit?: number | null;
    measuredValue?: string | null;
    /**
     * 选择型可选值
     */
    options?: Array<string> | null;
    /**
     * 模板快照：该检验项是否必须上传照片
     */
    photoRequired: boolean;
    remarks?: string | null;
    /**
     * 一次检查记录中该数值检验项要求录入的测量值数量
     */
    requiredMeasurementCount: number;
    resultType: QualityResultType;
    specType?: string | null;
    standard?: string | null;
    templateItemCode?: string | null;
    unit?: string | null;
    updatedAt: string;
    upperLimit?: number | null;
};

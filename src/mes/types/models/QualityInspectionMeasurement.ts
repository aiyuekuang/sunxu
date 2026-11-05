/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type QualityInspectionMeasurement = {
    companyId: string;
    createdAt: string;
    id: string;
    /**
     * 该测量值是否在合格范围内
     */
    isPassed: boolean;
    /**
     * 单次实际测量值
     */
    measuredValue: number;
    recordItem?: Record<string, any>;
    recordItemId: string;
    /**
     * 检验项内测量顺序号
     */
    sequenceNo: number;
    updatedAt: string;
};

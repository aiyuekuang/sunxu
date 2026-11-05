/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ReportQuantityUnitValueDto = {
    /**
     * 该单位下发生产出的工单数
     */
    count: number;
    /**
     * 图表展示名称
     */
    label: string;
    /**
     * 该单位下的数量
     */
    qty: number;
    /**
     * 稳定的图表分组键
     */
    seriesId: string;
    /**
     * 物料基础单位；临时制造项未配置时为 null
     */
    unit: string | null;
};

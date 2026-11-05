/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type IncomingInspectionReferenceDto = {
    /**
     * 样本不合格数
     */
    failQty: number;
    id: string;
    /**
     * 整批到货待检数量
     */
    inspectionLotQty?: number | null;
    /**
     * IQC质检单号
     */
    inspectionNo: string;
    /**
     * 样本合格数
     */
    passQty: number;
    /**
     * 实际抽检样本数
     */
    sampleQty: number;
    /**
     * IQC质检状态
     */
    status: string;
};

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PlanScheduleBomOutsourcingDto = {
    /**
     * BOM 需求总量
     */
    grossQty: number;
    materialCode: string | null;
    materialId: string;
    materialName: string | null;
    materialSpec: string | null;
    /**
     * 有效委外单号；预览或尚未生成有效委外单时为空
     */
    orderNo: string | null;
    /**
     * 预览时为预计委外缺口；排产结果优先显示有效委外单数量，未生成有效委外单时仍显示预计缺口
     */
    outsourceQty: number;
    planNo: string | null;
    /**
     * 按当前可用库存测算抵扣的数量；只作估算记录，不代表库存已预留
     */
    stockOffsetQty: number;
    unit: string;
    workOrderId: string;
    workOrderNo: string;
};

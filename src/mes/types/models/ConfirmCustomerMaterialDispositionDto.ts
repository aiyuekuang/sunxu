/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomerMaterialDispositionItemInputDto } from './CustomerMaterialDispositionItemInputDto';
export type ConfirmCustomerMaterialDispositionDto = {
    /**
     * 客户ID
     */
    customerId: string;
    /**
     * 处置发生时间
     */
    disposedAt?: string;
    /**
     * 处置类型
     */
    dispositionType: ConfirmCustomerMaterialDispositionDto.dispositionType;
    /**
     * 客户端幂等键；网络重试必须复用同一个值
     */
    idempotencyKey: string;
    /**
     * 处置明细；同一单据仅允许一个处置类型
     */
    items: Array<CustomerMaterialDispositionItemInputDto>;
    /**
     * 物流单号
     */
    logisticsNo?: string;
    /**
     * 原因码
     */
    reasonCode?: string;
    /**
     * 处置备注
     */
    remark?: string;
};
export namespace ConfirmCustomerMaterialDispositionDto {
    /**
     * 处置类型
     */
    export enum dispositionType {
        RETURN = 'return',
        LOSS = 'loss',
        SCRAP = 'scrap',
    }
}

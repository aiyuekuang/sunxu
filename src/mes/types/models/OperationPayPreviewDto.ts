/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OperationPayMode } from './OperationPayMode';
import type { TimeRateUnit } from './TimeRateUnit';
export type OperationPayPreviewDto = {
    /**
     * 辅操比例快照
     */
    auxiliaryRatio?: number;
    /**
     * 预计工资金额
     */
    estimatedAmount?: number;
    /**
     * 展示提示文案
     */
    message?: string;
    /**
     * 计薪方式快照
     */
    payMode: OperationPayMode;
    /**
     * 是否已配置当前计薪方式所需工价
     */
    priceConfigured: boolean;
    /**
     * 计薪数量来源：completed_qty / execution_qty / duration_minutes
     */
    quantitySource?: string;
    /**
     * 计时单价单位
     */
    timeRateUnit?: TimeRateUnit;
    /**
     * 单价单位展示名
     */
    unitName?: string;
    /**
     * 单价，有权限时返回
     */
    unitPrice?: number;
    /**
     * 是否返回单价/金额明细
     */
    visible: boolean;
};

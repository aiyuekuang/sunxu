/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AlertEventItemDto = {
    /**
     * 稳定去重键，同一事件（同一单号/物料/设备）只播报一次
     */
    key: string;
    level: string;
    source: string;
    time: string;
    title: string;
    /**
     * 事件类型（LargeScreenEventType），大屏语音播报按此提供分类开关
     */
    type: string;
};

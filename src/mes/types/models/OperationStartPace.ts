/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 开工节奏：earliest 尽早开工（默认，正排语义）；latest 尽量晚开工（拉式，在不影响后继工序与整单完工的前提下尽量推迟本工序）。这是排产节奏，不是瓶颈识别标记；目前仅从生产计划排产时应用，工单直接排产按尽早开工处理。仅对自制工序生效。
 */
export enum OperationStartPace {
    EARLIEST = 'earliest',
    LATEST = 'latest',
}

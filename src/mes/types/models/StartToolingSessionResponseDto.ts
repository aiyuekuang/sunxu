/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ToolingSession } from './ToolingSession';
export type StartToolingSessionResponseDto = {
    /**
     * 是否触发寿命预警
     */
    isWarning: boolean;
    /**
     * 寿命百分比
     */
    lifePercent: number;
    session: ToolingSession;
};

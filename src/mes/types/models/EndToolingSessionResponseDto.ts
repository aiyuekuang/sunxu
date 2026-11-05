/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ToolingSession } from './ToolingSession';
import type { ToolingWithRuntimeDto } from './ToolingWithRuntimeDto';
export type EndToolingSessionResponseDto = {
    /**
     * 寿命百分比
     */
    lifePercent: number;
    session: ToolingSession;
    tooling: ToolingWithRuntimeDto;
};

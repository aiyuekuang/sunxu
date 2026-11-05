/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ToolingBindingMode } from './ToolingBindingMode';
import type { ToolingRecommendationMode } from './ToolingRecommendationMode';
export type ToolingPolicyDto = {
    /**
     * 工装能力是否启用
     */
    enabled: boolean;
    /**
     * 工装推荐模式
     */
    recommendationMode: ToolingRecommendationMode;
    /**
     * 工装绑定门禁模式
     */
    toolingBindingMode: ToolingBindingMode;
};

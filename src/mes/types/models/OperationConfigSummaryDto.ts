/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OperationPolicySummaryDto } from './OperationPolicySummaryDto';
export type OperationConfigSummaryDto = {
    /**
     * 是否来自保存后的公司配置
     */
    configured: boolean;
    /**
     * 功能展示态
     */
    featureDisplayStates: Record<string, any>;
    /**
     * 当前隐藏功能编码
     */
    hiddenFeatureCodes: Array<string>;
    /**
     * 生命周期态；P0 通常为空
     */
    lifecycleStates: Record<string, any>;
    /**
     * 按运营模式和高级策略推导出的业务策略摘要
     */
    policySummary: OperationPolicySummaryDto;
    /**
     * 当前上线方案编码
     */
    selectedPresetCode: string;
    /**
     * 当前上线方案名称
     */
    selectedPresetName: string;
    /**
     * 当前展示功能编码
     */
    visibleFeatureCodes: Array<string>;
};

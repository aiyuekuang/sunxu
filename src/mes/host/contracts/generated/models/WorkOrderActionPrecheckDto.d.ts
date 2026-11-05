import type { MaterialReadinessGateMode } from './MaterialReadinessGateMode.d.ts';
import type { MaterialReadinessScope } from './MaterialReadinessScope.d.ts';
export type WorkOrderActionPrecheckDto = {
    /**
     * 阻断动作的原因
     */
    blockingReasons: Array<string>;
    /**
     * 动作按钮是否可触发
     */
    enabled: boolean;
    /**
     * 下一步建议
     */
    nextStep?: string | null;
    /**
     * 缺料主管放行时是否必须填写原因，仅齐套门禁需要放行时返回
     */
    overrideReasonRequired?: boolean;
    /**
     * 齐套门禁模式，仅下达、开工等需要齐套门禁的动作返回
     */
    readinessGateMode?: MaterialReadinessGateMode;
    /**
     * 齐套检查范围，仅下达、开工等需要齐套门禁的动作返回
     */
    readinessScope?: MaterialReadinessScope;
    /**
     * 继续动作前需要用户补充的输入字段
     */
    requiredInputs: Array<string>;
    /**
     * 动作是否对当前用户/状态可见
     */
    visible: boolean;
    /**
     * 不阻断动作的风险提示
     */
    warnings: Array<string>;
};

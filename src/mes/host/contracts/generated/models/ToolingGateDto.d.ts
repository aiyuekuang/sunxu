import type { ToolingBindingMode } from './ToolingBindingMode.d.ts';
import type { ToolingRecommendationItemDto } from './ToolingRecommendationItemDto.d.ts';
import type { ToolingRecommendationMode } from './ToolingRecommendationMode.d.ts';
import type { ToolingSessionListItemDto } from './ToolingSessionListItemDto.d.ts';
export type ToolingGateDto = {
    /**
     * 允许工装ID快照；空表示按类型匹配或不限制
     */
    allowedToolingIds: Array<string>;
    /**
     * 阻断原因
     */
    blockers: Array<string>;
    /**
     * 工装能力是否启用
     */
    enabled: boolean;
    /**
     * 工装绑定门禁模式
     */
    mode: ToolingBindingMode;
    /**
     * 下一步建议
     */
    nextStep?: string | null;
    /**
     * 工装推荐模式
     */
    recommendationMode: ToolingRecommendationMode;
    /**
     * 推荐工装
     */
    recommendedToolings: Array<ToolingRecommendationItemDto>;
    /**
     * 当前工序是否配置了工装要求
     */
    required: boolean;
    /**
     * 要求工装类型
     */
    requiredToolingType?: string | null;
    /**
     * 运行中会话
     */
    runningSessions: Array<ToolingSessionListItemDto>;
    /**
     * 是否存在唯一可用候选
     */
    uniqueCandidate: boolean;
    /**
     * 是否按策略预选唯一候选
     */
    uniqueCandidatePreselected: boolean;
    /**
     * 不阻断提示
     */
    warnings: Array<string>;
};

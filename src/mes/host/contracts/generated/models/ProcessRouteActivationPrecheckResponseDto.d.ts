import type { ProcessRouteActivationIssueDto } from './ProcessRouteActivationIssueDto.d.ts';
export type ProcessRouteActivationPrecheckResponseDto = {
    /**
     * 全部启用阻断项
     */
    issues: Array<ProcessRouteActivationIssueDto>;
    /**
     * 是否满足启用条件
     */
    ready: boolean;
    /**
     * 工艺路线ID
     */
    routeId: string;
};

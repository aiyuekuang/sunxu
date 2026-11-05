export type ActivateProcessRouteDto = {
    /**
     * 启用/替代说明（选填，未填时系统自动生成追溯说明）
     */
    changeReason?: string;
    /**
     * 生效时间，不传表示立即生效
     */
    effectiveFrom?: string;
    /**
     * 工艺路线ID
     */
    id: string;
};

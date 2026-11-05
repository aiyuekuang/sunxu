export type MaterialEffectiveDownstreamPolicyDto = {
    /**
     * BOM 解析规则
     */
    bomMode?: string;
    /**
     * 业务单据持久化主键口径
     */
    persistKey?: string;
    /**
     * 质量模板解析规则
     */
    qualityMode?: string;
    /**
     * 工艺路线解析规则
     */
    routeMode?: string;
};

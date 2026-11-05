export type ProcessOperationInspectionTemplateBindingDto = {
    /**
     * 适配物料ID；为空表示默认 IPQC 模板
     */
    materialId?: string | null;
    /**
     * 已废弃：仅用于读取历史路线适用条件规则；新增规则请直接使用 materialId，且不可与 materialId 同时传入
     */
    routeApplicabilityId?: string;
    /**
     * IPQC质检模板ID
     */
    templateId: string;
};

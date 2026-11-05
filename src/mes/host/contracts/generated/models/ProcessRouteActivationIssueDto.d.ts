export type ProcessRouteActivationIssueDto = {
    /**
     * 启用阻断项编码，例如 ipqc_default_template_missing、standard_time_missing
     */
    code: string;
    /**
     * 可直接展示给用户的处理说明
     */
    message: string;
    /**
     * 关联的工序ID；路线级阻断项为空
     */
    operationId?: string | null;
    /**
     * 关联的工序名称；路线级阻断项为空
     */
    operationName?: string | null;
};

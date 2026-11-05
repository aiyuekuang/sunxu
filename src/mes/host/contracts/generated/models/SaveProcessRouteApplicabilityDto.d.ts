export type SaveProcessRouteApplicabilityDto = {
    /**
     * 适用客户ID；空表示不限客户
     */
    customerId?: string;
    /**
     * 规则生效时间；空表示立即可用
     */
    effectiveFrom?: string;
    /**
     * 规则失效时间；空表示长期有效
     */
    effectiveTo?: string;
    /**
     * 适用物料系列ID；空表示不限系列
     */
    familyId?: string;
    /**
     * 适用规则ID；为空表示新增
     */
    id?: string;
    /**
     * 是否默认规则
     */
    isDefault?: boolean;
    /**
     * 适用物料档案ID；空表示通用规则
     */
    materialId?: string;
    /**
     * 订单类型；空表示不限订单类型
     */
    orderType?: string;
    /**
     * 匹配优先级，越小越优先
     */
    priority?: number;
    /**
     * 适用项目号 / 模具号 / 客户项目号；空表示不限项目
     */
    projectCode?: string;
    /**
     * 工艺路线ID，用于反查路线主数据
     */
    routeId?: string;
    /**
     * 路线主数据ID
     */
    routeMasterId?: string;
    /**
     * 适用销售订单ID；空表示不限订单
     */
    saleOrderId?: string;
    /**
     * 适用销售订单行ID；空表示不限订单行
     */
    saleOrderItemId?: string;
};

export type ResolveProcessRouteVersionDto = {
    /**
     * 客户ID
     */
    customerId?: string;
    /**
     * 物料系列ID
     */
    familyId?: string;
    /**
     * 物料档案ID
     */
    materialId?: string;
    /**
     * 订单类型
     */
    orderType?: string;
    /**
     * 项目号 / 模具号 / 客户项目号，用于项目专用路线匹配
     */
    projectCode?: string;
    /**
     * 直接指定的工艺路线ID
     */
    routeId?: string;
    /**
     * 路线主数据ID
     */
    routeMasterId?: string;
    /**
     * 路线选版日期，不传默认当前时间
     */
    routeSelectionDate?: string;
    /**
     * 销售订单ID，用于订单专用路线匹配
     */
    saleOrderId?: string;
    /**
     * 销售订单行ID，用于订单行专用路线匹配
     */
    saleOrderItemId?: string;
};

export type ScheduleBottleneckDto = {
    /**
     * 按客户筛选
     */
    customerId?: string;
    endDate: string;
    /**
     * 关键词搜索（计划号/工单号/物料名称/客户名称）
     */
    keyword?: string;
    startDate: string;
    /**
     * 按排产状态筛选；不传时默认统计除已取消外的全部状态，已取消不占用产能
     */
    statuses?: Array<'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>;
    /**
     * 计划平均负荷率阈值
     */
    threshold?: number;
    workCenterId?: string;
    /**
     * 按工作中心类型筛选（对应 work_center_type 字典的 itemValue）
     */
    workCenterType?: string;
};

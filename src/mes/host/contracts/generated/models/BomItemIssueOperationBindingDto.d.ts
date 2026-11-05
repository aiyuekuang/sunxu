export type BomItemIssueOperationBindingDto = {
    /**
     * 路线内稳定投料工序编码
     */
    operationCode: string;
    /**
     * 阶段编码；同一编码在路线内重复时用于精确定位
     */
    phaseCode?: string;
    /**
     * 工艺路线主数据ID
     */
    routeMasterId: string;
};

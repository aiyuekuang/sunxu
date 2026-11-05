export type ActivateBomDto = {
    /**
     * 激活/变更说明
     */
    changeRemark?: string;
    /**
     * 是否已确认影响分析
     */
    confirmImpact?: boolean;
    /**
     * ID
     */
    id: string;
};

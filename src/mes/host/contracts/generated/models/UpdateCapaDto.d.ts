export type UpdateCapaDto = {
    /**
     * 负责人ID
     */
    assigneeId?: string;
    /**
     * 纠正措施
     */
    correctiveAction?: string;
    /**
     * 计划完成日期
     */
    dueDate?: string;
    /**
     * ID
     */
    id: string;
    /**
     * 预防措施
     */
    preventiveAction?: string;
    /**
     * 问题描述
     */
    problemDescription?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 根因分析
     */
    rootCause?: string;
    /**
     * 严重程度
     */
    severity?: UpdateCapaDto.severity;
};
export declare namespace UpdateCapaDto {
    /**
     * 严重程度
     */
    enum severity {
        LOW = "low",
        MEDIUM = "medium",
        HIGH = "high",
        CRITICAL = "critical"
    }
}

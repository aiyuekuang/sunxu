export type CreateCapaDto = {
    /**
     * 负责人ID
     */
    assigneeId?: string;
    /**
     * 关联处置单ID
     */
    disposalId?: string;
    /**
     * 计划完成日期
     */
    dueDate?: string;
    /**
     * 关联质检单ID
     */
    inspectionId?: string;
    /**
     * 问题描述
     */
    problemDescription: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 严重程度
     */
    severity: CreateCapaDto.severity;
};
export declare namespace CreateCapaDto {
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

export type SubmitCorrectionDto = {
    /**
     * 负责人ID
     */
    assigneeId?: string | null;
    /**
     * 纠正措施
     */
    correctiveAction: string;
    /**
     * 计划完成日期
     */
    dueDate?: string | null;
    /**
     * ID
     */
    id: string;
    /**
     * 预防措施
     */
    preventiveAction: string;
    /**
     * 根因分析
     */
    rootCause: string;
};

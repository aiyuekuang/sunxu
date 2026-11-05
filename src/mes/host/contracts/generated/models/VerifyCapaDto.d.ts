export type VerifyCapaDto = {
    /**
     * 整改执行证据
     */
    actionEvidence?: string;
    /**
     * ID
     */
    id: string;
    /**
     * 观察结束日期
     */
    observationEndDate?: string;
    /**
     * 观察开始日期
     */
    observationStartDate?: string;
    /**
     * 验证是否通过
     */
    passed: boolean;
    /**
     * 复发观察结论
     */
    recurrenceResult?: string;
    /**
     * 标准/流程更新记录
     */
    standardUpdateRecord?: string;
    /**
     * 培训/告知记录
     */
    trainingRecord?: string;
    /**
     * 验证方式
     */
    verificationMethod?: string;
    /**
     * 验证说明
     */
    verificationResult: string;
};

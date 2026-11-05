export type CreateQualityInspectionDto = {
    /**
     * 批次号
     */
    batchNo?: string;
    /**
     * 关联客户ID (FQC/OQC)
     */
    customerId?: string;
    inspectorId?: string;
    materialId: string;
    remarks?: string;
    /**
     * 抽样数量
     */
    sampleQty: number;
    /**
     * 关联供应商ID (IQC)
     */
    supplierId?: string;
    /**
     * 质检模板ID；不传则创建简单质检单，提交时按抽检/合格/不合格数量形成结论
     */
    templateId?: string;
    type: CreateQualityInspectionDto.type;
    workOrderId?: string;
};
export declare namespace CreateQualityInspectionDto {
    enum type {
        IQC = "iqc",
        IPQC = "ipqc",
        FQC = "fqc",
        OQC = "oqc"
    }
}

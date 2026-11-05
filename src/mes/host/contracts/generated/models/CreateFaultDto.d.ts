export type CreateFaultDto = {
    assigneeId?: string;
    /**
     * 故障现场照片
     */
    attachments?: Array<string>;
    equipmentId: string;
    /**
     * 故障分类（字典：fault_category）
     */
    faultCategory?: string;
    faultDescription: string;
    isDowntime?: boolean;
    remarks?: string;
    /**
     * 故障严重程度（字典：fault_severity）
     */
    severity?: string;
};

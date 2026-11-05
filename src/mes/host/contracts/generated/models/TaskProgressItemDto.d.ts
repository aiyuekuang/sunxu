export type TaskProgressItemDto = {
    defectQty: number;
    /**
     * 今日净作业工时，单位小时
     */
    durationHours: number;
    /**
     * 今日净作业工时，单位分钟，冲正按负数扣减
     */
    durationMinutes: number;
    goodQty: number;
    materialName?: string;
    operationName: string;
    orderNo: string;
    /**
     * 今日良品产出效率，良品数量/小时
     */
    outputPerHour: number;
    plannedQty: number;
    /**
     * 今日有效报工次数，不含冲正记录数
     */
    reportCount: number;
    totalCompletedQty: number;
    worker?: string | null;
    workerId: string;
};

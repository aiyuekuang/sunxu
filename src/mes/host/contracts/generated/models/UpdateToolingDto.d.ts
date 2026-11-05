export type UpdateToolingDto = {
    /**
     * 前端当前工装自定义字段 schema 版本；提交 customValues 时必填，用于阻止过期表单覆盖
     */
    customFieldSchemaVersion?: number;
    /**
     * 工装自定义字段值（key=字段 key）；不传表示本次不修改自定义字段，传则按 key 合并保存
     */
    customValues?: Record<string, any>;
    /**
     * 工装技术图纸资料 URL 列表，仅支持 JPG/JPEG/PNG/PDF
     */
    drawingUrls?: Array<string>;
    id: string;
    /**
     * 寿命计量单位；仅当前周期累计为 0 且未上机时允许修改，避免改变既有寿命数据语义
     */
    lifeCountUnit?: string;
    maxUseCount?: number;
    maxUseHours?: number;
    name?: string;
    remarks?: string;
    spec?: string;
    /**
     * 工装类型（字典：tooling_type）
     */
    type?: string;
    warningThreshold?: number;
    /**
     * 所属工作中心ID
     */
    workCenterId?: string;
};

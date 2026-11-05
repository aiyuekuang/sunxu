export type SubmitInspectionItemDto = {
    /**
     * 前端当前质量检验明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 质量检验明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    id: string;
    isPassed?: boolean;
    /**
     * 单值或非数值检验项结果；数值多测量值请使用 measuredValues
     */
    measuredValue?: string;
    /**
     * 数值检验项的实际测量值列表，数量必须等于模板测量要求数量
     */
    measuredValues?: Array<number>;
    /**
     * 本次检验项照片；必须来自当前用户本次上传且尚未关联的图片
     */
    photoUrls?: Array<string>;
    remarks?: string;
};

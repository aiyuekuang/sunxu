import type { QualityResultType } from './QualityResultType.d.ts';
export type TemplateItemDto = {
    /**
     * 选择型合格值
     */
    acceptedValues?: Array<string>;
    /**
     * 检验项稳定编码；留空时由系统在模板内自动生成
     */
    code?: string;
    isRequired: boolean;
    lowerLimit?: number | null;
    name: string;
    /**
     * 选择型可选值
     */
    options?: Array<string>;
    /**
     * 该检验项是否必须上传照片；启用后该项目也必须完成检验结果
     */
    photoRequired?: boolean;
    /**
     * 一次检查记录中该数值检验项要求录入的测量值数量
     */
    requiredMeasurementCount?: number;
    resultType: QualityResultType;
    /**
     * 是否用于 SPC 特征
     */
    spcEnabled?: boolean;
    specType: string;
    standard: string;
    unit?: string | null;
    upperLimit?: number | null;
};

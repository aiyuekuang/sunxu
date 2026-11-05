import type { TemplateItemDto } from './TemplateItemDto.d.ts';
export type CreateQualityTemplateDto = {
    code?: string;
    /**
     * 是否启用
     */
    isActive?: boolean;
    items: Array<TemplateItemDto>;
    name: string;
    /**
     * 一张质检单应完成的有效检查记录数
     */
    requiredRecordCount?: number;
    /**
     * 固定抽检数量，支持最多4位小数
     */
    sampleSize?: number | null;
    /**
     * 抽检方式
     */
    samplingMethod?: CreateQualityTemplateDto.samplingMethod;
    type: CreateQualityTemplateDto.type;
};
export declare namespace CreateQualityTemplateDto {
    /**
     * 抽检方式
     */
    enum samplingMethod {
        FULL = "full",
        SAMPLING = "sampling"
    }
    enum type {
        IQC = "iqc",
        IPQC = "ipqc",
        FQC = "fqc",
        OQC = "oqc"
    }
}

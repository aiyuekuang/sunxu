export type SpcCharacteristicOptionDto = {
    /**
     * 特征名称
     */
    characteristicName: string;
    /**
     * 是否已维护完整规格上下限
     */
    hasSpecification: boolean;
    /**
     * 规格下限
     */
    lowerLimit?: number | null;
    /**
     * 当前物料下该特征的采样记录数
     */
    recordCount: number;
    /**
     * 来源
     */
    source: SpcCharacteristicOptionDto.source;
    /**
     * 规格类型
     */
    specType?: string | null;
    /**
     * 标准值/标准描述
     */
    standard?: string | null;
    /**
     * 模板编码
     */
    templateCode?: string | null;
    /**
     * 模板检验项编码
     */
    templateItemCode?: string | null;
    /**
     * 模板名称
     */
    templateName?: string | null;
    /**
     * 单位
     */
    unit?: string | null;
    /**
     * 规格上限
     */
    upperLimit?: number | null;
};
export declare namespace SpcCharacteristicOptionDto {
    /**
     * 来源
     */
    enum source {
        TEMPLATE = "template",
        RECORD = "record"
    }
}

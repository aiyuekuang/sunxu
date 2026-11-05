export type InspectionItemDto = {
    /**
     * 选项或文字记录的实际值
     */
    actualText?: string;
    /**
     * 数值测量结果
     */
    actualValue?: number;
    id: string;
    name?: string;
    /**
     * 服务端签发的现场照片证据ID
     */
    photoEvidenceIds?: Array<string>;
    /**
     * 现场拍摄照片地址
     */
    photoUrls?: Array<string>;
    remark?: string;
    /**
     * 检验结果
     */
    result?: InspectionItemDto.result;
};
export declare namespace InspectionItemDto {
    /**
     * 检验结果
     */
    enum result {
        NORMAL = "normal",
        ABNORMAL = "abnormal"
    }
}

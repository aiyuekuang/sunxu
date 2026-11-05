export type MaintenanceStepDto = {
    content?: string;
    id: string;
    name: string;
    /**
     * 该步骤是否必须拍照
     */
    photoRequired?: boolean;
    /**
     * 步骤现场照片；仅接受当前用户本次上传的图片
     */
    photoUrls?: Array<string>;
    /**
     * 步骤备注
     */
    remark?: string;
    required?: boolean;
    /**
     * 步骤执行结果
     */
    result?: string;
};

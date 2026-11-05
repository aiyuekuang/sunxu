/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MaterialDrawingPolicyDto = {
    /**
     * 支持的图纸资料扩展名
     */
    allowedExtensions: Array<string>;
    /**
     * GLB 3D 模型单文件大小上限（字节）
     */
    glbFileMaxSize: number;
    /**
     * 单个物料最多维护的图纸资料数量
     */
    maxCount: number;
    /**
     * 普通图纸资料单文件大小上限（字节）
     */
    normalFileMaxSize: number;
};

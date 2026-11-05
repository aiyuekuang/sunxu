import type { IndustryPackPreviewItemDto } from './IndustryPackPreviewItemDto.d.ts';
export type IndustryPackPreviewDictDto = {
    /**
     * 预置条目数
     */
    itemCount: number;
    /**
     * 预置条目列表
     */
    items: Array<IndustryPackPreviewItemDto>;
    /**
     * 字典类型备注
     */
    remark?: string;
    /**
     * 字典类型编码
     */
    typeCode: string;
    /**
     * 字典类型名称
     */
    typeName: string;
};

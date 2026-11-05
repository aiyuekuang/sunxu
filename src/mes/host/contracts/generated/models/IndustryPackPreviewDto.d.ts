import type { IndustryPackPreviewDictDto } from './IndustryPackPreviewDictDto.d.ts';
export type IndustryPackPreviewDto = {
    /**
     * 行业包描述
     */
    description: string;
    /**
     * 包含的字典类型数
     */
    dictCount: number;
    /**
     * 行业包内字典明细
     */
    dicts: Array<IndustryPackPreviewDictDto>;
    /**
     * 包含的预置条目总数
     */
    itemCount: number;
    /**
     * 行业包编码
     */
    packCode: string;
    /**
     * 行业包名称
     */
    packName: string;
};

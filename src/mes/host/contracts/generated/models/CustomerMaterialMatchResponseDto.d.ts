import type { CustomerMaterial } from './CustomerMaterial.d.ts';
export type CustomerMaterialMatchResponseDto = {
    /**
     * 是否存在一料号多物料歧义
     */
    ambiguous: boolean;
    /**
     * 候选客户料号映射列表；无匹配时为空，歧义时返回待人工确认项
     */
    candidates: Array<CustomerMaterial>;
    /**
     * 是否唯一匹配到内部物料
     */
    matched: boolean;
    /**
     * 匹配结果说明
     */
    message: string;
    /**
     * 唯一匹配到的客户料号映射
     */
    record?: CustomerMaterial | null;
};

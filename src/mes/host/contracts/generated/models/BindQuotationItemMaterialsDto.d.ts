import type { BindQuotationItemMaterialDto } from './BindQuotationItemMaterialDto.d.ts';
export type BindQuotationItemMaterialsDto = {
    /**
     * ID
     */
    id: string;
    /**
     * 临时报价明细与正式物料档案绑定关系
     */
    items: Array<BindQuotationItemMaterialDto>;
};

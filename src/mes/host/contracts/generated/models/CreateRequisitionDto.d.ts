import type { CreateRequisitionItemDto } from './CreateRequisitionItemDto.d.ts';
export type CreateRequisitionDto = {
    /**
     * 制单日期（YYYY-MM-DD；不传则按创建当天取值）
     */
    documentDate?: string;
    /**
     * 申请物料行项
     */
    items: Array<CreateRequisitionItemDto>;
    /**
     * 备注
     */
    remarks?: string;
};

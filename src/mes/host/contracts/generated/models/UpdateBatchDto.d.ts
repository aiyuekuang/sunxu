export type UpdateBatchDto = {
    expiryDate?: string;
    id: string;
    productionDate?: string;
    /**
     * 废弃兼容字段。库存数量必须通过库存业务动作生成，不能在批号管理中直接修改。
     */
    qty?: number;
    supplierId?: string;
};

import type { InventorySourceLayerType } from './InventorySourceLayerType.d.ts';
export type CustomerMaterialDispositionAvailableSourceDto = {
    /**
     * 批号
     */
    batchNo?: string | null;
    /**
     * 来源客户来料登记ID；未转库存的外来物品以此作为唯一处置来源
     */
    customerInboundId?: string | null;
    /**
     * 物料ID
     */
    materialId?: string | null;
    /**
     * 物料显示名称
     */
    materialLabel: string;
    /**
     * 来源发生时间
     */
    openedAt: string;
    /**
     * 当前可处置来源余额
     */
    remainingQty: number;
    /**
     * 来源显示名称
     */
    sourceLabel: string;
    /**
     * 库存来源层ID；未转库存的外来物品为空
     */
    sourceLayerId?: string | null;
    /**
     * 来源类型；legacy_unallocated 表示历史未分摊来源，未转库存的外来物品为空
     */
    sourceLayerType?: InventorySourceLayerType | null;
    /**
     * 是否已转为客户货主库存；false 时不产生仓储出库流水
     */
    stockManaged: boolean;
};

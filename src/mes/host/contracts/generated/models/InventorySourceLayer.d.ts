import type { InventoryOwnerType } from './InventoryOwnerType.d.ts';
import type { InventorySourceLayerType } from './InventorySourceLayerType.d.ts';
export type InventorySourceLayer = {
    /**
     * 批号快照
     */
    batchNo?: string | null;
    companyId: string;
    createdAt: string;
    /**
     * 客户ID
     */
    customerId: string;
    id: string;
    /**
     * 来源初始数量
     */
    initialQty: number;
    /**
     * 物料ID
     */
    materialId: string;
    /**
     * 来源发生时间，用于 FIFO 分摊
     */
    openedAt: string;
    /**
     * 库存货主ID
     */
    ownerRefId: string;
    /**
     * 库存货主类型
     */
    ownerType: InventoryOwnerType;
    /**
     * 来源单据ID
     */
    sourceDocId?: string | null;
    /**
     * 来源单据类型
     */
    sourceDocType: string;
    /**
     * 来源层类型
     */
    sourceLayerType: InventorySourceLayerType;
    /**
     * 形成来源层的库存入库流水ID
     */
    sourceStockTransactionId?: string | null;
    updatedAt: string;
};

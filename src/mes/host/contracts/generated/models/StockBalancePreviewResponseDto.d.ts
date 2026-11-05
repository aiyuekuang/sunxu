import type { WarehouseLocationControlMode } from './WarehouseLocationControlMode.d.ts';
export type StockBalancePreviewResponseDto = {
    /**
     * 本次调整数量；仅用于预览调整后数量
     */
    adjustQty?: number | null;
    /**
     * 可用库存数量
     */
    availableQty: number;
    /**
     * 调整后可用库存数量
     */
    availableQtyAfterAdjust?: number | null;
    /**
     * 当前仓库/仓位下的批号可用数量；当前按批号结存口径返回
     */
    batchAvailableQty?: number | null;
    /**
     * 当前仓库/仓位下的批号结存数量
     */
    batchBookQty?: number | null;
    /**
     * 批号
     */
    batchNo?: string | null;
    /**
     * 批号缺口数量
     */
    batchShortageQty?: number | null;
    /**
     * 当前批号结存是否满足 requiredQty
     */
    batchSufficient?: boolean | null;
    /**
     * 库存查询阻断项
     */
    blockers: Array<string>;
    /**
     * 账面库存数量
     */
    bookQty: number;
    /**
     * 调整后账面库存数量
     */
    bookQtyAfterAdjust?: number | null;
    /**
     * 冻结数量
     */
    frozenQty: number;
    locationControlMode: WarehouseLocationControlMode;
    /**
     * 本次实际参与余额查询的仓位ID；为空表示仓库汇总
     */
    locationId?: string | null;
    /**
     * 当前库存动作是否要求仓位
     */
    locationRequired: boolean;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 本次需求数量；用于前端提示是否充足
     */
    requiredQty?: number | null;
    /**
     * 占用数量
     */
    reservedQty: number;
    /**
     * 库存缺口数量
     */
    shortageQty?: number | null;
    /**
     * 当前可用库存是否满足 requiredQty
     */
    sufficient?: boolean | null;
    /**
     * 仓库ID
     */
    warehouseId: string;
    /**
     * 库存查询提示
     */
    warnings: Array<string>;
};

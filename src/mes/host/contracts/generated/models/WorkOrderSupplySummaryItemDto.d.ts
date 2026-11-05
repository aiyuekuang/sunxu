import type { InventoryOwnerType } from './InventoryOwnerType.d.ts';
import type { IssueMode } from './IssueMode.d.ts';
export type WorkOrderSupplySummaryItemDto = {
    /**
     * 累计已发料数量
     */
    actualIssuedQty: number;
    /**
     * 累计已补料数量
     */
    actualReplenishedQty: number;
    /**
     * 累计已退回数量
     */
    actualReturnedQty: number;
    /**
     * 当前判断口径下的可用量
     */
    available: number;
    /**
     * 已领数量
     */
    issuedQty: number;
    /**
     * 线边仓可用库存
     */
    lineSideAvailable: number;
    /**
     * 线边仓ID
     */
    lineSideWarehouseId?: string | null;
    /**
     * 物料档案编码
     */
    materialCode: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 物料档案名称
     */
    materialName: string;
    /**
     * 工单物料需求ID
     */
    materialReqId: string;
    /**
     * 净需求数量
     */
    netRequired: number;
    /**
     * 下一步处理建议
     */
    nextActionHint?: string | null;
    /**
     * 库存货主ID
     */
    ownerRefId: string;
    /**
     * 库存货主类型
     */
    ownerType: InventoryOwnerType;
    /**
     * 待执行退回数量
     */
    pendingReturnQty: number;
    /**
     * 待执行补料数量
     */
    pendingSupplyQty: number;
    /**
     * 齐套状态
     */
    readyStatus: WorkOrderSupplySummaryItemDto.readyStatus;
    /**
     * 需求数量
     */
    requiredQty: number;
    /**
     * 来源仓可用库存
     */
    sourceAvailable: number;
    /**
     * 是否充足
     */
    sufficient: boolean;
    /**
     * 供料策略
     */
    supplyMode: IssueMode;
    /**
     * 来源仓ID
     */
    warehouseId?: string | null;
};
export declare namespace WorkOrderSupplySummaryItemDto {
    /**
     * 齐套状态
     */
    enum readyStatus {
        READY = "ready",
        WAITING_REPLENISHMENT = "waiting_replenishment",
        SHORTAGE = "shortage"
    }
}

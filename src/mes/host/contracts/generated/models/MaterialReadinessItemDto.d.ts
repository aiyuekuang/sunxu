import type { IssueMode } from './IssueMode.d.ts';
import type { MaterialReadinessSubstituteItemDto } from './MaterialReadinessSubstituteItemDto.d.ts';
export type MaterialReadinessItemDto = {
    /**
     * 按当前 BOM 自动替代规则折算后的替代料可覆盖量（原物料需求单位）
     */
    automaticSubstituteAvailableQty?: number | null;
    /**
     * 可用于自动替代的物料明细
     */
    automaticSubstitutes?: Array<MaterialReadinessSubstituteItemDto>;
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
    readyStatus: MaterialReadinessItemDto.readyStatus;
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
export declare namespace MaterialReadinessItemDto {
    /**
     * 齐套状态
     */
    enum readyStatus {
        READY = "ready",
        WAITING_REPLENISHMENT = "waiting_replenishment",
        SHORTAGE = "shortage"
    }
}

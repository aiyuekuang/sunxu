import { StockInDto } from '../generated/models/StockInDto.d.ts';
import { StockOutDto } from '../generated/models/StockOutDto.d.ts';
import { WarehouseLocationControlMode } from '../generated/models/WarehouseLocationControlMode.d.ts';
export declare const StockTransactionType: {
    readonly IN_OTHER: StockInDto.type.IN_OTHER;
    readonly IN_RETURN: StockInDto.type.IN_RETURN;
    readonly OUT_OTHER: StockOutDto.type.OUT_OTHER;
    readonly OUT_SCRAP: StockOutDto.type.OUT_SCRAP;
};
export type StockTransactionType = (typeof StockTransactionType)[keyof typeof StockTransactionType];
export type StockInOperationType = typeof StockTransactionType.IN_OTHER | typeof StockTransactionType.IN_RETURN;
export type StockOutOperationType = typeof StockTransactionType.OUT_OTHER | typeof StockTransactionType.OUT_SCRAP;
export type { Warehouse } from '../generated/models/Warehouse.d.ts';
export { WarehouseLocationControlMode };
export type { StockListItemDto as Stock } from '../generated/models/StockListItemDto.d.ts';
export type { StockTransaction } from '../generated/models/StockTransaction.d.ts';
export type { StockLocationPrecheckDto } from '../generated/models/StockLocationPrecheckDto.d.ts';
export type { StockLocationPrecheckResponseDto } from '../generated/models/StockLocationPrecheckResponseDto.d.ts';
export type { StockLocationDistributionDto } from '../generated/models/StockLocationDistributionDto.d.ts';
export type { StockLocationDistributionItemDto } from '../generated/models/StockLocationDistributionItemDto.d.ts';
export type { StockLocationDistributionResponseDto } from '../generated/models/StockLocationDistributionResponseDto.d.ts';
export type { StockBalancePreviewDto } from '../generated/models/StockBalancePreviewDto.d.ts';
export type { StockBalancePreviewResponseDto } from '../generated/models/StockBalancePreviewResponseDto.d.ts';
export type { StockFreezeDto } from '../generated/models/StockFreezeDto.d.ts';
export type { StockUnfreezeDto } from '../generated/models/StockUnfreezeDto.d.ts';
import { WarehouseListDto } from '../generated/models/WarehouseListDto.d.ts';
import type { CreateWarehouseDto } from '../generated/models/CreateWarehouseDto.d.ts';
import type { UpdateWarehouseDto } from '../generated/models/UpdateWarehouseDto.d.ts';
import type { StockListDto } from '../generated/models/StockListDto.d.ts';
import type { StockTransactionListDto } from '../generated/models/StockTransactionListDto.d.ts';
import type { StockTransferDto } from '../generated/models/StockTransferDto.d.ts';
import type { StockAdjustDto } from '../generated/models/StockAdjustDto.d.ts';
import type { StockCheckDto } from '../generated/models/StockCheckDto.d.ts';
import type { BatchAdjustDto } from '../generated/models/BatchAdjustDto.d.ts';
import type { StockLocationPrecheckDto as StockLocationPrecheckInputDto } from '../generated/models/StockLocationPrecheckDto.d.ts';
import type { StockLocationDistributionDto } from '../generated/models/StockLocationDistributionDto.d.ts';
import type { StockBalancePreviewDto } from '../generated/models/StockBalancePreviewDto.d.ts';
import type { StockFreezeDto } from '../generated/models/StockFreezeDto.d.ts';
import type { StockUnfreezeDto } from '../generated/models/StockUnfreezeDto.d.ts';
import type { Warehouse } from '../generated/models/Warehouse.d.ts';
import type { StockListItemDto } from '../generated/models/StockListItemDto.d.ts';
import type { StockTransaction } from '../generated/models/StockTransaction.d.ts';
export interface WarehousePickerParams {
    page: number;
    pageSize: number;
    keyword?: string;
    categoryId?: string;
}
export interface WarehousePickerOptions {
    /** 不传时返回所有启用仓库；指定时按多个类型族合并。 */
    typeFamilies?: NonNullable<WarehouseListDto['typeFamily']>[];
    /** 正式库存收发默认排除线边仓。 */
    includeLineSide?: boolean;
}
/**
 * 预筛选候选集的排序归属：普通候选遵守显示排序；执行上下文候选保留后端已计算的
 * 业务优先级（且后端必须已在同一优先级内完成显示排序）。
 */
export type WarehouseCandidateOrder = 'display' | 'business-priority';
/** 仓库显示排序的唯一前端实现，与后端固定的 sortOrder 链路保持一致。 */
export declare function compareWarehousesByDisplayOrder(left: Warehouse, right: Warehouse): number;
export declare function sortWarehousesByDisplayOrder(warehouses: readonly Warehouse[]): Warehouse[];
/**
 * 将当前业务上下文已经筛选好的仓库候选集转换为统一的搜索、排序和分页结果。
 * 业务层只负责候选范围，不能各自实现显示排序或分页规则。
 */
export declare function fetchWarehouseCandidateOptions(params: WarehousePickerParams, candidates: readonly Warehouse[], order?: WarehouseCandidateOrder): Promise<{
    list: Warehouse[];
    total: number;
}>;
/**
 * 移动端仓库选择器的唯一数据入口。
 *
 * 即使后端已有默认排序，也显式传递 sortOrder，保证按类型族合并、行级选择和
 * 普通仓库选择都遵守同一显示顺序；只在此处处理线边仓范围收窄。
 */
export declare function fetchWarehousePickerOptions({ page, pageSize, keyword }: WarehousePickerParams, { typeFamilies, includeLineSide }?: WarehousePickerOptions): Promise<{
    list: Warehouse[];
    total: number;
}>;
export declare const warehouseService: {
    listWarehouses: (params?: WarehouseListDto) => Promise<import("./_base.d.ts").PaginatedList<Warehouse>>;
    warehouseDetail: (id: string) => Promise<Warehouse>;
    createWarehouse: (dto: CreateWarehouseDto) => import("../../../types/generated/index").Promise<Warehouse>;
    updateWarehouse: (dto: UpdateWarehouseDto) => import("../../../types/generated/index").Promise<Warehouse>;
    deleteWarehouse: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    listStocks: (params?: StockListDto) => Promise<import("./_base.d.ts").PaginatedList<StockListItemDto>>;
    listTransactions: (params?: StockTransactionListDto) => Promise<import("./_base.d.ts").PaginatedList<StockTransaction>>;
    stockIn: (dto: Omit<StockInDto, "type"> & {
        type: StockInOperationType;
    }) => import("../../../types/generated/index").Promise<StockTransaction>;
    stockOut: (dto: Omit<StockOutDto, "type"> & {
        type: StockOutOperationType;
    }) => import("../../../types/generated/index").Promise<StockTransaction>;
    stockTransfer: (dto: StockTransferDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    stockAdjust: (dto: StockAdjustDto) => import("../../../types/generated/index").Promise<StockTransaction>;
    checkStock: (params: StockCheckDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").StockCheckResponseDto>;
    balancePreview: (dto: StockBalancePreviewDto) => import("../../../types/generated/index").Promise<import("./warehouse.service.d.ts").StockBalancePreviewResponseDto>;
    stockLocationPrecheck: (dto: StockLocationPrecheckInputDto) => import("../../../types/generated/index").Promise<import("./warehouse.service.d.ts").StockLocationPrecheckResponseDto>;
    stockLocationDistribution: (dto: StockLocationDistributionDto) => import("../../../types/generated/index").Promise<import("./warehouse.service.d.ts").StockLocationDistributionResponseDto>;
    stockFreeze: (dto: StockFreezeDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").Stock>;
    stockUnfreeze: (dto: StockUnfreezeDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").Stock>;
    batchAdjust: (dto: BatchAdjustDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").BatchAdjustResponseDto>;
};

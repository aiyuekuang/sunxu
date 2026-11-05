import type { Material } from './Material.d.ts';
import type { ProductionReceiptItem } from './ProductionReceiptItem.d.ts';
import type { ProductionReceiptStatus } from './ProductionReceiptStatus.d.ts';
import type { ProductionReceiptVarianceAction } from './ProductionReceiptVarianceAction.d.ts';
import type { QualityRelease } from './QualityRelease.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
export type ProductionReceiptOrder = {
    /**
     * 接收实收数量（产品基础单位，确认后写入）
     */
    actualReceiptQty?: number | null;
    /**
     * 后端状态机计算的当前可执行动作
     */
    availableActions: Array<string>;
    /**
     * 产出批次
     */
    batchNo?: string | null;
    /**
     * 取消原因
     */
    cancelReason?: string | null;
    companyId: string;
    /**
     * 库存接收确认人
     */
    confirmBy?: string | null;
    /**
     * 库存接收确认时间
     */
    confirmedAt?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 确认时冻结的差异结转动作快照
     */
    diffAction?: ProductionReceiptVarianceAction | null;
    /**
     * 确认时冻结的实收差异数量快照（产品基础单位）
     */
    diffQty?: number | null;
    /**
     * 实收差异原因（production_receipt_diff_reason 字典值，实收数量与计划不一致时必填）
     */
    diffReason?: string | null;
    id: string;
    items?: Array<ProductionReceiptItem>;
    location?: WarehouseLocation | null;
    /**
     * 确认入库仓位ID
     */
    locationId?: string | null;
    material?: Material;
    materialId: string;
    operationId?: string | null;
    /**
     * 计划入库数量（产品基础单位）
     */
    plannedReceiptQty: number;
    qualityRelease?: QualityRelease | null;
    /**
     * 本单消费的权威质量放行记录
     */
    qualityReleaseId?: string | null;
    receiptNo: string;
    remarks?: string | null;
    /**
     * 来源报工流水ID集合
     */
    reportLogIds: Array<string>;
    /**
     * 冲正后发现实物异常形成的生产不合格记录ID
     */
    reverseNonconformanceId?: string | null;
    /**
     * 冲正原因（production_receipt_reverse_reason 字典值）
     */
    reverseReason?: string | null;
    /**
     * 非完整包装特批原因（production_receipt_special_reason 字典值，特批生成时必填）
     */
    specialReason?: string | null;
    status: ProductionReceiptStatus;
    /**
     * 存放位置快照
     */
    storageLocationSnapshot?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    /**
     * 差异自动形成的生产不合格记录ID
     */
    varianceNonconformanceId?: string | null;
    warehouse?: Warehouse | null;
    warehouseId?: string | null;
    workOrder?: WorkOrder;
    workOrderId: string;
};

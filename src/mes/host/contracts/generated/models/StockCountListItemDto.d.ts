import type { StockCountLine } from './StockCountLine.d.ts';
import type { StockCountMode } from './StockCountMode.d.ts';
import type { StockCountStatus } from './StockCountStatus.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type StockCountListItemDto = {
    /**
     * 审核时间
     */
    approvedAt?: string | null;
    /**
     * 审核人
     */
    approvedBy?: string | null;
    approver?: User | null;
    /**
     * 当前用户可执行的单据动作
     */
    availableActions: Array<string>;
    /**
     * 取消原因
     */
    cancelReason?: string | null;
    /**
     * 取消时间
     */
    cancelledAt?: string | null;
    /**
     * 取消人
     */
    cancelledBy?: string | null;
    companyId: string;
    /**
     * 盘点日期
     */
    countDate: string;
    /**
     * 盘点方式：明盘展示账面数，盲盘在提交前隐藏账面数
     */
    countMode: StockCountMode;
    /**
     * 盘点单号
     */
    countNo: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    /**
     * 盘点行数
     */
    lineCount: number;
    lines?: Array<StockCountLine>;
    location?: WarehouseLocation | null;
    /**
     * 盘点仓位ID；为空表示仓库级盘点
     */
    locationId?: string | null;
    /**
     * 备注
     */
    remarks?: string | null;
    /**
     * 冲正实际业务日期
     */
    reversalBusinessDate?: string | null;
    /**
     * 冲正原因
     */
    reversalReason?: string | null;
    /**
     * 冲正时间
     */
    reversedAt?: string | null;
    /**
     * 冲正人
     */
    reversedBy?: string | null;
    /**
     * 盘点明细快照完成时间；此后盘点范围发生库存变动时必须重新盘点
     */
    snapshotAt: string;
    /**
     * 盘点状态
     */
    status: StockCountStatus;
    /**
     * 仓位/存放位置快照
     */
    storageLocationSnapshot?: string | null;
    /**
     * 提交时间
     */
    submittedAt?: string | null;
    /**
     * 提交人
     */
    submittedBy?: string | null;
    submitter?: User | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    /**
     * 差异数量绝对值合计
     */
    varianceAbsQty: number;
    /**
     * 差异行数
     */
    varianceLineCount: number;
    warehouse?: Warehouse;
    /**
     * 盘点仓库ID
     */
    warehouseId: string;
};

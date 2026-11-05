import type { Tooling } from './Tooling.d.ts';
import type { ToolingSession } from './ToolingSession.d.ts';
import type { ToolingUsageRecordStatus } from './ToolingUsageRecordStatus.d.ts';
import type { ToolingUsageSource } from './ToolingUsageSource.d.ts';
import type { User } from './User.d.ts';
import type { WorkOrderOperation } from './WorkOrderOperation.d.ts';
import type { WorkOrderReportLog } from './WorkOrderReportLog.d.ts';
export type ToolingUsageRecordListItemDto = {
    companyId: string;
    /**
     * 寿命计数单位快照
     */
    countUnit?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    /**
     * 寿命周期快照
     */
    lifeCycle: number;
    /**
     * 关联物料名称
     */
    materialName?: string | null;
    /**
     * 业务发生时间
     */
    occurredAt: string;
    /**
     * 操作人姓名
     */
    operatorName?: string | null;
    /**
     * 说明
     */
    remark?: string | null;
    reportLog?: WorkOrderReportLog | null;
    /**
     * 来源报工流水ID
     */
    reportLogId?: string | null;
    /**
     * 来源报工的产品总产出数量
     */
    reportedProductQty?: number | null;
    /**
     * 冲正说明
     */
    reverseRemark?: string | null;
    /**
     * 冲正时间
     */
    reversedAt?: string | null;
    /**
     * 冲正人ID
     */
    reversedBy?: string | null;
    /**
     * 已冲回的来源产品数量
     */
    reversedProductQty: number;
    /**
     * 已冲回的寿命消耗数量
     */
    reversedUseCount: number;
    session?: ToolingSession | null;
    sessionId?: string | null;
    source: ToolingUsageSource;
    status: ToolingUsageRecordStatus;
    tooling: Tooling;
    /**
     * 工装编号
     */
    toolingCode?: string | null;
    toolingId: string;
    /**
     * 工装名称
     */
    toolingName?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    /**
     * 本次寿命消耗数量
     */
    useCount: number;
    /**
     * 关联工单号
     */
    workOrderNo?: string | null;
    workOrderOp?: WorkOrderOperation | null;
    workOrderOpId?: string | null;
    /**
     * 关联工序名称
     */
    workOrderOpName?: string | null;
};

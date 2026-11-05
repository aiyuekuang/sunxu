import type { Customer } from './Customer.d.ts';
import type { CustomerMaterialDispositionItem } from './CustomerMaterialDispositionItem.d.ts';
import type { CustomerMaterialDispositionStatus } from './CustomerMaterialDispositionStatus.d.ts';
import type { CustomerMaterialDispositionType } from './CustomerMaterialDispositionType.d.ts';
import type { User } from './User.d.ts';
export type CustomerMaterialDispositionOrder = {
    /**
     * 当前可用业务动作
     */
    availableActions?: Array<string>;
    companyId: string;
    /**
     * 确认时间
     */
    confirmedAt: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 查询展示关联；客户归属仍以 customerId 为唯一业务事实。
     */
    customer?: Customer;
    /**
     * 客户ID
     */
    customerId: string;
    /**
     * 处置发生时间
     */
    disposedAt: string;
    /**
     * 处置单号
     */
    dispositionNo: string;
    /**
     * 处置类型：退回、遗失、报废
     */
    dispositionType: CustomerMaterialDispositionType;
    id: string;
    /**
     * 客户端幂等键；同公司内重复提交会返回同一张处置单
     */
    idempotencyKey?: string | null;
    items?: Array<CustomerMaterialDispositionItem>;
    /**
     * 物流单号
     */
    logisticsNo?: string | null;
    /**
     * 原因码
     */
    reasonCode?: string | null;
    /**
     * 备注
     */
    remark?: string | null;
    /**
     * 冲正实际执行日期
     */
    reversalDate?: string | null;
    /**
     * 冲正原因
     */
    reversalReason?: string | null;
    /**
     * 冲正时间
     */
    reversedAt?: string | null;
    /**
     * 冲正人ID
     */
    reversedBy?: string | null;
    /**
     * 冲正人
     */
    reverser?: User | null;
    /**
     * 处置状态；确认即写库存和来源分摊，不保留伪草稿
     */
    status: CustomerMaterialDispositionStatus;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

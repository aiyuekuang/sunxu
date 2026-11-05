import type { ProductionSupplyBizType } from './ProductionSupplyBizType.d.ts';
import type { ProductionSupplyItem } from './ProductionSupplyItem.d.ts';
import type { ProductionSupplyStatus } from './ProductionSupplyStatus.d.ts';
import type { User } from './User.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
import type { WorkOrderOperation } from './WorkOrderOperation.d.ts';
export type ProductionSupplyOrder = {
    /**
     * 当前用户可执行的业务动作
     */
    availableActions?: Array<string>;
    bizType: ProductionSupplyBizType;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    items?: Array<ProductionSupplyItem>;
    operation?: WorkOrderOperation | null;
    operationId?: string | null;
    operator?: User | null;
    operatorId?: string | null;
    remarks?: string | null;
    /**
     * 冲正业务日期
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
     * 冲正人ID
     */
    reversedBy?: string | null;
    status: ProductionSupplyStatus;
    supplyNo: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    workOrder?: WorkOrder;
    workOrderId: string;
};

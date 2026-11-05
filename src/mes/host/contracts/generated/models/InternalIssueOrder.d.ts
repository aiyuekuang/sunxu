import type { Department } from './Department.d.ts';
import type { Equipment } from './Equipment.d.ts';
import type { EquipmentFault } from './EquipmentFault.d.ts';
import type { EquipmentMaintenance } from './EquipmentMaintenance.d.ts';
import type { InternalIssueItem } from './InternalIssueItem.d.ts';
import type { InternalIssueStatus } from './InternalIssueStatus.d.ts';
import type { InternalIssueType } from './InternalIssueType.d.ts';
import type { User } from './User.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
export type InternalIssueOrder = {
    /**
     * 当前状态允许的业务操作
     */
    availableActions?: Array<string>;
    cancelReason?: string | null;
    cancelledAt?: string | null;
    companyId: string;
    completedAt?: string | null;
    completedBy?: string | null;
    completer?: User | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    department?: Department | null;
    departmentId?: string | null;
    equipment?: Equipment | null;
    equipmentId?: string | null;
    fault?: EquipmentFault | null;
    faultId?: string | null;
    id: string;
    issueNo: string;
    /**
     * 内部领用类型
     */
    issueType: InternalIssueType;
    items?: Array<InternalIssueItem>;
    maintenance?: EquipmentMaintenance | null;
    maintenanceId?: string | null;
    remarks?: string | null;
    requester?: User | null;
    requesterId?: string | null;
    status: InternalIssueStatus;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    workOrder?: WorkOrder | null;
    workOrderId?: string | null;
};

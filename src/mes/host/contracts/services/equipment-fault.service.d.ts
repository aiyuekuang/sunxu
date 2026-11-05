import type { CreateFaultDto } from '../generated/models/CreateFaultDto.d.ts';
import type { StartRepairDto } from '../generated/models/StartRepairDto.d.ts';
import type { CompleteRepairDto } from '../generated/models/CompleteRepairDto.d.ts';
import type { VerifyFaultDto } from '../generated/models/VerifyFaultDto.d.ts';
import type { CancelFaultDto } from '../generated/models/CancelFaultDto.d.ts';
export type FaultStatus = 'open' | 'in_repair' | 'pending_verify' | 'resolved' | 'cancelled';
export type { EquipmentFault } from '../generated/models/EquipmentFault.d.ts';
import type { EquipmentFault } from '../generated/models/EquipmentFault.d.ts';
interface FaultListParams {
    page?: number;
    pageSize?: number;
    equipmentId?: string;
    status?: FaultStatus;
    severity?: string;
    keyword?: string;
}
export declare const equipmentFaultService: {
    create: (dto: CreateFaultDto) => import("../../../types/generated/index").Promise<EquipmentFault>;
    startRepair: (dto: StartRepairDto) => import("../../../types/generated/index").Promise<EquipmentFault>;
    completeRepair: (dto: CompleteRepairDto) => import("../../../types/generated/index").Promise<EquipmentFault>;
    verify: (dto: VerifyFaultDto) => import("../../../types/generated/index").Promise<EquipmentFault>;
    cancel: (dto: CancelFaultDto) => import("../../../types/generated/index").Promise<EquipmentFault>;
    list(params?: FaultListParams): Promise<import("./_base.d.ts").PaginatedList<EquipmentFault>>;
    detail(id: string): Promise<EquipmentFault>;
};

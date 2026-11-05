import { type PaginatedList } from './_base.d.ts';
import type { EquipmentInspectionPhotoUploadResponseDto } from '../generated/models/EquipmentInspectionPhotoUploadResponseDto.d.ts';
export type EquipmentStatus = 'active' | 'occupied' | 'maintenance' | 'repair' | 'retired';
export type MaintenanceStatus = 'pending' | 'submitted' | 'in_progress' | 'completed' | 'cancelled';
export interface EquipmentInspectionTemplateItem {
    id: string;
    name: string;
    standard?: string;
    checkType?: 'judgment' | 'numeric' | 'selection' | 'text';
    unit?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
    options?: string[];
    required?: boolean;
    photoRule?: 'none' | 'always' | 'abnormal';
}
import type { Equipment as EquipmentGenerated } from '../generated/models/Equipment.d.ts';
export type Equipment = Omit<EquipmentGenerated, 'inspectionTemplate' | 'status'> & {
    status: EquipmentStatus;
    inspectionTemplate: EquipmentInspectionTemplateItem[];
};
export interface InspectionItem {
    id: string;
    name: string;
    standard?: string;
    result?: 'normal' | 'abnormal';
    actualValue?: number;
    actualText?: string;
    unit?: string | null;
    remark?: string;
    photoEvidenceIds?: string[];
    photoUrls?: string[];
    photoEvidence?: Array<{
        id: string;
        url: string;
        locationLabel: string;
        capturedAt: string;
    }>;
}
export type { CopyEquipmentDto } from '../generated/models/CopyEquipmentDto.d.ts';
import type { EquipmentInspection as EquipmentInspectionGenerated } from '../generated/models/EquipmentInspection.d.ts';
import type { EquipmentMaintenance as EquipmentMaintenanceGenerated } from '../generated/models/EquipmentMaintenance.d.ts';
import type { EquipmentListDto } from '../generated/models/EquipmentListDto.d.ts';
import type { CreateEquipmentDto } from '../generated/models/CreateEquipmentDto.d.ts';
import type { UpdateEquipmentDto } from '../generated/models/UpdateEquipmentDto.d.ts';
import type { CreateInspectionDto } from '../generated/models/CreateInspectionDto.d.ts';
import type { InspectionListDto } from '../generated/models/InspectionListDto.d.ts';
import type { EquipmentInspectionTask } from '../generated/models/EquipmentInspectionTask.d.ts';
import type { EquipmentInspectionTaskListDto } from '../generated/models/EquipmentInspectionTaskListDto.d.ts';
import type { CreateInspectionGateReleaseDto } from '../generated/models/CreateInspectionGateReleaseDto.d.ts';
import type { CreateMaintenanceDto } from '../generated/models/CreateMaintenanceDto.d.ts';
import type { CompleteMaintenanceDto } from '../generated/models/CompleteMaintenanceDto.d.ts';
import type { MaintenanceListDto } from '../generated/models/MaintenanceListDto.d.ts';
import type { CopyEquipmentDto } from '../generated/models/CopyEquipmentDto.d.ts';
type EquipmentListWithChildWorkCenters = EquipmentListDto & {
    includeChildWorkCenters?: boolean;
};
export type MaintenanceStep = NonNullable<EquipmentMaintenanceGenerated['steps']>[number];
export type EquipmentMaintenance = EquipmentMaintenanceGenerated;
export type EquipmentInspection = Omit<EquipmentInspectionGenerated, 'items'> & {
    items: InspectionItem[];
};
export declare const equipmentService: {
    mobileDetail(id: string): Promise<Equipment>;
    updateStatus: (id: string, status: EquipmentStatus) => import("../../../types/generated/index").Promise<EquipmentGenerated>;
    createInspection: (dto: CreateInspectionDto) => import("../../../types/generated/index").Promise<EquipmentInspectionGenerated>;
    listInspections(params: InspectionListDto): Promise<PaginatedList<EquipmentInspection>>;
    listInspectionTasks(params: EquipmentInspectionTaskListDto): Promise<PaginatedList<EquipmentInspectionTask>>;
    /** React Native multipart uploads require a native `{ uri, name, type }` file part. */
    uploadInspectionPhoto(input: {
        uri: string;
        equipmentId: string;
        itemId: string;
        taskId?: string;
    }): Promise<EquipmentInspectionPhotoUploadResponseDto>;
    createInspectionGateRelease: (dto: CreateInspectionGateReleaseDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").EquipmentInspectionGateRelease>;
    createMaintenance: (dto: CreateMaintenanceDto) => import("../../../types/generated/index").Promise<EquipmentMaintenanceGenerated>;
    completeMaintenance: (dto: CompleteMaintenanceDto) => import("../../../types/generated/index").Promise<EquipmentMaintenanceGenerated>;
    cancelMaintenance: (id: string) => import("../../../types/generated/index").Promise<EquipmentMaintenanceGenerated>;
    deleteMaintenance: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    stopMaintenanceRecurring: (id: string) => import("../../../types/generated/index").Promise<EquipmentMaintenanceGenerated>;
    maintenanceDetail: (id: string) => import("../../../types/generated/index").Promise<EquipmentMaintenanceGenerated>;
    listMaintenance(params?: MaintenanceListDto): Promise<PaginatedList<EquipmentMaintenance>>;
    copy: (dto: CopyEquipmentDto) => import("../../../types/generated/index").Promise<EquipmentGenerated>;
    list: (params?: EquipmentListWithChildWorkCenters | undefined) => Promise<PaginatedList<Equipment>>;
    detail: (id: string) => Promise<Equipment>;
    create: (dto: CreateEquipmentDto) => Promise<Equipment>;
    update: (dto: UpdateEquipmentDto) => Promise<Equipment>;
    delete: (id: string) => Promise<unknown>;
};

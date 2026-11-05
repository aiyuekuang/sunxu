import type { EquipmentInspectionTemplate } from './EquipmentInspectionTemplate.d.ts';
import type { EquipmentStatus } from './EquipmentStatus.d.ts';
import type { Supplier } from './Supplier.d.ts';
import type { User } from './User.d.ts';
import type { WorkCenter } from './WorkCenter.d.ts';
export type Equipment = {
    attachments?: Array<string> | null;
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    description?: string | null;
    equipmentType?: string | null;
    id: string;
    /**
     * 点检项目快照；模板启用时接口返回当前模板项，模板停用或缺失时按此快照展示和执行
     */
    inspectionTemplate: Array<{
        id?: string;
        name?: string;
    }>;
    /**
     * 设备点检模板ID
     */
    inspectionTemplateId?: string | null;
    /**
     * 设备点检模板
     */
    inspectionTemplateRef?: EquipmentInspectionTemplate | null;
    isActive: boolean;
    maintSupplier?: Supplier | null;
    maintSupplierId?: string | null;
    manufacturer?: string | null;
    model?: string | null;
    name: string;
    purchaseDate?: string | null;
    purchasePrice?: number | null;
    qrCode?: string | null;
    responsibleUser?: User | null;
    responsibleUserId?: string | null;
    serialNo?: string | null;
    status: EquipmentStatus;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    warrantyExpiry?: string | null;
    workCenter?: WorkCenter | null;
    workCenterId?: string | null;
};

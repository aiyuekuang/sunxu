export type { Material } from '../generated/models/Material.d.ts';
export type { MaterialEffectiveProfileDto } from '../generated/models/MaterialEffectiveProfileDto.d.ts';
export type { MaterialSupplier } from '../generated/models/MaterialSupplier.d.ts';
export type BomStatus = 'draft' | 'active' | 'obsolete';
export { BomScope } from '../generated/models/BomScope.d.ts';
export type { BomHeader } from '../generated/models/BomHeader.d.ts';
export type { BomItem } from '../generated/models/BomItem.d.ts';
export type { CopyBomDto } from '../generated/models/CopyBomDto.d.ts';
import type { Material } from '../generated/models/Material.d.ts';
import type { MaterialListDto } from '../generated/models/MaterialListDto.d.ts';
import type { CreateMaterialDto } from '../generated/models/CreateMaterialDto.d.ts';
import type { UpdateMaterialDto } from '../generated/models/UpdateMaterialDto.d.ts';
import type { BulkMaterialRowDto } from '../generated/models/BulkMaterialRowDto.d.ts';
import type { NextVersionDto } from '../generated/models/NextVersionDto.d.ts';
import type { ActivateBomDto } from '../generated/models/ActivateBomDto.d.ts';
import type { BomListDto } from '../generated/models/BomListDto.d.ts';
import type { CreateBomDto } from '../generated/models/CreateBomDto.d.ts';
import type { UpdateBomDto } from '../generated/models/UpdateBomDto.d.ts';
import type { BomHeader } from '../generated/models/BomHeader.d.ts';
import type { CreateMaterialSupplierDto } from '../generated/models/CreateMaterialSupplierDto.d.ts';
import type { UpdateMaterialSupplierDto } from '../generated/models/UpdateMaterialSupplierDto.d.ts';
import type { MaterialSupplier as GeneratedMaterialSupplier } from '../generated/models/MaterialSupplier.d.ts';
import { MaterialSupplierPriceTier } from '../generated/models/MaterialSupplierPriceTier.d.ts';
import type { CopyBomDto } from '../generated/models/CopyBomDto.d.ts';
import type { BomCompareDto } from '../generated/models/BomCompareDto.d.ts';
export type MaterialSupplierWithDefaultPrice = GeneratedMaterialSupplier & {
    defaultPurchasePrice?: number | null;
    defaultPurchaseCurrency?: string | null;
    defaultPurchasePriceTierId?: string | null;
    defaultPurchaseTaxRate?: number | null;
    defaultPurchasePriceIncludesTax?: boolean | null;
    activePriceTiers?: MaterialSupplierPriceTier[];
};
export interface MaterialListParams extends MaterialListDto {
    includeInactive?: boolean;
}
export declare const materialService: {
    list: (params?: MaterialListParams) => Promise<import("./_base.d.ts").PaginatedList<Material>>;
    deactivate: (id: string) => import("../../../types/generated/index").Promise<Material>;
    toggleActive: (id: string) => import("../../../types/generated/index").Promise<Material>;
    effectiveProfile: (materialId: string) => import("../../../types/generated/index").Promise<import("./material.service.d.ts").MaterialEffectiveProfileDto>;
    drawingPolicy: () => import("../../../types/generated/index").Promise<import("../../../types/generated/index").MaterialDrawingPolicyDto>;
    deleteCheck: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").MaterialLifecycleCheckResponseDto>;
    findByBarcode: (barcode: string) => import("../../../types/generated/index").Promise<Material>;
    generateBarcode: (procurementType?: "buy" | "make" | "both") => Promise<{
        barcode: string;
    }>;
    bulkImport: (rows: BulkMaterialRowDto[]) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").BulkMaterialImportResponseDto>;
    exportTemplate: () => import("../../../types/generated/index").Promise<Blob>;
    exportCsv: () => import("../../../types/generated/index").Promise<Blob>;
    addDrawings: (id: string, urls: string[]) => import("../../../types/generated/index").Promise<Material>;
    removeDrawing: (id: string, url: string) => import("../../../types/generated/index").Promise<Material>;
    detail: (id: string) => Promise<Material>;
    create: (dto: CreateMaterialDto) => Promise<Material>;
    update: (dto: UpdateMaterialDto) => Promise<Material>;
    delete: (id: string) => Promise<unknown>;
};
export declare const materialSupplierService: {
    list: (params: {
        materialId?: string;
        supplierId?: string;
    }, options?: {
        includePriceTiers?: boolean;
    }) => Promise<MaterialSupplierWithDefaultPrice[]>;
    findEffective: (params: {
        materialId: string;
        supplierId: string;
        asOfDate?: string;
    }) => Promise<MaterialSupplierWithDefaultPrice | null>;
    resolveEffectivePrice: (params: {
        materialId: string;
        supplierId: string;
        asOfDate?: string;
        quantity?: number;
        grade?: string | null;
    }) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").ResolvedMaterialSupplierPriceDto>;
    create: (dto: CreateMaterialSupplierDto) => import("../../../types/generated/index").Promise<GeneratedMaterialSupplier>;
    update: (dto: UpdateMaterialSupplierDto) => import("../../../types/generated/index").Promise<GeneratedMaterialSupplier>;
    upsertDefaultPrice: (params: {
        materialId: string;
        supplierId: string;
        unitPrice?: number | null;
        validFrom?: string;
        minOrderQty?: number;
        leadTimeDays?: number;
        remarks?: string;
    }) => import("../../../types/generated/index").Promise<MaterialSupplierPriceTier> | Promise<undefined>;
    delete: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
};
export declare const bomService: {
    nextVersion: (params: string | NextVersionDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").NextVersionResponseDto>;
    create: (dto: CreateBomDto) => import("../../../types/generated/index").Promise<BomHeader>;
    update: (dto: UpdateBomDto) => import("../../../types/generated/index").Promise<BomHeader>;
    activate: (id: string, options?: Omit<ActivateBomDto, "id">) => import("../../../types/generated/index").Promise<BomHeader>;
    deprecate: (id: string) => import("../../../types/generated/index").Promise<BomHeader>;
    delete: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    copy: (dto: CopyBomDto) => import("../../../types/generated/index").Promise<BomHeader>;
    compare: (dto: BomCompareDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").BomCompareResponseDto>;
    cost: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").BomCostResponseDto>;
    whereUsed: (materialId: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").WhereUsedResponseDto>;
    listSelectableForMaterial: (materialId: string) => import("../../../types/generated/index").Promise<BomHeader[]>;
    list(params?: BomListDto): Promise<import("./_base.d.ts").PaginatedList<BomHeader>>;
    detail(id: string): Promise<BomHeader>;
};

import type { MrpCalculateDto } from '../generated/models/MrpCalculateDto.d.ts';
import type { MrpCalculateResponseDto } from '../generated/models/MrpCalculateResponseDto.d.ts';
import type { MrpItemDto } from '../generated/models/MrpItemDto.d.ts';
import type { MrpRun } from '../generated/models/MrpRun.d.ts';
import type { MrpProductionReleaseDto } from '../generated/models/MrpProductionReleaseDto.d.ts';
import type { MrpProductionReleaseResponseDto } from '../generated/models/MrpProductionReleaseResponseDto.d.ts';
export type MrpSuggestion = 'purchase' | 'produce' | 'customer_supply' | 'sufficient';
export type MrpCalculationMode = NonNullable<MrpCalculateDto['calculationMode']>;
export type MrpBomExplosionMode = NonNullable<MrpCalculateDto['bomExplosionMode']>;
export interface MrpItemSource {
    planId: string;
    planNo: string;
    planMaterial: string;
    priority?: number;
    planStartDate?: string;
    qty: number;
    allocatedAvailableQty?: number;
    shortageQty?: number;
    calculationSnapshots?: Array<Record<string, unknown>>;
}
export interface MrpItem {
    runItemId?: string;
    materialId: string;
    materialName: string;
    materialCode: string;
    ownerType?: string | null;
    ownerRefId?: string | null;
    unit: string;
    grossRequirement: number;
    issuedQty: number;
    currentStock: number;
    onOrderQty: number;
    pendingPrQty: number;
    inProductionQty: number;
    safetyStock: number;
    netRequirement: number;
    suggestion: MrpSuggestion;
    suggestedQty?: number;
    leadTimeDays?: number | null;
    latestOrderDate?: string | null;
    leadTimeWarning: boolean;
    sources: MrpItemSource[];
    supplyAllocations: MrpItemDto['supplyAllocations'];
}
export interface MrpResult {
    runId: string;
    runNo: string;
    calculationMode: MrpCalculateResponseDto['calculationMode'];
    bomExplosionMode: MrpCalculateResponseDto['bomExplosionMode'];
    items: MrpItem[];
    summary: MrpCalculateResponseDto['summary'];
}
export declare const mrpService: {
    calculate: (dto: MrpCalculateDto) => Promise<MrpResult>;
    runDetail: (id: string) => Promise<MrpRun>;
    releaseProduction: (dto: MrpProductionReleaseDto) => Promise<MrpProductionReleaseResponseDto>;
};

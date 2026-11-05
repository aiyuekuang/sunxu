import type { QualityTemplateListDto } from '../generated/models/QualityTemplateListDto.d.ts';
import type { CreateQualityTemplateDto } from '../generated/models/CreateQualityTemplateDto.d.ts';
import type { UpdateQualityTemplateDto } from '../generated/models/UpdateQualityTemplateDto.d.ts';
import type { CopyQualityTemplateDto } from '../generated/models/CopyQualityTemplateDto.d.ts';
export type InspectionType = 'iqc' | 'ipqc' | 'fqc' | 'oqc';
export type { CopyQualityTemplateDto } from '../generated/models/CopyQualityTemplateDto.d.ts';
export type { TemplateItemDto as TemplateItem } from '../generated/models/TemplateItemDto.d.ts';
import type { QualityTemplate as QualityTemplateGenerated } from '../generated/models/QualityTemplate.d.ts';
import type { TemplateItemDto as TemplateItem } from '../generated/models/TemplateItemDto.d.ts';
export type QualityTemplate = Omit<QualityTemplateGenerated, 'items'> & {
    items: TemplateItem[];
};
export declare const qualityTemplateService: {
    create: (dto: CreateQualityTemplateDto) => Promise<QualityTemplate>;
    update: (dto: UpdateQualityTemplateDto) => Promise<QualityTemplate>;
    toggleActive: (id: string) => Promise<QualityTemplate>;
    delete: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    copy: (dto: CopyQualityTemplateDto) => import("../../../types/generated/index").Promise<QualityTemplateGenerated>;
    list(params?: QualityTemplateListDto): Promise<import("./_base.d.ts").PaginatedList<QualityTemplate>>;
    detail(id: string): Promise<QualityTemplate>;
};

import type { MaterialType } from '../generated/models/MaterialType.d.ts';
import type { SuccessResponseDto } from '../generated/models/SuccessResponseDto.d.ts';
import { type PaginatedList } from './_base.d.ts';
export interface MaterialCategory {
    id: string;
    createdAt: string;
    updatedAt: string;
    companyId: string;
    code: string;
    name: string;
    parentId?: string | null;
    baseType: MaterialType;
    isSystem: boolean;
    isActive: boolean;
    sort: number;
}
export interface MaterialCategoryListItem {
    id: string;
    code: string;
    name: string;
    parentId?: string | null;
    parentName?: string | null;
    baseType: MaterialType;
    fullPath: string;
    isSystem: boolean;
    isActive: boolean;
    sort: number;
    materialCount: number;
}
export interface MaterialCategoryTreeNode {
    id: string;
    code: string;
    name: string;
    parentId?: string | null;
    baseType: MaterialType;
    isSystem: boolean;
    isActive: boolean;
    sort: number;
    children: MaterialCategoryTreeNode[];
}
export interface MaterialCategorySelectable {
    id: string;
    code: string;
    name: string;
    displayName: string;
    baseType: MaterialType;
    parentId?: string | null;
    isSystem: boolean;
}
export interface MaterialCategoryListParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
    baseType?: MaterialType;
    parentId?: string;
    includeInactive?: boolean;
    isActive?: boolean;
}
export interface MaterialCategoryTreeParams {
    includeInactive?: boolean;
}
export interface MaterialCategorySelectableParams {
    baseType?: MaterialType;
}
export interface CreateMaterialCategoryDto {
    code: string;
    name: string;
    parentId: string;
    sort?: number;
    isActive?: boolean;
}
export interface UpdateMaterialCategoryDto {
    id: string;
    code?: string;
    name?: string;
    parentId?: string;
    sort?: number;
    isActive?: boolean;
}
export declare const materialCategoryService: {
    list(params?: MaterialCategoryListParams): Promise<PaginatedList<MaterialCategoryListItem>>;
    tree(params?: MaterialCategoryTreeParams): Promise<MaterialCategoryTreeNode[]>;
    selectable(params?: MaterialCategorySelectableParams): Promise<MaterialCategorySelectable[]>;
    create(dto: CreateMaterialCategoryDto): Promise<MaterialCategory>;
    update(dto: UpdateMaterialCategoryDto): Promise<MaterialCategory>;
    delete(id: string): Promise<SuccessResponseDto>;
};

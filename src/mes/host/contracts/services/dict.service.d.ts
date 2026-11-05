import { type PaginatedList } from './_base.d.ts';
export type { DictItem } from '../generated/models/DictItem.d.ts';
export type { IndustryPackDto as IndustryPack } from '../generated/models/IndustryPackDto.d.ts';
export type { IndustryPackPreviewDto as IndustryPackPreview } from '../generated/models/IndustryPackPreviewDto.d.ts';
export type { ApplyIndustryPackResponseDto as ApplyIndustryPackResponse } from '../generated/models/ApplyIndustryPackResponseDto.d.ts';
import type { DictItem } from '../generated/models/DictItem.d.ts';
import type { IndustryPackDto } from '../generated/models/IndustryPackDto.d.ts';
import type { IndustryPackPreviewDto } from '../generated/models/IndustryPackPreviewDto.d.ts';
import type { ListDictItemsDto } from '../generated/models/ListDictItemsDto.d.ts';
import type { CreateDictItemDto } from '../generated/models/CreateDictItemDto.d.ts';
import type { UpdateDictItemDto } from '../generated/models/UpdateDictItemDto.d.ts';
import type { SuccessResponseDto } from '../generated/models/SuccessResponseDto.d.ts';
import type { ListDictTypesDto } from '../generated/models/ListDictTypesDto.d.ts';
import type { CreateDictTypeDto } from '../generated/models/CreateDictTypeDto.d.ts';
import type { UpdateDictTypeDto } from '../generated/models/UpdateDictTypeDto.d.ts';
export interface DictTypeDefinition {
    typeCode: string;
    typeName: string;
    remark?: string | null;
    group?: string;
}
export declare const dictService: {
    /** 最常用：按 typeCode 获取下拉选项 */
    getItems: (typeCode: string) => Promise<DictItem[]>;
    listItems(params: ListDictItemsDto): Promise<PaginatedList<DictItem>>;
    createItem: (dto: CreateDictItemDto) => Promise<DictItem>;
    updateItem: (dto: UpdateDictItemDto) => Promise<DictItem>;
    deleteItem: (id: string) => Promise<SuccessResponseDto>;
    sortItems: (typeCode: string, ids: string[]) => Promise<SuccessResponseDto>;
    listTypes(params?: ListDictTypesDto): Promise<PaginatedList<DictTypeDefinition>>;
    createType: (dto: CreateDictTypeDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").DictType>;
    updateType: (dto: UpdateDictTypeDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").DictType>;
    deleteType: (id: string) => Promise<SuccessResponseDto>;
    listIndustryPacks: () => Promise<IndustryPackDto[]>;
    getIndustryPackPreview: (packCode: string) => Promise<IndustryPackPreviewDto>;
    applyIndustryPack: (packCode: string) => import("../../../types/generated/index").Promise<import("./dict.service.d.ts").ApplyIndustryPackResponse>;
};

import type { WorkCenterListDto } from '../generated/models/WorkCenterListDto.d.ts';
import type { CreateWorkCenterDto } from '../generated/models/CreateWorkCenterDto.d.ts';
import type { UpdateWorkCenterDto } from '../generated/models/UpdateWorkCenterDto.d.ts';
import type { WorkCenterTreeNodeDto } from '../generated/models/WorkCenterTreeNodeDto.d.ts';
import type { SuccessResponseDto } from '../generated/models/SuccessResponseDto.d.ts';
export type { WorkCenter } from '../generated/models/WorkCenter.d.ts';
import type { WorkCenter } from '../generated/models/WorkCenter.d.ts';
/** WorkCenterBrief — 简化的工作中心类型（前端子类型） */
export type WorkCenterBrief = Pick<WorkCenter, 'id' | 'code' | 'name' | 'type'>;
export declare const workCenterService: {
    tree: () => Promise<WorkCenterTreeNodeDto[]>;
    create: (dto: CreateWorkCenterDto) => Promise<WorkCenter>;
    update: (dto: UpdateWorkCenterDto) => Promise<WorkCenter>;
    toggleActive: (id: string) => Promise<WorkCenter>;
    delete: (id: string) => Promise<SuccessResponseDto>;
    list(params?: WorkCenterListDto): Promise<import("./_base.d.ts").PaginatedList<WorkCenter>>;
    detail(id: string): Promise<WorkCenter>;
};

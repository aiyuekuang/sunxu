import type { DisposalOrder } from '../generated/models/DisposalOrder.d.ts';
import type { DisposalListDto } from '../generated/models/DisposalListDto.d.ts';
import type { CreateDisposalDto } from '../generated/models/CreateDisposalDto.d.ts';
import type { ExecuteDisposalDto } from '../generated/models/ExecuteDisposalDto.d.ts';
export type { DisposalType } from '../generated/models/DisposalType.d.ts';
export type { DisposalStatus } from '../generated/models/DisposalStatus.d.ts';
export type { DisposalOrder } from '../generated/models/DisposalOrder.d.ts';
export interface UpdateDisposalDto {
    id: string;
    type?: CreateDisposalDto.type;
    qty?: number;
    remarks?: string;
}
export type ExecuteDisposalRequestDto = ExecuteDisposalDto;
export declare const disposalService: {
    create: (dto: CreateDisposalDto) => Promise<DisposalOrder>;
    update: (dto: UpdateDisposalDto) => Promise<DisposalOrder>;
    execute: (payload: string | ExecuteDisposalRequestDto) => Promise<DisposalOrder>;
    cancel: (id: string, reason: string) => Promise<DisposalOrder>;
    list(params?: DisposalListDto): Promise<import("./_base.d.ts").PaginatedList<DisposalOrder>>;
    detail(id: string): Promise<DisposalOrder>;
};

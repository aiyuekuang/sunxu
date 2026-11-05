import type { CreateTemporaryWorkerDto } from '../generated/models/CreateTemporaryWorkerDto.d.ts';
import type { TemporaryWorkerListDto } from '../generated/models/TemporaryWorkerListDto.d.ts';
import type { UpdateTemporaryWorkerDto } from '../generated/models/UpdateTemporaryWorkerDto.d.ts';
export type { TemporaryWorker } from '../generated/models/TemporaryWorker.d.ts';
import type { TemporaryWorker } from '../generated/models/TemporaryWorker.d.ts';
export declare const temporaryWorkerService: {
    /** The backend's delete action deactivates the archive and preserves report history. */
    deactivate: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    list: (params?: TemporaryWorkerListDto | undefined) => Promise<import("./_base.d.ts").PaginatedList<TemporaryWorker>>;
    detail: (id: string) => Promise<TemporaryWorker>;
    create: (dto: CreateTemporaryWorkerDto) => Promise<TemporaryWorker>;
    update: (dto: UpdateTemporaryWorkerDto) => Promise<TemporaryWorker>;
    delete: (id: string) => Promise<unknown>;
};

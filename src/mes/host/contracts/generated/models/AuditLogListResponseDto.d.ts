import type { AuditLogItemDto } from './AuditLogItemDto.d.ts';
export type AuditLogListResponseDto = {
    list: Array<AuditLogItemDto>;
    page: number;
    pageSize: number;
    total: number;
};

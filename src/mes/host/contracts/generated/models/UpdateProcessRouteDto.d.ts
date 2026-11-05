import type { ProcessOperationDto } from './ProcessOperationDto.d.ts';
export type UpdateProcessRouteDto = {
    /**
     * 路线说明
     */
    description?: string;
    /**
     * 路线ID
     */
    id: string;
    /**
     * 路线名称（仅未启用过的 V1 原始草稿可修改；复制版本、启用版本和历史版本会被拒绝）
     */
    name?: string;
    operations?: Array<ProcessOperationDto>;
    /**
     * 版本号
     */
    version?: string;
};

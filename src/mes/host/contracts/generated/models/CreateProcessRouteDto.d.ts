import type { ProcessOperationDto } from './ProcessOperationDto.d.ts';
export type CreateProcessRouteDto = {
    /**
     * 路线编码（留空自动生成）
     */
    code?: string;
    /**
     * 路线说明
     */
    description?: string;
    /**
     * 路线名称
     */
    name: string;
    operations?: Array<ProcessOperationDto>;
};

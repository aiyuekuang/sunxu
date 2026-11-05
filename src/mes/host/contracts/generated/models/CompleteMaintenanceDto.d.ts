import type { MaintenanceStepDto } from './MaintenanceStepDto.d.ts';
export type CompleteMaintenanceDto = {
    completedDate: string;
    id: string;
    result?: string;
    /**
     * 保养步骤执行快照
     */
    steps?: Array<MaintenanceStepDto>;
};

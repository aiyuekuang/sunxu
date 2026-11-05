import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type SessionListDto = {
    equipmentId?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    myOnly?: boolean;
    operatorId?: string;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    status?: SessionListDto.status;
    statuses?: Array<'running' | 'completed' | 'interrupted'>;
};
export declare namespace SessionListDto {
    enum status {
        RUNNING = "running",
        COMPLETED = "completed",
        INTERRUPTED = "interrupted"
    }
}

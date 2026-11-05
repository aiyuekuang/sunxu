import type { BulkWorkOrderRowDto } from './BulkWorkOrderRowDto.d.ts';
export type BulkImportWorkOrderDto = {
    /**
     * 批量导入行
     */
    rows: Array<BulkWorkOrderRowDto>;
};

import type { TraceBatchMaterialDto } from './TraceBatchMaterialDto.d.ts';
import type { TraceBatchWarehouseDto } from './TraceBatchWarehouseDto.d.ts';
export type TraceBatchLookupDto = {
    batchNo: string;
    id: string;
    material?: TraceBatchMaterialDto | null;
    qty: number;
    status: TraceBatchLookupDto.status;
    warehouse?: TraceBatchWarehouseDto | null;
};
export declare namespace TraceBatchLookupDto {
    enum status {
        AVAILABLE = "available",
        QUARANTINE = "quarantine",
        EXPIRED = "expired",
        CONSUMED = "consumed"
    }
}

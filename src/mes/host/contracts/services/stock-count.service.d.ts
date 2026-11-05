import { type PaginatedList } from './_base.d.ts';
import type { ApproveStockCountDto } from '../generated/models/ApproveStockCountDto.d.ts';
import type { CancelStockCountDto } from '../generated/models/CancelStockCountDto.d.ts';
import type { CreateStockCountDto } from '../generated/models/CreateStockCountDto.d.ts';
import type { StockCountDetailDto } from '../generated/models/StockCountDetailDto.d.ts';
import type { StockCountLine } from '../generated/models/StockCountLine.d.ts';
import type { StockCountListDto } from '../generated/models/StockCountListDto.d.ts';
import type { StockCountListItemDto } from '../generated/models/StockCountListItemDto.d.ts';
import type { SubmitStockCountDto } from '../generated/models/SubmitStockCountDto.d.ts';
import type { UpdateStockCountDto } from '../generated/models/UpdateStockCountDto.d.ts';
import type { ReverseStockCountDto } from '../generated/models/ReverseStockCountDto.d.ts';
export type { StockCountDetailDto, StockCountLine, StockCountListItemDto };
export { StockCountStatus } from '../generated/models/StockCountStatus.d.ts';
export type StockCountListParams = StockCountListDto;
/**
 * 库存盘点 service —— 直接消费后端受控 `warehouseControllerStockCount*` 端点。
 * 列表返回 StockCountListItemDto（含 lineCount/varianceLineCount/varianceAbsQty 派生汇总），
 * 详情返回 StockCountDetailDto（含 lines）。写入动作全部走后端状态机与权限，App 不复制业务判断。
 */
export declare const stockCountService: {
    list(params?: StockCountListParams): Promise<PaginatedList<StockCountListItemDto>>;
    detail: (id: string) => Promise<StockCountDetailDto>;
    create: (dto: CreateStockCountDto) => Promise<StockCountDetailDto>;
    update: (dto: UpdateStockCountDto) => Promise<StockCountDetailDto>;
    start: (id: string) => Promise<StockCountDetailDto>;
    submit: (dto: SubmitStockCountDto) => Promise<StockCountDetailDto>;
    approve: (dto: ApproveStockCountDto) => Promise<StockCountDetailDto>;
    cancel: (dto: CancelStockCountDto) => Promise<StockCountDetailDto>;
    reverse: (dto: ReverseStockCountDto) => Promise<StockCountDetailDto>;
};

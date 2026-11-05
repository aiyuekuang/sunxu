import type { StockCountLineInputDto } from './StockCountLineInputDto.d.ts';
export type CreateStockCountDto = {
    /**
     * 盘点日期；不传默认当前时间
     */
    countDate?: string;
    /**
     * 盘点方式；不传默认为明盘。盲盘在提交前不展示账面数
     */
    countMode?: CreateStockCountDto.countMode;
    /**
     * 手工指定盘点行；为空时按当前仓库/仓位库存自动生成
     */
    lines?: Array<StockCountLineInputDto>;
    /**
     * 盘点仓位ID；为空表示仓库级盘点
     */
    locationId?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 位置文本快照
     */
    storageLocation?: string;
    /**
     * 盘点仓库ID
     */
    warehouseId: string;
};
export declare namespace CreateStockCountDto {
    /**
     * 盘点方式；不传默认为明盘。盲盘在提交前不展示账面数
     */
    enum countMode {
        OPEN = "open",
        BLIND = "blind"
    }
}

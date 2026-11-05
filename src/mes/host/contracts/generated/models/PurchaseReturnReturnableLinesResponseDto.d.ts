import type { PurchaseReturnReturnableLineDto } from './PurchaseReturnReturnableLineDto.d.ts';
export type PurchaseReturnReturnableLinesResponseDto = {
    lines: Array<PurchaseReturnReturnableLineDto>;
    /**
     * 当前用户是否可见来源入库价格
     */
    priceVisible: boolean;
    sourceReceiptId: string;
};

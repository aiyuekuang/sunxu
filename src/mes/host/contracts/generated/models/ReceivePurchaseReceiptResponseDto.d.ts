import type { PurchaseReceiptDetailDto } from './PurchaseReceiptDetailDto.d.ts';
import type { PurchaseReceiptReceiveOutcome } from './PurchaseReceiptReceiveOutcome.d.ts';
export type ReceivePurchaseReceiptResponseDto = {
    /**
     * 面向操作人的结果说明
     */
    message: string;
    /**
     * 本次收货动作的真实结果
     */
    outcome: PurchaseReceiptReceiveOutcome;
    receipt: PurchaseReceiptDetailDto;
    /**
     * 不阻断收货的提示，例如供应商送货单号重复
     */
    warnings: Array<string>;
};

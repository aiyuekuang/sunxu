import type { PurchaseOrderSendChannel } from './PurchaseOrderSendChannel.d.ts';
export type SendPurchaseOrderDto = {
    /**
     * 发送渠道（不传则仅标记为已发送）
     */
    channel?: PurchaseOrderSendChannel;
    /**
     * ID
     */
    id: string;
};

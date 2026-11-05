import type { PurchaseOrderSendChannel } from './PurchaseOrderSendChannel.d.ts';
export type PurchaseOrderSendOptionDto = {
    /**
     * 是否可由系统直接发送（目前仅邮箱）
     */
    canDirectSend: boolean;
    /**
     * 发送渠道
     */
    channel: PurchaseOrderSendChannel;
    /**
     * 渠道展示名
     */
    label: string;
    /**
     * 目标账号/邮箱
     */
    target?: string | null;
};

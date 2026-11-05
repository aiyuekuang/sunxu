import type { QuotationSendChannel } from './QuotationSendChannel.d.ts';
export type SendQuotationDto = {
    /**
     * 发送渠道（不传则仅标记为已发送，兼容旧版）
     */
    channel?: QuotationSendChannel;
    /**
     * ID
     */
    id: string;
};

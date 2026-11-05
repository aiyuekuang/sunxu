import type { QuotationSendChannel } from './QuotationSendChannel.d.ts';
export type QuotationSendOptionDto = {
    /**
     * 是否可由系统直接发送（目前仅邮箱）
     */
    canDirectSend: boolean;
    /**
     * 发送渠道
     */
    channel: QuotationSendChannel;
    /**
     * 渠道展示名
     */
    label: string;
    /**
     * 尝试唤起客户端的链接
     */
    launchUrl?: string;
    /**
     * 目标账号/邮箱
     */
    target?: string | null;
};

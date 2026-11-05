import type { StatementSendChannel } from './StatementSendChannel.d.ts';
export type StatementSendResultDto = {
    /**
     * 发送渠道
     */
    channel: StatementSendChannel;
    /**
     * 发送时间（ISO）
     */
    sentAt: string;
    /**
     * 发送目标（仅邮件）
     */
    target?: string | null;
};

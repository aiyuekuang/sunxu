import type { StatementSendChannel } from './StatementSendChannel.d.ts';
export type StatementSendOptionDto = {
    /**
     * 是否可由系统直接发送（目前仅邮箱）
     */
    canDirectSend: boolean;
    /**
     * 发送渠道
     */
    channel: StatementSendChannel;
    /**
     * 渠道展示名
     */
    label: string;
    /**
     * 目标邮箱（仅邮件渠道）
     */
    target?: string | null;
};

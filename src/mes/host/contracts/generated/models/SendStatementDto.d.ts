import type { StatementSendChannel } from './StatementSendChannel.d.ts';
export type SendStatementDto = {
    /**
     * 发送渠道（不传默认按复制发送处理）
     */
    channel?: StatementSendChannel;
    /**
     * 对账币别；同一对账单只展示一种原币，多币别往来单位必须显式选择
     */
    currency?: string;
    /**
     * 起始日期
     */
    dateFrom?: string;
    /**
     * 截止日期
     */
    dateTo?: string;
    /**
     * 往来单位标识（支持 UUID / 编码 / 名称）
     */
    partnerId?: string;
    /**
     * 往来单位编码/名称关键词（与 partnerId 二选一）
     */
    partnerKeyword?: string;
    type: SendStatementDto.type;
};
export declare namespace SendStatementDto {
    enum type {
        RECEIVABLE = "receivable",
        PAYABLE = "payable"
    }
}

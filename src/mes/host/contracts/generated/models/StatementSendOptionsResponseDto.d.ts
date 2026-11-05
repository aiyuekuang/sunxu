import type { StatementSendOptionDto } from './StatementSendOptionDto.d.ts';
export type StatementSendOptionsResponseDto = {
    /**
     * 本对账单的原币币别；无发生额且未选择币别时为空
     */
    currency?: string | null;
    /**
     * 起始日期
     */
    dateFrom?: string | null;
    /**
     * 截止日期
     */
    dateTo?: string | null;
    /**
     * 邮件标题建议
     */
    emailSubject: string;
    /**
     * 发送内容（用于复制发送）
     */
    messageContent: string;
    /**
     * 可用发送方式列表（支持邮件与复制发送）
     */
    options: Array<StatementSendOptionDto>;
    /**
     * 往来单位编码
     */
    partnerCode: string;
    /**
     * 往来单位ID
     */
    partnerId: string;
    /**
     * 往来单位名称
     */
    partnerName: string;
    type: StatementSendOptionsResponseDto.type;
};
export declare namespace StatementSendOptionsResponseDto {
    enum type {
        RECEIVABLE = "receivable",
        PAYABLE = "payable"
    }
}

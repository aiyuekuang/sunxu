import type { QuotationSendOptionDto } from './QuotationSendOptionDto.d.ts';
export type QuotationSendOptionsResponseDto = {
    /**
     * 邮件渠道将附带的 PDF 附件文件名
     */
    attachmentFilename: string;
    /**
     * 当前用户能否预览该 PDF 附件（附件含单价与金额，与金额查看权限同口径）
     */
    attachmentPreviewable: boolean;
    /**
     * 客户名称
     */
    customerName?: string | null;
    /**
     * 邮件标题建议
     */
    emailSubject: string;
    /**
     * 发送内容（用于复制发送）
     */
    messageContent: string;
    /**
     * 可用发送方式列表（邮箱按客户资料发送，其余支持复制与系统分享）
     */
    options: Array<QuotationSendOptionDto>;
    /**
     * 报价单ID
     */
    quotationId: string;
    /**
     * 报价单号
     */
    quotationNo: string;
};

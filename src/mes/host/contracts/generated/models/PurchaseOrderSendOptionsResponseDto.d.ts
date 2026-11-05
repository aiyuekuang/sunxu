import type { PurchaseOrderSendOptionDto } from './PurchaseOrderSendOptionDto.d.ts';
export type PurchaseOrderSendOptionsResponseDto = {
    /**
     * 邮件渠道将附带的 PDF 附件文件名
     */
    attachmentFilename: string;
    /**
     * 当前用户能否预览该 PDF 附件（附件含单价与金额，与金额查看权限同口径）
     */
    attachmentPreviewable: boolean;
    /**
     * 邮件标题建议
     */
    emailSubject: string;
    /**
     * 发送内容（用于复制发送）
     */
    messageContent: string;
    /**
     * 可用发送方式列表（邮箱按供应商资料发送，其余支持复制与系统分享）
     */
    options: Array<PurchaseOrderSendOptionDto>;
    /**
     * 采购订单号
     */
    orderNo: string;
    /**
     * 采购订单ID
     */
    purchaseOrderId: string;
    /**
     * 供应商名称
     */
    supplierName?: string | null;
};

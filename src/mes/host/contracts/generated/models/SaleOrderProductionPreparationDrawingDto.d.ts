export type SaleOrderProductionPreparationDrawingDto = {
    /**
     * 是否已在订单明细行关联可下传工单的图纸
     */
    hasDrawing: boolean;
    /**
     * 订单行图纸数
     */
    itemDrawingCount: number;
    /**
     * 订单附件数
     */
    orderAttachmentCount: number;
};

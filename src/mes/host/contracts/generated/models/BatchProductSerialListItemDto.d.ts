export type BatchProductSerialListItemDto = {
    id: string;
    producedAt?: string | null;
    receivedAt?: string | null;
    /**
     * 产品序列号
     */
    serialNo: string;
    status: BatchProductSerialListItemDto.status;
};
export declare namespace BatchProductSerialListItemDto {
    enum status {
        ALLOCATED = "allocated",
        PRODUCED = "produced",
        IN_STOCK = "in_stock",
        SHIPPED = "shipped",
        SCRAPPED = "scrapped",
        VOIDED = "voided"
    }
}

export type CreateDisposalDto = {
    inspectionId: string;
    qty: number;
    remarks?: string;
    type: CreateDisposalDto.type;
    workOrderId?: string;
};
export declare namespace CreateDisposalDto {
    enum type {
        REWORK = "rework",
        SCRAP = "scrap",
        CONCESSION = "concession",
        SORT_ACCEPT = "sort_accept",
        RETURN_TO_SUPPLIER = "return_to_supplier"
    }
}

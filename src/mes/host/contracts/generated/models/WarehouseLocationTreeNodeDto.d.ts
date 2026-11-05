export type WarehouseLocationTreeNodeDto = {
    allowStock: boolean;
    barcode?: string | null;
    children: Array<WarehouseLocationTreeNodeDto>;
    code: string;
    depth: number;
    id: string;
    isActive: boolean;
    name: string;
    parentId?: string | null;
    pathCode: string;
    pathName: string;
    sortOrder: number;
    type: WarehouseLocationTreeNodeDto.type;
    warehouseId: string;
};
export declare namespace WarehouseLocationTreeNodeDto {
    enum type {
        AREA = "area",
        SHELF = "shelf",
        LEVEL = "level",
        BIN = "bin",
        TEMPORARY = "temporary",
        OTHER = "other"
    }
}

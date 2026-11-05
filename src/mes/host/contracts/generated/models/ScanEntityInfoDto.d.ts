import type { ScanEntityInfoItemDto } from './ScanEntityInfoItemDto.d.ts';
export type ScanEntityInfoDto = {
    code: string;
    entityType: ScanEntityInfoDto.entityType;
    id: string;
    infoItems: Array<ScanEntityInfoItemDto>;
    status?: string | null;
    statusLabel?: string | null;
    subtitle?: string | null;
    title: string;
};
export declare namespace ScanEntityInfoDto {
    enum entityType {
        MATERIAL = "material",
        TOOLING = "tooling",
        BATCH = "batch",
        EQUIPMENT = "equipment",
        SALE_DELIVERY = "sale_delivery",
        PURCHASE_RECEIPT = "purchase_receipt",
        MATERIAL_ISSUE = "material_issue",
        QUALITY_INSPECTION = "quality_inspection",
        PURCHASE_ORDER = "purchase_order",
        WAREHOUSE_LOCATION = "warehouse_location"
    }
}

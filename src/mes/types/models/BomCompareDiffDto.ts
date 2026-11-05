/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BomCompareDiffDto = {
    baseBaseQty?: number | null;
    baseLossRate?: number | null;
    baseMaterialType?: string | null;
    baseOperationSequence?: number | null;
    baseProcessOperationId?: string | null;
    baseQty?: number | null;
    baseQuantityRuleSignature?: string | null;
    baseSubstitutesSignature?: string | null;
    baseUnit?: string | null;
    change: BomCompareDiffDto.change;
    materialCode: string;
    materialId: string;
    materialName: string;
    targetBaseQty?: number | null;
    targetLossRate?: number | null;
    targetMaterialType?: string | null;
    targetOperationSequence?: number | null;
    targetProcessOperationId?: string | null;
    targetQty?: number | null;
    targetQuantityRuleSignature?: string | null;
    targetSubstitutesSignature?: string | null;
    targetUnit?: string | null;
};
export namespace BomCompareDiffDto {
    export enum change {
        ADDED = 'added',
        REMOVED = 'removed',
        MODIFIED = 'modified',
        UNCHANGED = 'unchanged',
    }
}

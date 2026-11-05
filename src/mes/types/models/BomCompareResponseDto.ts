/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomCompareDiffDto } from './BomCompareDiffDto';
import type { BomCompareSummaryDto } from './BomCompareSummaryDto';
import type { BomVersionSummaryDto } from './BomVersionSummaryDto';
export type BomCompareResponseDto = {
    base: BomVersionSummaryDto;
    diffs: Array<BomCompareDiffDto>;
    summary: BomCompareSummaryDto;
    target: BomVersionSummaryDto;
};

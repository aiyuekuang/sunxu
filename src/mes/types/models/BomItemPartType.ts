/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 新建 BOM 行的默认供料方式；为空时继承物料系列，再按采购类型兜底，仅影响新建 BOM 行
 */
export enum BomItemPartType {
    SELF_MADE = 'self_made',
    STANDARD_PART = 'standard_part',
    PURCHASED = 'purchased',
    OUTSOURCED = 'outsourced',
    CUSTOMER_SUPPLIED = 'customer_supplied',
}

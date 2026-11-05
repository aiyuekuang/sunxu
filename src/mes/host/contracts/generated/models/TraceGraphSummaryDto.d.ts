export type TraceGraphSummaryDto = {
    affectedCustomers: Array<string>;
    affectedSuppliers: Array<string>;
    batchCount: number;
    customerCount: number;
    deliveryCount: number;
    packageCount: number;
    qualityCount: number;
    reportLogCount: number;
    supplierCount: number;
    workOrderCount: number;
};

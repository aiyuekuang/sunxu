export type MrpSummaryDto = {
    /**
     * 提前期预警数
     */
    leadTimeWarnings: number;
    /**
     * 待客户供料数
     */
    needCustomerSupply: number;
    /**
     * 需生产数
     */
    needProduce: number;
    /**
     * 需采购数
     */
    needPurchase: number;
    /**
     * 库存充足数
     */
    sufficient: number;
    /**
     * 物料总数
     */
    totalMaterials: number;
};

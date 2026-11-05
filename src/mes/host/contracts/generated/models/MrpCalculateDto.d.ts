export type MrpCalculateDto = {
    /**
     * BOM展开范围；不传保持历史多层展开行为
     */
    bomExplosionMode?: MrpCalculateDto.bomExplosionMode;
    /**
     * 计算口径；不传保持历史净需求行为
     */
    calculationMode?: MrpCalculateDto.calculationMode;
    /**
     * 生产计划ID列表
     */
    planIds: Array<string>;
    /**
     * 安全库存天数
     */
    safetyStockDays?: number;
};
export declare namespace MrpCalculateDto {
    /**
     * BOM展开范围；不传保持历史多层展开行为
     */
    enum bomExplosionMode {
        SINGLE_LEVEL = "single_level",
        MULTI_LEVEL = "multi_level"
    }
    /**
     * 计算口径；不传保持历史净需求行为
     */
    enum calculationMode {
        GROSS = "gross",
        NET = "net"
    }
}

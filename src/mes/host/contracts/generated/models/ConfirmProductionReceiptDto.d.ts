import type { ReceiptPackageDto } from './ReceiptPackageDto.d.ts';
export type ConfirmProductionReceiptDto = {
    /**
     * 实收数量（产品基础单位）；不传默认等于计划数量；小于计划数量时必须填写差异原因
     */
    actualReceiptQty?: number;
    /**
     * 实际入库业务日期；不传时后端按当天处理，不允许未来日期
     */
    businessDate?: string;
    /**
     * 前端当前生产入库单明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 生产入库单明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 实收差异原因（production_receipt_diff_reason 字典值，存在差异时必填）
     */
    diffReason?: string;
    /**
     * 生产入库单ID
     */
    id: string;
    /**
     * 入库仓位ID（严格仓位仓必填，以预检结果为准）
     */
    locationId?: string;
    /**
     * 包装方式；有启用包装规格的成品必须选择自动装箱或扫码装箱
     */
    packageMode: ConfirmProductionReceiptDto.packageMode;
    /**
     * 确认时选择的包装规格ID
     */
    packageSpecId?: string;
    /**
     * 扫码装箱时提交箱码和本箱数量；所有箱内数量合计须等于实收数量
     */
    packages?: Array<ReceiptPackageDto>;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 单件追踪物料本次实际入库的产品序列号；数量须与实收数量一致
     */
    serialNumbers?: Array<string>;
    /**
     * 存放位置文本
     */
    storageLocation?: string;
    /**
     * 入库仓ID（单据未带仓库时必填，以预检结果为准）
     */
    warehouseId?: string;
};
export declare namespace ConfirmProductionReceiptDto {
    /**
     * 包装方式；有启用包装规格的成品必须选择自动装箱或扫码装箱
     */
    enum packageMode {
        NONE = "none",
        AUTO = "auto",
        SCAN = "scan"
    }
}

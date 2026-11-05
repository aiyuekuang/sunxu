export type SaleOrderItemDto = {
    /**
     * 订单行 BOM 成本快照；为空时后端按选定 BOM 自动生成
     */
    bomCostSnapshot?: Record<string, any>;
    /**
     * 订单行默认使用的 BOM 版本ID；转生产时可按本次计划覆盖
     */
    bomHeaderId?: string;
    /**
     * BOM 选择原因
     */
    bomSelectionReason?: string;
    /**
     * BOM 选择来源
     */
    bomSelectionSource?: string;
    /**
     * 手工单价币别
     */
    currency?: string;
    /**
     * 前端当前销售订单明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 非标参数快照，如尺寸、板厚、孔位、表面处理、客户要求等
     */
    customSnapshot?: Record<string, any>;
    /**
     * 销售订单明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 客户料号
     */
    customerMaterialCode?: string;
    /**
     * 客户物料名称
     */
    customerMaterialName?: string;
    /**
     * 客户规格/型号描述
     */
    customerMaterialSpec?: string;
    /**
     * 明细交货日期，格式 YYYY-MM-DD；不传或为空则回退订单头交货日期。下游转生产计划 dueDate 已按明细优先取值；出货侧按需展示，不做后端逾期阻断。清空请省略该字段而非传空串。
     */
    deliveryDate?: string;
    /**
     * 折扣率（%），100 表示无折扣；例如 9 折传 90
     */
    discountRate?: number;
    /**
     * 订单行级图纸附件URL
     */
    drawingUrls?: Array<string>;
    /**
     * 既有订单行ID（编辑回传用）。后端整组替换 items，但明细交货日期等按行写入会优先按此 id 对齐到原行，避免同品多行按下标错位；新增行不传。
     */
    id?: string;
    /**
     * 制造模式：standard/make_to_order/engineer_to_order/project
     */
    manufactureMode?: SaleOrderItemDto.manufactureMode;
    /**
     * 销售成品物料档案ID
     */
    materialId: string;
    /**
     * 单价是否含税
     */
    priceIncludesTax?: boolean;
    /**
     * 数量
     */
    quantity: number;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 本订单行确认使用的 BOM 版本ID
     */
    selectedBomHeaderId?: string;
    /**
     * 税率（%）
     */
    taxRate?: number;
    /**
     * 单价
     */
    unitPrice?: number;
};
export declare namespace SaleOrderItemDto {
    /**
     * 制造模式：standard/make_to_order/engineer_to_order/project
     */
    enum manufactureMode {
        STANDARD = "standard",
        MAKE_TO_ORDER = "make_to_order",
        ENGINEER_TO_ORDER = "engineer_to_order",
        PROJECT = "project"
    }
}

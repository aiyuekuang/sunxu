import type { BomItemDto } from './BomItemDto.d.ts';
import type { BomScope } from './BomScope.d.ts';
export type CreateBomDto = {
    /**
     * 型号差异 BOM 关联的系列基础 BOM ID
     */
    baseBomHeaderId?: string;
    /**
     * BOM 方案ID；创建同方案新版本时必传
     */
    bomMasterId?: string;
    /**
     * BOM 适用层级
     */
    bomScope?: BomScope;
    /**
     * 变更说明
     */
    changeRemark?: string;
    /**
     * 是否新建独立方案；P0 仅 MODEL_STANDARD 支持
     */
    createNewMaster?: boolean;
    /**
     * 备注
     */
    description?: string;
    /**
     * 物料系列ID
     */
    familyId?: string;
    /**
     * 导入会话ID
     */
    importSessionId?: string;
    /**
     * 系列基础 BOM 是否把当前型号物料作为投入料；仅用于本体加工/同料加工场景
     */
    includeOutputMaterialAsInput?: boolean;
    /**
     * BOM 行
     */
    items: Array<BomItemDto>;
    /**
     * 新建 BOM 方案名称；不传时默认使用父项物料或系列名称
     */
    masterName?: string;
    /**
     * 成品物料档案ID；系列基础 BOM 可为空
     */
    materialId?: string | null;
    /**
     * 当前型号本体投入供料方式；仅允许自有料或客户供料，客户供料按工单关联客户锁定货主库存
     */
    outputMaterialInputPartType?: CreateBomDto.outputMaterialInputPartType;
    /**
     * 当前型号本体投入单耗；按每 1 个父项产出计算
     */
    outputMaterialInputQuantity?: number;
    /**
     * 零件号/产品号
     */
    partNo?: string;
    /**
     * 来源摘要
     */
    sourceSummary?: string;
};
export declare namespace CreateBomDto {
    /**
     * 当前型号本体投入供料方式；仅允许自有料或客户供料，客户供料按工单关联客户锁定货主库存
     */
    enum outputMaterialInputPartType {
        SELF_MADE = "self_made",
        STANDARD_PART = "standard_part",
        PURCHASED = "purchased",
        OUTSOURCED = "outsourced",
        CUSTOMER_SUPPLIED = "customer_supplied"
    }
}

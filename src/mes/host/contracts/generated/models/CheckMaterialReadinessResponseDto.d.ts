import type { MaterialReadinessItemDto } from './MaterialReadinessItemDto.d.ts';
export type CheckMaterialReadinessResponseDto = {
    /**
     * 阻断动作的原因
     */
    blockingReasons?: Array<string>;
    /**
     * 齐套检查记录ID
     */
    checkId?: string | null;
    /**
     * 检查时间
     */
    checkedAt: string;
    /**
     * 生产投入物料齐套明细
     */
    items: Array<MaterialReadinessItemDto>;
    /**
     * 生产投入物料齐套信息
     */
    message: string;
    /**
     * 当前工序齐套实际使用的工序ID
     */
    operationId?: string | null;
    /**
     * 是否需要主管确认放行
     */
    overrideRequired: boolean;
    /**
     * 生产投入物料是否齐套；按工单 BOM 需求及指定仓库可领用库存判断，不包含工单产出物料库存
     */
    ready: boolean;
    /**
     * 本次检查范围
     */
    scope: CheckMaterialReadinessResponseDto.scope;
    /**
     * 不阻断动作的风险提示
     */
    warnings?: Array<string>;
};
export declare namespace CheckMaterialReadinessResponseDto {
    /**
     * 本次检查范围
     */
    enum scope {
        FULL_BOM = "full_bom",
        FIRST_OPERATION = "first_operation",
        CURRENT_OPERATION = "current_operation"
    }
}

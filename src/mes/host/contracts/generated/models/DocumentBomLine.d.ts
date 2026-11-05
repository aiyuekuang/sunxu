import type { BomItem } from './BomItem.d.ts';
import type { BomItemPartType } from './BomItemPartType.d.ts';
import type { BomLineAdjustmentMode } from './BomLineAdjustmentMode.d.ts';
import type { BomLineIssueRequirementMode } from './BomLineIssueRequirementMode.d.ts';
import type { BomQuantityMode } from './BomQuantityMode.d.ts';
import type { DocumentBomLineState } from './DocumentBomLineState.d.ts';
import type { ItemSource } from './ItemSource.d.ts';
import type { Material } from './Material.d.ts';
import type { MaterialConsumptionMode } from './MaterialConsumptionMode.d.ts';
import type { ProcessOperation } from './ProcessOperation.d.ts';
export type DocumentBomLine = {
    /**
     * 改配原因
     */
    adjustReason?: string | null;
    /**
     * 基础单位用量
     */
    baseQuantity?: number | null;
    /**
     * 基础单位
     */
    baseUnit?: string | null;
    /**
     * 与来源行的差异摘要
     */
    changeTrace: Record<string, any>;
    companyId: string;
    /**
     * 成本与供应来源快照
     */
    costs?: Array<Record<string, any>>;
    createdAt: string;
    documentBom?: Record<string, any>;
    /**
     * 单据 BOM ID
     */
    documentBomId: string;
    /**
     * 图纸附件 URL
     */
    drawingUrls: Array<string>;
    id: string;
    /**
     * 图片 URL
     */
    imageUrls: Array<string>;
    /**
     * 是否从该单据 BOM 行生成工单物料需求；不生成时仅作为结构、图纸或工艺参考，不参与领料
     */
    issueRequirementMode: BomLineIssueRequirementMode;
    /**
     * 行项目来源：物料档案或本单临时制造项
     */
    itemSource: ItemSource;
    lineAdjustmentMode: BomLineAdjustmentMode;
    /**
     * 由 lineAdjustmentMode 推导的行级可调整能力（canCustomize 决定能否改供料方式）；仅详情返回，不落库
     */
    lineCapabilities?: Record<string, any>;
    /**
     * 行号
     */
    lineNo: number;
    lineState: DocumentBomLineState;
    /**
     * 损耗率
     */
    lossRate: number;
    material?: Material | null;
    /**
     * 单据 BOM 行冻结的生产消耗方式；由公司、物料和标准 BOM 明细继承解析后保存
     */
    materialConsumptionMode: MaterialConsumptionMode;
    /**
     * 当前有效物料 ID；临时制造项为空
     */
    materialId?: string | null;
    /**
     * 用料角色
     */
    materialType: string;
    /**
     * 投料工序序号
     */
    operationSequence?: number | null;
    /**
     * 来源损耗率
     */
    originalLossRate?: number | null;
    originalMaterial?: Material | null;
    /**
     * 替代前物料 ID
     */
    originalMaterialId?: string | null;
    /**
     * 来源快照用量
     */
    originalQuantity?: number | null;
    parentLine?: Record<string, any> | null;
    /**
     * 父级单据 BOM 行 ID
     */
    parentLineId?: string | null;
    partType: BomItemPartType;
    processOperation?: ProcessOperation | null;
    /**
     * 工序 ID
     */
    processOperationId?: string | null;
    /**
     * 当前有效用量
     */
    quantity: number;
    quantityMode: BomQuantityMode;
    /**
     * BOM 行指定工艺路线
     */
    route?: Record<string, any> | null;
    /**
     * 生成子工单时优先使用的工艺路线 ID；为空时按物料适用规则自动解析
     */
    routeId?: string | null;
    /**
     * 导入原始字段、客户零件号等
     */
    sourceAttributes: Record<string, any>;
    sourceDocumentBomLine?: Record<string, any> | null;
    /**
     * 来源单据 BOM 行 ID
     */
    sourceDocumentBomLineId?: string | null;
    sourceStandardBomItem?: BomItem | null;
    /**
     * 来源标准 BOM 行 ID
     */
    sourceStandardBomItemId?: string | null;
    /**
     * 临时制造项编码/图号快照
     */
    temporaryItemCode?: string | null;
    /**
     * 临时制造项名称快照
     */
    temporaryItemName?: string | null;
    /**
     * 临时制造项规格快照
     */
    temporaryItemSpec?: string | null;
    /**
     * 显示单位
     */
    unit: string;
    updatedAt: string;
};

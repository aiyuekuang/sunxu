import type { BomItemPartType } from './BomItemPartType.d.ts';
import type { MaterialCategory } from './MaterialCategory.d.ts';
import type { MaterialFamilyBatchStrategy } from './MaterialFamilyBatchStrategy.d.ts';
import type { MaterialType } from './MaterialType.d.ts';
import type { ProcurementType } from './ProcurementType.d.ts';
import type { User } from './User.d.ts';
export type MaterialFamily = {
    /**
     * 物料属性定义；用于物料档案生成和模板资料扩展
     */
    attributeSchema: Record<string, any>;
    /**
     * 物料系统分类；用于系列选型和物料档案默认分类，不参与库存/BOM交易
     */
    baseType?: MaterialType | null;
    category?: MaterialCategory | null;
    /**
     * 业务分类ID
     */
    categoryId?: string | null;
    /**
     * 系列编码
     */
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 公式字段计算错误（运行时装配，非数据库列）
     */
    customComputedErrors?: Record<string, any>;
    /**
     * 公式字段计算结果（运行时装配，非数据库列）
     */
    customComputedValues?: Record<string, any>;
    /**
     * 自定义字段值（运行时装配，非数据库列；动态 key）
     */
    customValues?: Record<string, any>;
    /**
     * 批次策略：optional=可选，required=强制启用
     */
    defaultBatchStrategy?: MaterialFamilyBatchStrategy;
    /**
     * 新建 BOM 行的默认供料方式；物料档案未单独设置时继承，仅影响新建 BOM 行
     */
    defaultBomPartType?: BomItemPartType | null;
    /**
     * 默认采购类型；新建物料档案未填写时继承
     */
    defaultProcurementType?: ProcurementType | null;
    /**
     * 默认保质期（天）
     */
    defaultShelfLifeDays?: number | null;
    /**
     * 默认单位
     */
    defaultUnit?: string | null;
    /**
     * 描述
     */
    description?: string | null;
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    /**
     * 关联物料档案数量（列表统计字段）
     */
    materialCount?: number;
    /**
     * 系列名称
     */
    name: string;
    /**
     * 备注
     */
    remarks?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

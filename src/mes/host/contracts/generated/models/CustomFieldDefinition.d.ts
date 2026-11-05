import type { CustomFieldDataType } from './CustomFieldDataType.d.ts';
import type { CustomFieldKind } from './CustomFieldKind.d.ts';
import type { CustomFieldRequiredPolicy } from './CustomFieldRequiredPolicy.d.ts';
import type { User } from './User.d.ts';
export type CustomFieldDefinition = {
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 字段数据类型
     */
    dataType: CustomFieldDataType;
    /**
     * 默认值配置
     */
    defaultValueJson?: Record<string, any> | null;
    /**
     * 依赖字段编码
     */
    dependencyKeys: Array<string>;
    /**
     * 展示配置
     */
    displayJson: Record<string, any>;
    /**
     * 字段编码
     */
    fieldKey: string;
    /**
     * 字段分类
     */
    fieldKind: CustomFieldKind;
    /**
     * 公式配置
     */
    formulaJson?: Record<string, any> | null;
    /**
     * 帮助说明
     */
    helpText?: string | null;
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    /**
     * 字段名称
     */
    label: string;
    /**
     * 金额字段配置（币别、税口径、金额含义等）
     */
    moneyJson?: Record<string, any> | null;
    /**
     * 适用单据/档案编码
     */
    objectType: string;
    /**
     * 选项配置
     */
    optionsJson?: Record<string, any> | null;
    /**
     * 权限配置
     */
    permissionJson: Record<string, any>;
    /**
     * 查询配置
     */
    queryJson: Record<string, any>;
    /**
     * 必填策略
     */
    requiredPolicy: CustomFieldRequiredPolicy;
    /**
     * 排序
     */
    sortOrder: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    /**
     * 校验配置
     */
    validationJson?: Record<string, any> | null;
    /**
     * 定义版本(乐观锁)
     */
    version: number;
};

import type { User } from './User.d.ts';
export type DictItem = {
    /**
     * 条目背景色（HEX），用于 Badge/Tag 背景，如 '#E8F3FF'
     */
    bg?: string | null;
    /**
     * 条目颜色（HEX），用于 Badge/Tag 展示，如 '#1677FF'
     */
    color?: string | null;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    isActive: boolean;
    /**
     * 条目显示标签，如 '千克(kg)'
     */
    itemLabel: string;
    /**
     * 条目值（存入数据库的实际值），如 'kg'
     */
    itemValue: string;
    /**
     * 父级条目值，用于级联字典（如 equipment_model 的 parentValue 存储所属制造商的 itemValue）
     */
    parentValue?: string | null;
    /**
     * 排序权重，越小越靠前
     */
    sort: number;
    /**
     * 所属字典类型编码
     */
    typeCode: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};

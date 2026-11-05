export type CreateDictItemDto = {
    /**
     * 条目背景色（HEX），如 '#E8F3FF'
     */
    bg?: string;
    /**
     * 条目颜色（HEX），如 '#1677FF'
     */
    color?: string;
    itemLabel: string;
    itemValue: string;
    /**
     * 父级条目值，用于级联字典（如型号关联制造商）
     */
    parentValue?: string;
    sort?: number;
    typeCode: string;
};

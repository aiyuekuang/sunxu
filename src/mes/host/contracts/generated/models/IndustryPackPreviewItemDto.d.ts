export type IndustryPackPreviewItemDto = {
    /**
     * 标签背景色（HEX）
     */
    bg?: string;
    /**
     * 标签颜色（HEX）
     */
    color?: string;
    /**
     * 显示名称（标签）
     */
    itemLabel: string;
    /**
     * 条目值（存储值）
     */
    itemValue: string;
    /**
     * 父级条目值（级联字典）
     */
    parentValue?: string;
    /**
     * 排序值
     */
    sort: number;
};

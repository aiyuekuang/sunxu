export type CustomFieldValuesResponseDto = {
    /**
     * 计算属性错误
     */
    customComputedErrors: Record<string, any>;
    /**
     * 计算属性值
     */
    customComputedValues: Record<string, any>;
    /**
     * 普通自定义字段值
     */
    customValues: Record<string, any>;
    /**
     * 单据/档案ID
     */
    objectId: string;
    /**
     * 适用单据/档案编码
     */
    objectType: string;
    /**
     * Schema版本
     */
    schemaVersion: number;
};

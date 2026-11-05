import type { CustomFieldDataType } from './CustomFieldDataType.d.ts';
export type CustomFieldSystemFieldDto = {
    /**
     * 字段类型
     */
    dataType: CustomFieldDataType;
    /**
     * 字段编码
     */
    key: string;
    /**
     * 字段名称
     */
    label: string;
};

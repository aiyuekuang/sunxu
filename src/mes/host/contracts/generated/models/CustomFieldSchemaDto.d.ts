import type { CustomFieldDefinition } from './CustomFieldDefinition.d.ts';
import type { CustomFieldSystemFieldDto } from './CustomFieldSystemFieldDto.d.ts';
export type CustomFieldSchemaDto = {
    /**
     * 自定义字段定义
     */
    fields: Array<CustomFieldDefinition>;
    /**
     * 适用单据/档案编码
     */
    objectType: string;
    /**
     * Schema版本
     */
    schemaVersion: number;
    /**
     * 系统字段
     */
    systemFields: Array<CustomFieldSystemFieldDto>;
};

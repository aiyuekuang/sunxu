export type { CustomFieldDefinition } from '../generated/models/CustomFieldDefinition.d.ts';
export type { CustomFieldSchemaDto as CustomFieldSchema } from '../generated/models/CustomFieldSchemaDto.d.ts';
export type { CustomFieldValuesResponseDto as CustomFieldValues } from '../generated/models/CustomFieldValuesResponseDto.d.ts';
export declare const customFieldService: {
    formSchema: (objectType: string) => import("../../../types/generated/index").Promise<import("./custom-field.service.d.ts").CustomFieldSchema>;
    valueDetail: (objectType: string, objectId: string) => import("../../../types/generated/index").Promise<import("./custom-field.service.d.ts").CustomFieldValues>;
    batchValues: (objectType: string, objectIds: string[]) => Promise<import("./custom-field.service.d.ts").CustomFieldValues[]>;
    /**
     * 保存已存在单据/档案的自定义字段值（POST /custom-field/save-values，按 key 合并、update 模式）。
     * 需要 objectId，故仅用于对象已落库后的独立录入/编辑入口（如详情页）。
     * 物料建/改档为避免新建必填时序问题，走主表 create/update 一步原子提交，不用此方法。
     */
    saveValues: (params: {
        objectType: string;
        objectId: string;
        customFieldSchemaVersion: number;
        customValues: Record<string, unknown>;
    }) => import("../../../types/generated/index").Promise<import("./custom-field.service.d.ts").CustomFieldValues>;
};

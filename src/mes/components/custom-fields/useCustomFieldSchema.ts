import { useEffect, useState } from 'react';
import {
  type CustomFieldDefinition,
  customFieldService,
} from '../../host/services';

export interface CustomFieldSchemaState {
  fields: CustomFieldDefinition[];
  schemaVersion: number | null;
  loading: boolean;
  loadError: string | null;
}

/**
 * 加载一个对象的自定义字段 schema。
 *
 * 表单与详情共用该 hook，确保“PC 已配置的字段”在 App 端只从后端权威 schema 获取。
 */
export function useCustomFieldSchema(objectType: string): CustomFieldSchemaState {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [schemaVersion, setSchemaVersion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFields([]);
    setSchemaVersion(null);
    setLoading(true);
    setLoadError(null);

    void customFieldService
      .formSchema(objectType)
      .then((schema) => {
        if (cancelled) return;
        setFields(schema.fields ?? []);
        setSchemaVersion(schema.schemaVersion);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : '自定义字段加载失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [objectType]);

  return { fields, schemaVersion, loading, loadError };
}

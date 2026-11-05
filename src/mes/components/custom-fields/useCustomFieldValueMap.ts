import { useEffect, useMemo, useState } from 'react';
import { customFieldService } from '../../host/services';
import { useCustomFieldSchema } from './useCustomFieldSchema.ts';

/** Load the configured fields and stored values for a batch of document lines. */
export function useCustomFieldValueMap(objectType: string, objectIds: string[]) {
  const schema = useCustomFieldSchema(objectType);
  const idsKey = useMemo(
    () => [...new Set(objectIds.filter(Boolean))].sort().join('\u0000'),
    [objectIds],
  );
  const [valuesById, setValuesById] = useState<Record<string, Record<string, unknown>>>({});
  const [valuesLoading, setValuesLoading] = useState(false);
  const [valuesLoadError, setValuesLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ids = idsKey ? idsKey.split('\u0000') : [];
    setValuesById({});
    setValuesLoadError(null);
    if (ids.length === 0) {
      setValuesLoading(false);
      return () => {
        cancelled = true;
      };
    }
    setValuesLoading(true);
    void customFieldService
      .batchValues(objectType, ids)
      .then((entries) => {
        if (cancelled) return;
        setValuesById(
          Object.fromEntries(entries.map((entry) => [entry.objectId, entry.customValues ?? {}])),
        );
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setValuesLoadError(error instanceof Error ? error.message : '自定义字段值加载失败');
        }
      })
      .finally(() => {
        if (!cancelled) setValuesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [idsKey, objectType]);

  return {
    fields: schema.fields,
    valuesById,
    loading: schema.loading || valuesLoading,
    loadError: schema.loadError ?? valuesLoadError,
  };
}

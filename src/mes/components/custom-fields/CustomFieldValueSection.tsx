import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  customFieldService,
  type CustomFieldSchema,
  type CustomFieldValues,
} from '../../host/services';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { DetailCard, InfoRow } from '../../../core/components/DetailCard.tsx';
import { FontSize, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import {
  CUSTOM_FIELD_COMPUTE_ERROR_TEXT,
  formatCustomFieldDisplay,
  isShowInApp,
} from './formatCustomFieldValue.ts';

interface CustomFieldValueSectionProps {
  objectType: string;
  objectId: string;
}

export function CustomFieldValueSection({ objectType, objectId }: CustomFieldValueSectionProps) {
  const { colors } = useTheme();
  const [schema, setSchema] = useState<CustomFieldSchema | null>(null);
  const [values, setValues] = useState<CustomFieldValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [nextSchema, nextValues] = await Promise.all([
        customFieldService.formSchema(objectType),
        customFieldService.valueDetail(objectType, objectId),
      ]);
      if (!cancelled) {
        setSchema(nextSchema);
        setValues(nextValues);
        setError(null);
      }
    }

    void load().catch((loadError: unknown) => {
      if (!cancelled) {
        setError(loadError instanceof Error ? loadError.message : '自定义字段加载失败');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [objectId, objectType]);

  const fields = useMemo(() => (schema?.fields ?? []).filter(isShowInApp), [schema?.fields]);

  if (error) {
    return (
      <DetailCard title="自定义字段">
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      </DetailCard>
    );
  }

  if (fields.length === 0) return null;

  return (
    <DetailCard title="自定义字段">
      {fields.map((field, index) => {
        const value =
          field.fieldKind === 'formula'
            ? values?.customComputedValues[field.fieldKey]
            : values?.customValues[field.fieldKey];
        const hasError = values?.customComputedErrors[field.fieldKey];
        return (
          <InfoRow
            key={field.fieldKey}
            label={field.label}
            value={
              hasError
                ? CUSTOM_FIELD_COMPUTE_ERROR_TEXT
                : formatCustomFieldDisplay(value, field) || '-'
            }
            last={index === fields.length - 1}
          />
        );
      })}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    paddingVertical: Spacing.xs,
  },
});

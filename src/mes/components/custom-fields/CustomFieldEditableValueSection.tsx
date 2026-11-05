import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { customFieldService } from '../../host/services';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { DetailCard, InfoRow } from '../../../core/components/DetailCard.tsx';
import {
  buildCustomValuesPayload,
  CustomFieldFormSection,
  getSubmittableFormFields,
  validateCustomFields,
} from './CustomFieldFormSection.tsx';
import {
  CUSTOM_FIELD_COMPUTE_ERROR_TEXT,
  formatCustomFieldDisplay,
  isShowInApp,
} from './formatCustomFieldValue.ts';
import { useCustomFieldSchema } from './useCustomFieldSchema.ts';
import { useTheme } from '../../../core/theme/useTheme';

interface CustomFieldEditableValueSectionProps {
  objectType: string;
  objectId: string;
  editable: boolean;
}

export function CustomFieldEditableValueSection({
  objectType,
  objectId,
  editable,
}: CustomFieldEditableValueSectionProps) {
  const { colors } = useTheme();
  const schema = useCustomFieldSchema(objectType);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({});
  const [computedValues, setComputedValues] = useState<Record<string, unknown>>({});
  const [computedErrors, setComputedErrors] = useState<Record<string, unknown>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedValueObjectKey, setLoadedValueObjectKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const visibleFields = useMemo(() => schema.fields.filter(isShowInApp), [schema.fields]);
  const valueObjectKey = `${objectType}:${objectId}`;
  const valuesLoading = loadedValueObjectKey !== valueObjectKey;

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    void customFieldService
      .valueDetail(objectType, objectId)
      .then((detail) => {
        if (cancelled) return;
        setValues(detail.customValues ?? {});
        setSavedValues(detail.customValues ?? {});
        setComputedValues(detail.customComputedValues ?? {});
        setComputedErrors(detail.customComputedErrors ?? {});
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : '自定义字段加载失败');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadedValueObjectKey(valueObjectKey);
      });
    return () => {
      cancelled = true;
    };
  }, [objectId, objectType, valueObjectKey]);

  const save = async () => {
    if (schema.loading || schema.loadError || valuesLoading || loadError) return;
    const errors = validateCustomFields(schema.fields, values, 'update');
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const fields = getSubmittableFormFields(schema.fields);
    if (schema.schemaVersion === null || fields.length === 0) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const updated = await customFieldService.saveValues({
        objectType,
        objectId,
        customFieldSchemaVersion: schema.schemaVersion,
        customValues: buildCustomValuesPayload(fields, values),
      });
      setValues(updated.customValues ?? {});
      setSavedValues(updated.customValues ?? {});
      setComputedValues(updated.customComputedValues ?? {});
      setComputedErrors(updated.customComputedErrors ?? {});
      setSaveError(null);
      setEditing(false);
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : '自定义字段保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (visibleFields.length === 0 && !schema.loading && !loadError && !schema.loadError) return null;

  return (
    <DetailCard title="自定义字段">
      {editing && !valuesLoading && !schema.loading && !loadError && !schema.loadError ? (
        <>
          <CustomFieldFormSection
            fields={schema.fields}
            values={values}
            errors={fieldErrors}
            mode="update"
            loading={schema.loading || valuesLoading}
            loadError={loadError ?? schema.loadError}
            showSection={false}
            onChange={(key, value) => {
              setValues((current) => ({ ...current, [key]: value }));
              setFieldErrors((current) => {
                if (!current[key]) return current;
                const next = { ...current };
                delete next[key];
                return next;
              });
            }}
          />
          {saveError ? (
            <Text style={[styles.error, { color: colors.error }]}>{saveError}</Text>
          ) : null}
        </>
      ) : valuesLoading || schema.loading ? (
        <Text style={{ color: colors.textSecondary }}>正在加载自定义字段…</Text>
      ) : loadError || schema.loadError ? (
        <Text style={[styles.error, { color: colors.error }]}>{loadError ?? schema.loadError}</Text>
      ) : (
        visibleFields.map((field, index) => (
          <InfoRow
            key={field.fieldKey}
            label={field.label}
            value={
              computedErrors[field.fieldKey]
                ? CUSTOM_FIELD_COMPUTE_ERROR_TEXT
                : formatCustomFieldDisplay(
                    field.fieldKind === 'formula'
                      ? computedValues[field.fieldKey]
                      : values[field.fieldKey],
                    field,
                  ) || '-'
            }
            last={index === visibleFields.length - 1 && !editable}
          />
        ))
      )}
      {editable && !valuesLoading && !schema.loading && !loadError && !schema.loadError ? (
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          {editing ? (
            <>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  setEditing(false);
                  setValues(savedValues);
                  setFieldErrors({});
                  setSaveError(null);
                }}
                disabled={saving}
              >
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => void save()}
                disabled={saving}
              >
                <Text style={[styles.actionText, { color: colors.primary }]}>
                  {saving ? '保存中…' : '保存'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setEditing(true)}
              disabled={schema.loading || valuesLoading || Boolean(loadError || schema.loadError)}
            >
              <Text style={[styles.actionText, { color: colors.primary }]}>编辑</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    paddingTop: 12,
  },
  actionText: { fontSize: 14, fontWeight: '600' },
  error: { fontSize: 14 },
});

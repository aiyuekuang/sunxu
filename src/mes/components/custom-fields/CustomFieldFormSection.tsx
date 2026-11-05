import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CustomFieldDataType } from '../../types/models/CustomFieldDataType';
import type { CustomFieldDefinition } from '../../host/services';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { ChipSelectField } from '../../../core/components/ChipSelectField.tsx';
import { AttachmentFilesField } from '../common/AttachmentFilesField.tsx';
import { DatePickerField } from '../../../core/components/DatePickerField.tsx';
import { FormField, FormSwitch } from '../../../core/components/FormField.tsx';
import { FormSection } from '../../../core/components/FormPage.tsx';
import { PickerField } from '../../../core/components/PickerField.tsx';
import { FontSize, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import {
  type CustomFieldFormMode,
  getCustomFieldOptions,
  isInputField,
  isShowInForm,
  readCustomFieldValidation,
  shouldRequireCustomField,
} from './formatCustomFieldValue.ts';

// App 端支持与单据附件控件一致的文件/图片上传，并按字段类型限制选择范围。
const SUPPORTED_INPUT_TYPES: ReadonlySet<CustomFieldDataType> = new Set([
  CustomFieldDataType.TEXT,
  CustomFieldDataType.LONG_TEXT,
  CustomFieldDataType.USER_REF,
  CustomFieldDataType.DEPARTMENT_REF,
  CustomFieldDataType.NUMBER,
  CustomFieldDataType.DECIMAL,
  CustomFieldDataType.MONEY,
  CustomFieldDataType.BOOLEAN,
  CustomFieldDataType.DATE,
  CustomFieldDataType.DATETIME,
  CustomFieldDataType.SELECT,
  CustomFieldDataType.MULTI_SELECT,
  CustomFieldDataType.FILE,
  CustomFieldDataType.IMAGE,
]);

/** 可在 App 表单录入的字段：input 类 + showInForm + 受支持的数据类型。 */
export function getSubmittableFormFields(
  fields: CustomFieldDefinition[] | undefined | null,
): CustomFieldDefinition[] {
  return (fields ?? []).filter(
    (field) =>
      isInputField(field) && isShowInForm(field) && SUPPORTED_INPUT_TYPES.has(field.dataType),
  );
}

function isEmptyValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}

/**
 * 校验录入的自定义字段值（必填 + validationJson min/max/maxLength），返回 key=fieldKey 的错误表。
 * 口径与后端 custom-field-value.service 的 shouldRequire/normalize 对齐，避免提交后被后端拒。
 */
export function validateCustomFields(
  fields: CustomFieldDefinition[] | undefined | null,
  values: Record<string, unknown>,
  mode: CustomFieldFormMode,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of getSubmittableFormFields(fields)) {
    // 布尔永远有值（true/false），false 是合法值不算空
    if (field.dataType === CustomFieldDataType.BOOLEAN) continue;

    const raw = values[field.fieldKey];
    if (isEmptyValue(raw)) {
      if (shouldRequireCustomField(field, mode)) {
        errors[field.fieldKey] = `${field.label}不能为空`;
      }
      continue;
    }

    const validation = readCustomFieldValidation(field);
    if (
      field.dataType === CustomFieldDataType.NUMBER ||
      field.dataType === CustomFieldDataType.DECIMAL ||
      field.dataType === CustomFieldDataType.MONEY
    ) {
      const num = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(num)) {
        errors[field.fieldKey] = `${field.label}必须是数字`;
      } else if (validation.min !== null && num < validation.min) {
        errors[field.fieldKey] = `${field.label}不能小于 ${validation.min}`;
      } else if (validation.max !== null && num > validation.max) {
        errors[field.fieldKey] = `${field.label}不能大于 ${validation.max}`;
      }
      continue;
    }

    if (
      validation.maxLength !== null &&
      typeof raw === 'string' &&
      raw.trim().length > validation.maxLength
    ) {
      errors[field.fieldKey] = `${field.label}最多${validation.maxLength}个字符`;
    }
  }
  return errors;
}

/**
 * 组装随主表提交的 customValues：仅可录入字段，按类型归一化。
 * 空值统一写 null（后端非必填按空处理；必填已在 validateCustomFields 前置拦截）。
 */
export function buildCustomValuesPayload(
  fields: CustomFieldDefinition[] | undefined | null,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of getSubmittableFormFields(fields)) {
    const raw = values[field.fieldKey];
    if (field.dataType === CustomFieldDataType.BOOLEAN) {
      payload[field.fieldKey] = raw === true;
      continue;
    }
    if (isEmptyValue(raw)) {
      payload[field.fieldKey] = null;
      continue;
    }
    if (
      field.dataType === CustomFieldDataType.NUMBER ||
      field.dataType === CustomFieldDataType.DECIMAL ||
      field.dataType === CustomFieldDataType.MONEY
    ) {
      const num = typeof raw === 'number' ? raw : Number(raw);
      payload[field.fieldKey] = Number.isFinite(num) ? num : null;
      continue;
    }
    if (field.dataType === CustomFieldDataType.MULTI_SELECT) {
      payload[field.fieldKey] = Array.isArray(raw) ? raw.map((item) => String(item)) : [];
      continue;
    }
    if (typeof raw === 'string') {
      payload[field.fieldKey] = field.dataType === CustomFieldDataType.LONG_TEXT ? raw : raw.trim();
      continue;
    }
    payload[field.fieldKey] = raw;
  }
  return payload;
}

/**
 * 仅在当前对象存在可录入字段且已取得 schema 版本时组装提交载荷。
 *
 * 空对象表示本次不触碰自定义字段，避免后端要求不存在的 schemaVersion。
 */
export function buildCustomFieldFormPayload(
  fields: CustomFieldDefinition[] | undefined | null,
  schemaVersion: number | null,
  values: Record<string, unknown>,
):
  | { customFieldSchemaVersion: number; customValues: Record<string, unknown> }
  | Record<string, never> {
  if (schemaVersion === null || getSubmittableFormFields(fields).length === 0) {
    return {};
  }
  return {
    customFieldSchemaVersion: schemaVersion,
    customValues: buildCustomValuesPayload(fields, values),
  };
}

export interface CustomFieldFormSectionProps {
  /** formSchema 返回的全部字段定义（组件内部再过滤可录入字段） */
  fields: CustomFieldDefinition[];
  /** 当前录入值（key=fieldKey），父级持有 */
  values: Record<string, unknown>;
  /** 校验错误（key=fieldKey），父级持有 */
  errors: Record<string, string>;
  /** 新建=create（create/update 必填都生效），编辑=update（仅 update 必填生效） */
  mode: CustomFieldFormMode;
  onChange: (fieldKey: string, value: unknown) => void;
  /** schema 加载中/失败的提示（可选） */
  loading?: boolean;
  loadError?: string | null;
  title?: string;
  /** 是否使用独立表单分区包装；明细行卡片内嵌时传 false。 */
  showSection?: boolean;
}

/**
 * 物料/单据自定义字段录入区（受控）。只渲染 input + showInForm + 受支持类型的字段，
 * 按 dataType 用对应 RN 控件；值与校验由父级持有并注入。渲染/校验口径与 PC 端 CustomFieldValuePanel 一致。
 */
export function CustomFieldFormSection({
  fields,
  values,
  errors,
  mode,
  onChange,
  loading = false,
  loadError = null,
  title = '自定义字段',
  showSection = true,
}: CustomFieldFormSectionProps) {
  const { colors } = useTheme();
  const formFields = useMemo(() => getSubmittableFormFields(fields), [fields]);

  // 已加载完成且无可录入字段：不渲染空分区
  if (!loading && !loadError && formFields.length === 0) return null;

  const renderField = (field: CustomFieldDefinition) => {
    const key = field.fieldKey;
    const raw = values[key];
    const required = shouldRequireCustomField(field, mode);
    const error = errors[key];

    switch (field.dataType) {
      case CustomFieldDataType.BOOLEAN:
        return (
          <View key={key} style={styles.fieldGap}>
            <FormSwitch
              label={field.label}
              value={raw === true}
              onValueChange={(v) => onChange(key, v)}
            />
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
          </View>
        );
      case CustomFieldDataType.DATE:
        return (
          <DatePickerField
            key={key}
            label={field.label}
            required={required}
            error={error}
            mode="date"
            value={typeof raw === 'string' ? raw : ''}
            onChange={(v) => onChange(key, v)}
            clearable={!required}
          />
        );
      case CustomFieldDataType.DATETIME:
        return (
          <DatePickerField
            key={key}
            label={field.label}
            required={required}
            error={error}
            mode="datetime"
            value={typeof raw === 'string' ? raw : ''}
            onChange={(v) => onChange(key, v)}
            clearable={!required}
          />
        );
      case CustomFieldDataType.SELECT:
        return (
          <PickerField
            key={key}
            label={field.label}
            required={required}
            error={error}
            value={typeof raw === 'string' ? raw : ''}
            options={getCustomFieldOptions(field)}
            onChange={(v) => onChange(key, v)}
            placeholder="请选择"
            clearable={!required}
          />
        );
      case CustomFieldDataType.MULTI_SELECT:
        return (
          <View key={key} style={styles.fieldGap}>
            <ChipSelectField
              label={field.label}
              required={required}
              multiple
              options={getCustomFieldOptions(field)}
              value={Array.isArray(raw) ? raw.map((item) => String(item)) : []}
              onChange={(v) => onChange(key, v)}
            />
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
          </View>
        );
      case CustomFieldDataType.FILE:
      case CustomFieldDataType.IMAGE:
        return (
          <View key={key} style={styles.fieldGap}>
            <AttachmentFilesField
              label={field.label}
              files={
                Array.isArray(raw)
                  ? raw.filter((item): item is string => typeof item === 'string')
                  : []
              }
              editable
              required={required}
              imagesOnly={field.dataType === CustomFieldDataType.IMAGE}
              onChange={(next) => onChange(key, next)}
            />
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
          </View>
        );
      case CustomFieldDataType.NUMBER:
      case CustomFieldDataType.DECIMAL:
      case CustomFieldDataType.MONEY:
        return (
          <FormField
            key={key}
            label={field.label}
            required={required}
            error={error}
            value={raw === undefined || raw === null ? '' : String(raw)}
            keyboardType="decimal-pad"
            onChangeText={(t) => onChange(key, t)}
            placeholder={field.dataType === CustomFieldDataType.MONEY ? '请输入金额' : '请输入数字'}
          />
        );
      case CustomFieldDataType.LONG_TEXT:
        return (
          <FormField
            key={key}
            label={field.label}
            required={required}
            error={error}
            value={typeof raw === 'string' ? raw : ''}
            onChangeText={(t) => onChange(key, t)}
            placeholder="请输入"
            multiline
            numberOfLines={3}
          />
        );
      default:
        // text / user_ref / department_ref
        return (
          <FormField
            key={key}
            label={field.label}
            required={required}
            error={error}
            value={typeof raw === 'string' ? raw : ''}
            onChangeText={(t) => onChange(key, t)}
            placeholder="请输入"
          />
        );
    }
  };

  const content = loading ? (
    <Text style={[styles.hint, { color: colors.textMuted }]}>自定义字段加载中…</Text>
  ) : loadError ? (
    <Text style={[styles.error, { color: colors.error }]}>{loadError}</Text>
  ) : (
    formFields.map(renderField)
  );

  return showSection ? <FormSection title={title}>{content}</FormSection> : content;
}

const styles = StyleSheet.create({
  fieldGap: { gap: Spacing.xs },
  hint: { fontSize: FontSize.sm, lineHeight: 20 },
  error: { fontSize: FontSize.xs },
});

import dayjs from 'dayjs';
import { CustomFieldDataType } from '../../types/models/CustomFieldDataType';
import { CustomFieldKind } from '../../types/models/CustomFieldKind';
import { CustomFieldRequiredPolicy } from '../../types/models/CustomFieldRequiredPolicy';
import type { CustomFieldDefinition } from '../../host/services';

interface CustomFieldOption {
  value?: unknown;
  key?: unknown;
  label?: unknown;
}

/** 公式字段计算失败时的统一文案（列表副信息 / 详情共用同一口径）。 */
export const CUSTOM_FIELD_COMPUTE_ERROR_TEXT = '计算异常';

/** 承载自定义字段值的对象（物料列表项、单据等）；生成类型未声明，运行时后端已附带。 */
export interface CustomFieldValueCarrier {
  customValues?: Record<string, unknown> | null;
  customComputedValues?: Record<string, unknown> | null;
  /** 计算属性求值失败信息（key=字段 key，value=错误原因）。 */
  customComputedErrors?: Record<string, unknown> | null;
}

/** 表单可编辑字段的选项（单选/多选）。 */
export interface CustomFieldFormOption {
  label: string;
  value: string;
}

/** 表单必填/校验的取值模式（与后端 shouldRequire/normalize 口径一致）。 */
export type CustomFieldFormMode = 'create' | 'update';

/** 自定义字段校验配置（min/max/maxLength），无配置返回 null。 */
export interface CustomFieldValidationConfig {
  min: number | null;
  max: number | null;
  maxLength: number | null;
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readDisplayJson(field: CustomFieldDefinition): Record<string, unknown> {
  return readRecord(field.displayJson);
}

/** 从详情/列表明细行的运行时返回值安全读取已保存的自定义字段。 */
export function readCustomFieldValues(value: unknown): Record<string, unknown> {
  return readRecord(readRecord(value).customValues);
}

/** 从运行时对象读取显示自定义字段所需的值与公式计算结果。 */
export function readCustomFieldValueCarrier(value: unknown): CustomFieldValueCarrier {
  const record = readRecord(value);
  return {
    customValues: readRecord(record.customValues),
    customComputedValues: readRecord(record.customComputedValues),
    customComputedErrors: readRecord(record.customComputedErrors),
  };
}

function readOptions(field: CustomFieldDefinition): CustomFieldOption[] {
  const raw = readRecord(field.optionsJson).options;
  return Array.isArray(raw) ? (raw as CustomFieldOption[]) : [];
}

function toOptionLabel(candidate: unknown, options: CustomFieldOption[]): string {
  const option = options.find((opt) => (opt.value ?? opt.key) === candidate);
  return option?.label != null ? String(option.label) : String(candidate);
}

/** App 端是否展示（详情/列表副信息）。 */
export function isShowInApp(field: CustomFieldDefinition): boolean {
  return readDisplayJson(field).showInApp === true;
}

/** 选择器（选料）选项副信息是否展示。 */
export function isShowInSelector(field: CustomFieldDefinition): boolean {
  return readDisplayJson(field).showInSelector === true;
}

/** 是否在录入表单展示（App 建/改档录入区消费）。 */
export function isShowInForm(field: CustomFieldDefinition): boolean {
  return readDisplayJson(field).showInForm === true;
}

/** 是否为可录入字段（排除公式/系统字段）。 */
export function isInputField(field: CustomFieldDefinition): boolean {
  return field.fieldKind === CustomFieldKind.INPUT;
}

/**
 * 是否必填：与后端 shouldRequire 同一口径——
 * requiredPolicy=create 仅新建必填；requiredPolicy=update 新建/编辑都必填。
 */
export function shouldRequireCustomField(
  field: CustomFieldDefinition,
  mode: CustomFieldFormMode,
): boolean {
  return (
    (field.requiredPolicy === CustomFieldRequiredPolicy.CREATE && mode === 'create') ||
    field.requiredPolicy === CustomFieldRequiredPolicy.UPDATE
  );
}

/** 读取单选/多选可选项（兼容字符串项与 {value|key,label} 对象项）。 */
export function getCustomFieldOptions(field: CustomFieldDefinition): CustomFieldFormOption[] {
  const raw = readRecord(field.optionsJson).options;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((option): CustomFieldFormOption | null => {
      if (typeof option === 'string') return option ? { label: option, value: option } : null;
      if (!option || typeof option !== 'object') return null;
      const record = option as Record<string, unknown>;
      const rawValue = record.value ?? record.key;
      if (rawValue === null || rawValue === undefined || rawValue === '') return null;
      const value = String(rawValue);
      const label =
        record.label !== null && record.label !== undefined ? String(record.label) : value;
      return { label, value };
    })
    .filter((option): option is CustomFieldFormOption => option !== null);
}

/** 读取 min/max/maxLength 校验配置（缺省为 null）。 */
export function readCustomFieldValidation(
  field: CustomFieldDefinition,
): CustomFieldValidationConfig {
  const json = readRecord(field.validationJson);
  const readNumber = (key: string): number | null =>
    typeof json[key] === 'number' ? (json[key] as number) : null;
  return {
    min: readNumber('min'),
    max: readNumber('max'),
    maxLength: readNumber('maxLength'),
  };
}

/** 展示排序：优先 displayJson.sortOrder，回退字段自身 sortOrder。 */
export function customFieldDisplayOrder(field: CustomFieldDefinition): number {
  const raw = readDisplayJson(field).sortOrder;
  return typeof raw === 'number' ? raw : field.sortOrder;
}

/** 取自定义字段值：优先计算值（公式），回退普通值。 */
export function resolveCustomFieldValue(
  carrier: CustomFieldValueCarrier,
  field: CustomFieldDefinition,
): unknown {
  return carrier.customComputedValues?.[field.fieldKey] ?? carrier.customValues?.[field.fieldKey];
}

/**
 * 统一格式化自定义字段展示值：
 * 布尔→是/否、select→选项标签、multi_select→标签顿号拼接、
 * date→YYYY-MM-DD、datetime→YYYY-MM-DD HH:mm、其余→String，空值→''。
 */
export function formatCustomFieldDisplay(value: unknown, field: CustomFieldDefinition): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? '是' : '否';

  switch (field.dataType) {
    case CustomFieldDataType.SELECT:
      return toOptionLabel(value, readOptions(field));
    case CustomFieldDataType.MULTI_SELECT: {
      if (!Array.isArray(value)) return String(value);
      const options = readOptions(field);
      return value.map((item) => toOptionLabel(item, options)).join('、');
    }
    case CustomFieldDataType.DATE: {
      const parsed = dayjs(value as string);
      return parsed.isValid() ? parsed.format('YYYY-MM-DD') : String(value);
    }
    case CustomFieldDataType.DATETIME: {
      const parsed = dayjs(value as string);
      return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : String(value);
    }
    default:
      if (Array.isArray(value)) {
        const options = readOptions(field);
        return value.map((item) => toOptionLabel(item, options)).join('、');
      }
      return String(value);
  }
}

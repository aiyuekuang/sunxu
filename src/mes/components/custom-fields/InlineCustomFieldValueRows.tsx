import { StyleSheet, View } from 'react-native';
import type { CustomFieldDefinition } from '../../host/services';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { FontSize, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import {
  CUSTOM_FIELD_COMPUTE_ERROR_TEXT,
  formatCustomFieldDisplay,
  isShowInApp,
  readCustomFieldValueCarrier,
  resolveCustomFieldValue,
} from './formatCustomFieldValue.ts';

interface InlineCustomFieldValueRowsProps {
  /** 当前明细对象的完整字段 schema。 */
  fields: CustomFieldDefinition[];
  /** 后端随明细行装饰返回的自定义字段值。 */
  values: unknown;
  /** 自定义字段配置加载失败时向用户说明明细字段暂不可用。 */
  loadError?: string | null;
}

/** 在单据明细卡片内展示被配置为“App 显示”的自定义字段。 */
export function InlineCustomFieldValueRows({
  fields,
  values,
  loadError,
}: InlineCustomFieldValueRowsProps) {
  const { colors } = useTheme();
  const visibleFields = fields.filter(isShowInApp);
  const carrier = readCustomFieldValueCarrier(values);

  if (visibleFields.length === 0 && !loadError) return null;

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      <Text style={[styles.heading, { color: colors.textSecondary }]}>自定义字段</Text>
      {loadError ? (
        <Text style={[styles.error, { color: colors.error }]}>
          自定义字段加载失败，请刷新后重试。
        </Text>
      ) : (
        visibleFields.map((field) => {
          const hasError = carrier.customComputedErrors?.[field.fieldKey];
          const displayValue = hasError
            ? CUSTOM_FIELD_COMPUTE_ERROR_TEXT
            : formatCustomFieldDisplay(resolveCustomFieldValue(carrier, field), field) || '-';
          return (
            <View key={field.fieldKey} style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{field.label}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{displayValue}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  heading: { fontSize: FontSize.xs, fontWeight: '600' },
  error: { fontSize: FontSize.xs },
  row: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-between' },
  label: { flex: 1, fontSize: FontSize.xs },
  value: { flex: 1, fontSize: FontSize.xs, textAlign: 'right' },
});

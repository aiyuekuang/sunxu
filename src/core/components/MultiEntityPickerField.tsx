import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { AppText as Text } from './AppText';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { type EntityPickerFetchFn, EntityPickerModal } from './EntityPickerModal';

export interface MultiEntityPickerFieldProps<T> {
  label: string;
  values: T[];
  onChange: (items: T[]) => void;
  fetchFn: EntityPickerFetchFn<T>;
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  sublabelExtractor?: (item: T) => string;
  title?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
  // 新增：自定义渲染额外信息
  renderExtra?: (item: T) => React.ReactNode;
  // 新增：额外操作点击事件
  onExtraPress?: (item: T) => void;
  /** 返回禁用原因字符串则该项不可选；返回 null/undefined 则可选 */
  disabledExtractor?: (item: T) => string | null | undefined;
  /** 以设备优先级列表回显已选项，并允许用户调整顺序。 */
  orderedSelection?: boolean;
  orderedItemHeader?: string;
  orderedPriorityHeader?: string;
}

export function MultiEntityPickerField<T>({
  label,
  values,
  onChange,
  fetchFn,
  keyExtractor,
  labelExtractor,
  sublabelExtractor,
  title,
  placeholder,
  required,
  error,
  containerStyle,
  renderExtra,
  onExtraPress,
  disabledExtractor,
  orderedSelection = false,
  orderedItemHeader,
  orderedPriorityHeader = '优先级',
}: MultiEntityPickerFieldProps<T>) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const removeItem = (key: string) => {
    onChange(values.filter((v) => keyExtractor(v) !== key));
  };

  const moveItem = (index: number, offset: -1 | 1) => {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= values.length) return;
    const next = [...values];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
        {required && <Text style={{ color: colors.error, fontSize: FontSize.sm }}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[
          styles.fieldWrapper,
          orderedSelection && { minHeight: MIN_TOUCH_TARGET },
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: error ? colors.error : 'transparent',
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          orderedSelection ? `选择${label}，当前已选${values.length}项` : `选择${label}`
        }
      >
        {orderedSelection || values.length === 0 ? (
          <Text style={[styles.placeholder, { color: colors.textTertiary }]}>
            {values.length === 0 ? placeholder || '请选择' : `调整选择（${values.length}）`}
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            <View style={styles.tags}>
              {values.map((item) => {
                const key = keyExtractor(item);
                return (
                  <View
                    key={key}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: colors.primarySurface,
                        borderColor: `${colors.primary}40`,
                      },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: colors.primary }]} numberOfLines={1}>
                      {labelExtractor(item)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeItem(key)}
                      hitSlop={{ top: 4, right: 4, bottom: 4, left: 4 }}
                    >
                      <Ionicons name="close" size={12} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
        <Ionicons
          name="chevron-down"
          size={16}
          color={colors.textTertiary}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {orderedSelection && values.length > 0 && (
        <View style={[styles.orderedTable, { borderColor: colors.border }]}>
          <View
            style={[
              styles.orderedRow,
              styles.orderedHeader,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.orderedDevice, { color: colors.textSecondary }]}>
              {orderedItemHeader ?? label}
            </Text>
            <Text style={[styles.orderedPriority, { color: colors.textSecondary }]}>
              {orderedPriorityHeader}
            </Text>
          </View>
          {values.map((item, index) => (
            <View
              key={keyExtractor(item)}
              style={[styles.orderedRow, { borderColor: colors.border }]}
            >
              <View style={styles.orderedDevice}>
                <View style={styles.orderedInfo}>
                  <Text style={{ color: colors.text }} numberOfLines={2}>
                    {labelExtractor(item)}
                  </Text>
                  {sublabelExtractor && (
                    <Text
                      style={{ color: colors.textTertiary, fontSize: FontSize.xs }}
                      numberOfLines={1}
                    >
                      {sublabelExtractor(item)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => removeItem(keyExtractor(item))}
                  hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel={`移除${labelExtractor(item)}`}
                  style={styles.orderedAction}
                >
                  <Ionicons name="close-circle-outline" size={19} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
              <View style={styles.orderedPriority}>
                <Text style={[styles.priorityNumber, { color: colors.primary }]}>{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => moveItem(index, -1)}
                  disabled={index === 0}
                  hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel={`提高${labelExtractor(item)}的优先级`}
                  style={[styles.orderedAction, { opacity: index === 0 ? 0.35 : 1 }]}
                >
                  <Ionicons name="chevron-up" size={19} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => moveItem(index, 1)}
                  disabled={index === values.length - 1}
                  hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel={`降低${labelExtractor(item)}的优先级`}
                  style={[
                    styles.orderedAction,
                    { opacity: index === values.length - 1 ? 0.35 : 1 },
                  ]}
                >
                  <Ionicons name="chevron-down" size={19} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

      <EntityPickerModal
        visible={modalVisible}
        title={title ?? label}
        fetchFn={fetchFn}
        keyExtractor={keyExtractor}
        labelExtractor={labelExtractor}
        sublabelExtractor={sublabelExtractor}
        renderExtra={renderExtra}
        onExtraPress={onExtraPress}
        disabledExtractor={disabledExtractor}
        initialSelected={values}
        multi={true}
        onClose={() => setModalVisible(false)}
        onConfirm={(items) => {
          onChange(items);
          setModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: '500' },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 42,
    gap: Spacing.sm,
  },
  placeholder: { flex: 1, fontSize: FontSize.base },
  tagsScroll: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, paddingVertical: 2 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tagText: { fontSize: FontSize.xs, fontWeight: '500', maxWidth: 120 },
  chevron: { flexShrink: 0 },
  orderedTable: { borderWidth: 1, borderRadius: Radius.sm, overflow: 'hidden' },
  orderedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  orderedHeader: { minHeight: 34 },
  orderedDevice: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  orderedInfo: { flex: 1, gap: 2 },
  orderedPriority: {
    width: 122,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  orderedAction: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityNumber: { minWidth: 18, textAlign: 'center', fontWeight: '600' },
  error: { fontSize: FontSize.xs },
});

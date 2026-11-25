import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Pressable,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { AppText as Text } from './AppText';
import { FontSize, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { useScaledFontSize } from '../theme/font-scale';
import { useBottomSheetTextInput } from './BottomSheetContext';
import { type FieldHelpContent, FormLabel } from './FormLabel';
import { useModalRequestCloseContext } from './ModalRequestCloseContext';

const PICKER_TARGET = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;

export interface PickerOption {
  label: string;
  value: string;
  /** 选项可见但不可选，用于解释当前业务不可用的配置项。 */
  disabled?: boolean;
  /** 选项不可选时展示给用户的原因。 */
  disabledReason?: string;
}

export interface PickerFieldProps {
  label: string;
  value?: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  help?: FieldHelpContent;
  error?: string;
  containerStyle?: ViewStyle;
  clearable?: boolean;
  searchable?: boolean;
  /** 禁用交互（只读展示） */
  disabled?: boolean;
  /** 禁用时展示给用户的原因，并作为无障碍提示 */
  disabledReason?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function PickerField({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
  help,
  error,
  containerStyle,
  clearable = false,
  searchable = true,
  disabled = false,
  disabledReason,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: PickerFieldProps) {
  const { colors } = useTheme();
  const searchInputFontSize = useScaledFontSize(FontSize.base);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const modalRequestClose = useModalRequestCloseContext();
  const { InputComponent, inputKey, inputProps } = useBottomSheetTextInput({
    value: query,
    onChangeText: setQuery,
    forceInsideBottomSheet: true,
  });

  const selectedOption = options.find((o) => o.value === value);
  const displayText = selectedOption?.label ?? '';
  const resolvedDisabledReason = disabled ? (disabledReason ?? '当前字段不可修改') : undefined;
  const triggerLabel = accessibilityLabel ?? (label || '选择项');

  const filtered = useMemo(
    () =>
      query.trim()
        ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
        : options,
    [options, query],
  );

  const open = () => {
    setQuery('');
    sheetRef.current?.present();
  };

  const close = useCallback(() => sheetRef.current?.dismiss(), []);

  // Android 返回键关闭弹窗（gorhom 不内置此行为）
  useEffect(() => {
    if (!isOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen || !modalRequestClose) return;
    return modalRequestClose.registerRequestCloseHandler(close);
  }, [isOpen, modalRequestClose, close]);

  const handleSelect = (opt: PickerOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    close();
  };

  const handleClear = () => onChange('');

  const snapPoints = useMemo(() => {
    if (options.length <= 5) return ['40%'];
    if (options.length <= 10) return ['55%'];
    return ['70%'];
  }, [options.length]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const showSearch = searchable && options.length > 5;
  const keyboardBehavior = Platform.OS === 'ios' ? 'interactive' : 'fillParent';
  const androidKeyboardInputMode = Platform.OS === 'android' ? 'adjustPan' : undefined;

  const listHeader = (
    <View style={{ backgroundColor: colors.surface }}>
      {/* Header */}
      <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sheetTitle, { color: colors.text }]}>{label}</Text>
        <TouchableOpacity
          onPress={close}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          accessibilityRole="button"
          accessibilityLabel="关闭选择器"
        >
          <Ionicons name="close" size={22} color={colors.textSecondary} accessible={false} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      {showSearch && (
        <View style={[styles.searchRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.textTertiary} accessible={false} />
          <InputComponent
            key={inputKey}
            style={[styles.searchInput, { color: colors.text, fontSize: searchInputFontSize }]}
            {...inputProps}
            placeholder="搜索…"
            placeholderTextColor={colors.textTertiary}
            numberOfLines={1}
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <TouchableOpacity
              onPress={() => inputProps.onChangeText('')}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              accessibilityRole="button"
              accessibilityLabel="清除搜索"
            >
              <Ionicons name="close-circle" size={16} color={colors.textTertiary} accessible={false} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <FormLabel label={label} required={required} help={help} />

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? colors.error : disabled ? colors.border : 'transparent',
            backgroundColor: colors.surfaceSecondary,
            opacity: disabled ? 0.72 : 1,
          },
        ]}
      >
        <Pressable
          style={styles.inputMain}
          onPress={disabled ? undefined : open}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`${triggerLabel}，${displayText || placeholder || '请选择'}`}
          accessibilityHint={accessibilityHint ?? resolvedDisabledReason}
          accessibilityState={{ disabled }}
          testID={testID ? `${testID}-open` : undefined}
        >
          <Text
            style={[styles.valueText, { color: displayText ? colors.text : colors.textTertiary }]}
            numberOfLines={1}
          >
            {displayText || placeholder || '请选择'}
          </Text>
          {!clearable || !displayText ? (
            <Ionicons name="chevron-down" size={16} color={colors.textTertiary} accessible={false} />
          ) : null}
        </Pressable>
        {clearable && displayText && !disabled ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`清除${label}`}
            testID={testID ? `${testID}-clear` : undefined}
          >
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} accessible={false} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
      {resolvedDisabledReason ? (
        <Text style={[styles.disabledHint, { color: colors.warning }]}>
          {resolvedDisabledReason}
        </Text>
      ) : null}

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        stackBehavior="push"
        onChange={(index) => setIsOpen(index >= 0)}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
        keyboardBehavior={keyboardBehavior}
        keyboardBlurBehavior="restore"
        android_keyboardInputMode={androidKeyboardInputMode}
      >
        {/* BottomSheetFlatList 直接作为内容，不包在 BottomSheetView 里 */}
        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(item: PickerOption) => item.value}
          keyboardShouldPersistTaps="handled"
          stickyHeaderIndices={[0]}
          ListHeaderComponent={listHeader}
          renderItem={({ item }: { item: PickerOption }) => {
            const isSelected = item.value === value;
            const disabledReason = item.disabled
              ? (item.disabledReason ?? '当前条件未满足，暂不可选择')
              : undefined;
            return (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  { borderBottomColor: colors.borderLight },
                  isSelected && { backgroundColor: colors.primarySurface },
                  item.disabled && { opacity: 0.45 },
                ]}
                onPress={item.disabled ? undefined : () => handleSelect(item)}
                activeOpacity={item.disabled ? 1 : 0.6}
                disabled={item.disabled}
                accessibilityRole="button"
                accessibilityState={{ disabled: item.disabled }}
                accessibilityHint={disabledReason}
              >
                <View style={styles.optionTextWrap}>
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: item.disabled
                          ? colors.textTertiary
                          : isSelected
                            ? colors.primary
                            : colors.text,
                      },
                      isSelected && { fontWeight: '600' },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {disabledReason ? (
                    <Text style={[styles.optionDisabledReason, { color: colors.textMuted }]}>
                      {disabledReason}
                    </Text>
                  ) : null}
                </View>
                {isSelected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>无匹配结果</Text>
          }
        />
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingLeft: Spacing.md,
    minHeight: PICKER_TARGET,
  },
  inputMain: {
    flex: 1,
    minHeight: PICKER_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  clearButton: {
    minWidth: PICKER_TARGET,
    minHeight: PICKER_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    flex: 1,
    fontSize: FontSize.base,
  },
  error: {
    fontSize: FontSize.xs,
  },
  disabledHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.base,
    padding: 0,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: FontSize.base,
  },
  optionTextWrap: {
    flex: 1,
    gap: Spacing.xs,
  },
  optionDisabledReason: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    paddingVertical: Spacing['2xl'],
  },
});

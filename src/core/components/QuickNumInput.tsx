import { StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { useBottomSheetTextInput } from './BottomSheetContext.ts';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { useScaledFontSize } from '../theme/font-scale';
import { AppText as Text } from './AppText.tsx';
import { type FieldHelpContent, FormLabel } from './FormLabel.tsx';

interface QuickButton {
  label: string;
  value: number | 'max' | 'min';
}

interface QuickNumInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
  /** 最大值（用于 Max 按钮和 ± 边界限制） */
  max?: number;
  /** 最小值，默认 0 */
  min?: number;
  /** 步进值，默认 1 */
  step?: number;
  /** 自定义快捷按钮，不传则默认 ±step 和 Max */
  quickButtons?: QuickButton[];
  /** 单位标签（如 "件"、"个"） */
  unit?: string;
  /** 提示文字（如 "计划 100"） */
  hint?: string;
  /** 字段补充说明；仅通过标签旁帮助按钮展开。 */
  help?: FieldHelpContent;
  /** 是否只允许整数 */
  integerOnly?: boolean;
  /** 小数精度限制，仅在非整数模式下生效 */
  precision?: number;
  /** 是否在输入超过上限时自动裁剪，默认裁剪 */
  clampToBounds?: boolean;
}

function formatNumericValue(value: number, precision?: number): string {
  if (precision === undefined) return String(value);
  return value
    .toFixed(precision)
    .replace(/\.?0+$/, '')
    .replace(/\.$/, '');
}

export function QuickNumInput({
  label,
  value,
  onChangeText,
  placeholder = '0',
  required,
  error,
  containerStyle,
  max,
  min = 0,
  step = 1,
  quickButtons,
  unit,
  hint,
  help,
  integerOnly = false,
  precision,
  clampToBounds = true,
}: QuickNumInputProps) {
  const { colors } = useTheme();
  const inputFontSize = useScaledFontSize(FontSize.base);
  const { InputComponent, inputKey, inputProps } = useBottomSheetTextInput({ value, onChangeText });

  const currentVal = parseFloat(value) || 0;

  const handleIncrement = (amount: number | 'max' | 'min') => {
    if (amount === 'max' && max !== undefined) {
      inputProps.onChangeText(formatNumericValue(max, precision));
      return;
    }
    if (amount === 'min') {
      inputProps.onChangeText(formatNumericValue(min, precision));
      return;
    }
    const num = typeof amount === 'number' ? amount : 0;
    const rawVal = currentVal + num;
    const newVal = clampToBounds
      ? Math.max(min, max !== undefined ? Math.min(rawVal, max) : rawVal)
      : Math.max(min, rawVal);
    inputProps.onChangeText(
      formatNumericValue(
        precision !== undefined ? Math.round(newVal * 10 ** precision) / 10 ** precision : newVal,
        precision,
      ),
    );
  };

  const buttons = quickButtons ?? [
    { label: `−${step}`, value: -step },
    { label: `+${step}`, value: step },
    ...(max !== undefined ? [{ label: '最大', value: 'max' as const }] : []),
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <FormLabel label={label} required={required} help={help} />
        {hint && <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <View
          style={[
            styles.inputWrapper,
            {
              borderColor: error ? colors.error : 'transparent',
              backgroundColor: colors.surfaceSecondary,
            },
          ]}
        >
          <InputComponent
            key={inputKey}
            style={[styles.input, { color: colors.text, fontSize: inputFontSize }]}
            {...inputProps}
            onChangeText={(text: string) => {
              const numericPattern = integerOnly
                ? /^\d*$/
                : precision !== undefined
                  ? new RegExp(`^\\d*(\\.\\d{0,${precision}})?$`)
                  : /^\d*(\.\d*)?$/;
              if (!numericPattern.test(text)) {
                return;
              }

              const num = integerOnly ? Number.parseInt(text, 10) : parseFloat(text);
              if (text === '' || Number.isNaN(num)) {
                inputProps.onChangeText(text);
                return;
              }
              if (clampToBounds && max !== undefined && num > max) {
                inputProps.onChangeText(formatNumericValue(max, precision));
                return;
              }
              if (num < min) {
                if (clampToBounds) {
                  inputProps.onChangeText(formatNumericValue(min, precision));
                }
                return;
              }
              inputProps.onChangeText(integerOnly ? String(num) : text);
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            numberOfLines={1}
            keyboardType={integerOnly ? 'number-pad' : 'decimal-pad'}
          />
          {unit && <Text style={[styles.unit, { color: colors.textMuted }]}>{unit}</Text>}
        </View>

        <View style={styles.quickRow}>
          {buttons.map((btn) => {
            const isDisabled =
              (btn.value === 'min' && currentVal <= min) ||
              (btn.value === 'max' && max !== undefined && currentVal >= max) ||
              (typeof btn.value === 'number' && btn.value < 0 && currentVal + btn.value < min) ||
              (typeof btn.value === 'number' &&
                btn.value > 0 &&
                max !== undefined &&
                currentVal >= max);

            return (
              <TouchableOpacity
                key={btn.label}
                style={[
                  styles.quickBtn,
                  {
                    backgroundColor: isDisabled ? colors.borderLight : `${colors.primary}12`,
                    borderColor: isDisabled ? colors.border : `${colors.primary}30`,
                  },
                ]}
                onPress={() => handleIncrement(btn.value)}
                disabled={isDisabled}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.quickBtnText,
                    { color: isDisabled ? colors.textTertiary : colors.primary },
                  ]}
                >
                  {btn.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    fontSize: FontSize.xs,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: 4,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    padding: 0,
  },
  unit: {
    fontSize: FontSize.xs,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 4,
  },
  quickBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    minWidth: 36,
    alignItems: 'center',
  },
  quickBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  error: {
    fontSize: FontSize.xs,
  },
});

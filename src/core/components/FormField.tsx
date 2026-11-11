import type React from 'react';
import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Switch,
  type TextInputProps,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { AppText as Text } from './AppText';
import { IconActionButton } from './IconActionButton';
import { useBottomSheetTextInput } from './BottomSheetContext';
import { BorderWidth, FontSize, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { useScaledFontSize } from '../theme/font-scale';
import { type FieldHelpContent, FormLabel } from './FormLabel';

export interface FormFieldProps extends TextInputProps {
  /** 字段标签；传空字符串时不渲染标签行（如筛选面板里已由分组标题提供标签） */
  label?: string;
  error?: string;
  required?: boolean;
  help?: FieldHelpContent;
  /** Layout the field group; `style` remains the native TextInput style. */
  containerStyle?: StyleProp<ViewStyle>;
  secureToggle?: boolean;
  rightElement?: React.ReactNode;
}

export function FormField({
  label,
  error,
  required,
  help,
  containerStyle,
  secureToggle,
  secureTextEntry,
  rightElement,
  multiline,
  numberOfLines,
  onFocus,
  onBlur,
  accessibilityLabel,
  style,
  value,
  onChangeText,
  ...props
}: FormFieldProps) {
  const { colors } = useTheme();
  const inputFontSize = useScaledFontSize(FontSize.base);
  const touchTarget = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { InputComponent, inputKey, inputProps } = useBottomSheetTextInput({ value, onChangeText });
  const isReadOnly = props.editable === false;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <FormLabel label={label} required={required} help={help} /> : null}
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.inputWrapperMultiline,
          {
            borderColor: error ? colors.error : focused ? colors.primary : colors.border,
            backgroundColor: isReadOnly ? colors.surfaceSecondary : colors.surface,
          },
          isReadOnly && styles.inputWrapperReadonly,
        ]}
      >
        <InputComponent
          key={inputKey}
          style={[
            styles.input,
            Platform.OS === 'web' && styles.inputWeb,
            style,
            { minHeight: touchTarget, color: colors.text, fontSize: inputFontSize },
            multiline && styles.inputMultiline,
          ]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          textAlignVertical={multiline ? 'top' : undefined}
          underlineColorAndroid="transparent"
          {...inputProps}
          {...props}
          accessibilityLabel={accessibilityLabel ?? (label || undefined)}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
        {secureToggle && secureTextEntry && (
          <IconActionButton
            icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={touchTarget}
            iconSize={18}
            onPress={() => setShowPassword((v) => !v)}
            accessibilityLabel={`${showPassword ? '隐藏' : '显示'}${label}`}
            selected={showPassword}
          />
        )}
        {rightElement}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

export function FormSwitch({
  label,
  value,
  onValueChange,
  disabled = false,
  containerStyle,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.switchRow, containerStyle]}>
      <Text style={[styles.switchLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.textOnPrimary}
      />
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
    borderWidth: BorderWidth.default,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    minHeight: MIN_TOUCH_TARGET_ANDROID,
    gap: Spacing.sm,
  },
  inputWrapperMultiline: {
    height: undefined,
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  inputWrapperReadonly: {
    opacity: 0.72,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    padding: 0,
  },
  inputWeb: {
    // The wrapper owns the shared focus ring; suppress the browser's nested input outline.
    outlineColor: 'transparent',
    outlineWidth: 0,
  },
  inputMultiline: {
    minHeight: 64,
  },
  error: {
    fontSize: FontSize.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  switchLabel: {
    fontSize: FontSize.base,
  },
});

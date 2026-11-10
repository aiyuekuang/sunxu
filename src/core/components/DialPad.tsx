import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { MIN_TOUCH_TARGET, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

const DIAL_KEYS = [
  { key: '1', letters: '' },
  { key: '2', letters: 'ABC' },
  { key: '3', letters: 'DEF' },
  { key: '4', letters: 'GHI' },
  { key: '5', letters: 'JKL' },
  { key: '6', letters: 'MNO' },
  { key: '7', letters: 'PQRS' },
  { key: '8', letters: 'TUV' },
  { key: '9', letters: 'WXYZ' },
  { key: '*', letters: '' },
  { key: '0', letters: '+' },
  { key: '#', letters: '' },
] as const;

interface DialPadBaseProps {
  /** Placeholder shown while the value is empty. */
  placeholder?: string;
  /** Disables all keypad and action controls. */
  disabled?: boolean;
}

export type DialPadProps = DialPadBaseProps & (
  | {
  variant?: 'full';
  /** Current number. The host owns its value and may initialize or reset it. */
  value: string;
  /** Called when a key is appended or the final character is removed. */
  onChangeText: (value: string) => void;
  /** Called with the current number. The host owns dialing and any result feedback. */
  onSubmit: (value: string) => void;
  /** Maximum characters accepted from keypad presses. Defaults to 20. */
  maxLength?: number;
  /** Shows progress and disables delete/submit while the host processes submission. */
  isSubmitting?: boolean;
  /** Host-managed key handling, such as routing keys to an active call flow. */
  onKeyPress?: (key: string) => void;
  }
  | {
  /** Render only the keypad grid for host-owned dial displays and call controls. */
  variant: 'keypad';
  /** Optional host-managed key handling, such as routing keys to an active call flow. */
  onKeyPress: (key: string) => void;
  value?: string;
  onChangeText?: (value: string) => void;
  onSubmit?: (value: string) => void;
  maxLength?: number;
  isSubmitting?: never;
  }
);

/** Controlled telephone keypad. It only edits and submits the supplied value. */
export function DialPad({
  value = '',
  onChangeText = () => undefined,
  onSubmit = () => undefined,
  maxLength = 20,
  placeholder = '输入号码',
  disabled = false,
  isSubmitting = false,
  variant = 'full',
  onKeyPress,
}: DialPadProps) {
  const { colors } = useTheme();
  const hasValue = value.length > 0;
  const limit = Math.max(0, Math.floor(maxLength));
  const keypadDisabled = disabled || (!onKeyPress && value.length >= limit);
  const canSubmit = hasValue && !disabled && !isSubmitting;
  const canDelete = hasValue && !disabled && !isSubmitting;

  const appendKey = (key: string) => {
    if (keypadDisabled) return;
    if (onKeyPress) {
      onKeyPress(key);
      return;
    }
    onChangeText((value + key).slice(0, limit));
  };

  return (
    <View style={styles.container}>
      {variant === 'full' ? <AppText
        style={[
          styles.value,
          { color: hasValue ? colors.text : colors.textMuted },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        accessibilityRole="text"
        accessibilityLabel={hasValue ? `当前号码 ${value}` : placeholder}
      >
        {value || placeholder}
      </AppText> : null}

      <View style={styles.grid}>
        {[0, 1, 2, 3].map((rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {DIAL_KEYS.slice(rowIndex * 3, rowIndex * 3 + 3).map(
              ({ key, letters }) => (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.key,
                    {
                      backgroundColor: pressed ? colors.border : colors.surfaceSecondary,
                      borderColor: colors.border,
                      opacity: keypadDisabled ? 0.48 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    key === '*' ? '星号' : key === '#' ? '井号' : key
                  }
                  accessibilityHint="添加到拨号号码"
                  accessibilityState={{ disabled: keypadDisabled }}
                  disabled={keypadDisabled}
                  onPress={() => appendKey(key)}
                >
                  <AppText style={[styles.keyText, { color: colors.text }]}>
                    {key}
                  </AppText>
                  {letters ? (
                    <AppText
                      style={[
                        styles.letters,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {letters}
                    </AppText>
                  ) : null}
                </Pressable>
              ),
            )}
          </View>
        ))}
      </View>

      {variant === 'full' ? <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionSlot,
            pressed && canDelete && { opacity: 0.55 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="删除最后一位"
          accessibilityState={{ disabled: !canDelete }}
          disabled={!canDelete}
          onPress={() => onChangeText(value.slice(0, -1))}
        >
          <Ionicons
            name="backspace-outline"
            size={23}
            color={canDelete ? colors.textSecondary : colors.textMuted}
            accessible={false}
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: !canSubmit ? 0.58 : pressed ? 0.78 : 1,
            },
          ]}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel={hasValue ? `拨打 ${value}` : '输入号码后拨打'}
          accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }}
          onPress={() => onSubmit(value)}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Ionicons
              name="call"
              size={25}
              color={colors.textOnPrimary}
              accessible={false}
            />
          )}
        </Pressable>
        <View style={styles.actionSlot} />
      </View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  value: {
    minHeight: 42,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },
  grid: { gap: 10 },
  row: { flexDirection: 'row', gap: Spacing.md },
  key: {
    flex: 1,
    height: 64,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontSize: 23, lineHeight: 26, fontWeight: '500' },
  letters: {
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 1,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  actionSlot: {
    width: 64,
    minHeight: MIN_TOUCH_TARGET,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.xl,
  },
});

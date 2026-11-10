import type React from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { FontSize, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { ActionButton } from './ActionButton';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { SelectableChip } from './SelectableChip';

export interface ChoiceOption {
  key: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface ChoiceSheetProps {
  visible: boolean;
  title: string;
  value: string;
  options: readonly ChoiceOption[];
  onClose: () => void;
  onConfirm: (value: string) => void;
  maxHeightRatio?: number;
  style?: StyleProp<ViewStyle>;
}

/** Single-choice sheet with an explicit draft and confirm boundary. */
export function ChoiceSheet({
  visible,
  title,
  value,
  options,
  onClose,
  onConfirm,
  maxHeightRatio = 0.64,
  style,
}: ChoiceSheetProps) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (visible) setDraft(value);
  }, [value, visible]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      maxHeightRatio={maxHeightRatio}
      footer={(
        <View style={styles.actions}>
          <ActionButton
            variant="secondary"
            onPress={onClose}
            style={styles.actionButton}
          >
            取消
          </ActionButton>
          <ActionButton
            onPress={() => {
              onConfirm(draft);
              onClose();
            }}
            style={styles.actionButton}
          >
            确定
          </ActionButton>
        </View>
      )}
    >
      <View style={[styles.content, style]}>
        <AppText accessibilityRole="text" style={[styles.hint, { color: colors.primary }]}>单选</AppText>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.options} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {options.map((option) => (
            <SelectableChip
              key={option.key}
              label={option.count != null && option.count > 0 ? `${option.label} (${option.count})` : option.label}
              selected={draft === option.key}
              disabled={option.disabled}
              onPress={() => setDraft(option.key)}
            />
          ))}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { flexShrink: 1, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  hint: { alignSelf: 'flex-end', marginTop: Spacing.xs, fontSize: FontSize.xs, fontWeight: '600' },
  scroll: { flexShrink: 1 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingVertical: Spacing.md },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionButton: { flex: 1 },
});

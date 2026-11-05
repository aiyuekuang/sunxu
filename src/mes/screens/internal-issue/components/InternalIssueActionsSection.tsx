import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface InternalIssueActionsSectionProps {
  canEdit: boolean;
  canComplete: boolean;
  canCancel: boolean;
  running?: boolean;
  onEdit: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

export function InternalIssueActionsSection({
  canEdit,
  canComplete,
  canCancel,
  running = false,
  onEdit,
  onComplete,
  onCancel,
}: InternalIssueActionsSectionProps) {
  const { colors } = useTheme();
  const disabledReason = running ? '正在处理领用单，请稍候' : undefined;

  if (!canEdit && !canComplete && !canCancel) {
    return null;
  }

  return (
    <DetailCard title="处理动作">
      <View style={styles.actionWrap}>
        {canEdit ? (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: running ? colors.surfaceSecondary : `${colors.primary}12`,
                borderColor: running ? colors.border : 'transparent',
              },
              running && styles.actionBtnDisabled,
            ]}
            onPress={onEdit}
            activeOpacity={0.72}
            disabled={running}
            accessibilityState={{ disabled: running }}
            accessibilityHint={disabledReason}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={running ? colors.textMuted : colors.primary}
            />
            <Text
              style={[styles.actionText, { color: running ? colors.textMuted : colors.primary }]}
            >
              {running ? '处理中…' : '编辑草稿'}
            </Text>
          </TouchableOpacity>
        ) : null}
        {canComplete ? (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: running ? colors.surfaceSecondary : `${colors.success}12`,
                borderColor: running ? colors.border : 'transparent',
              },
              running && styles.actionBtnDisabled,
            ]}
            onPress={onComplete}
            activeOpacity={0.72}
            disabled={running}
            accessibilityState={{ disabled: running }}
            accessibilityHint={disabledReason}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={running ? colors.textMuted : colors.success}
            />
            <Text
              style={[styles.actionText, { color: running ? colors.textMuted : colors.success }]}
            >
              {running ? '处理中…' : '确认领用'}
            </Text>
          </TouchableOpacity>
        ) : null}
        {canCancel ? (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: running ? colors.surfaceSecondary : `${colors.error}10`,
                borderColor: running ? colors.border : 'transparent',
              },
              running && styles.actionBtnDisabled,
            ]}
            onPress={onCancel}
            activeOpacity={0.72}
            disabled={running}
            accessibilityState={{ disabled: running }}
            accessibilityHint={disabledReason}
          >
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={running ? colors.textMuted : colors.error}
            />
            <Text style={[styles.actionText, { color: running ? colors.textMuted : colors.error }]}>
              {running ? '处理中…' : '取消单据'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  actionWrap: { gap: Spacing.sm },
  actionBtn: {
    minHeight: 42,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  actionBtnDisabled: { borderWidth: 1 },
  actionText: { fontSize: FontSize.sm, fontWeight: '700' },
});

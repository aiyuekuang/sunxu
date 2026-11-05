import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  /** 紧凑模式，用于内嵌在卡片/表单中的子列表 */
  compact?: boolean;
  /** 操作按钮（如"重试"） */
  action?: { label: string; onPress: () => void };
}

export function EmptyState({
  icon = 'folder-open-outline',
  title,
  description,
  compact,
  action,
}: EmptyStateProps) {
  const { colors } = useTheme();

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name={icon} size={28} color={colors.textTertiary} />
        <Text style={[styles.compactTitle, { color: colors.textMuted }]}>{title}</Text>
        {description && (
          <Text style={[styles.compactDesc, { color: colors.textTertiary }]}>{description}</Text>
        )}
        {action && (
          <Pressable
            style={[styles.compactActionBtn, { backgroundColor: colors.primary }]}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Text style={[styles.compactActionText, { color: colors.textOnPrimary }]}>
              {action.label}
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={36} color={colors.textTertiary} />
      <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
      {description && <Text style={[styles.desc, { color: colors.textMuted }]}>{description}</Text>}
      {action && (
        <Pressable
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Text style={[styles.actionText, { color: colors.textOnPrimary }]}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: Spacing['2xl'],
    gap: 4,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  desc: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionBtn: {
    minWidth: Spacing['4xl'],
    minHeight: Spacing['4xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  compactContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: 2,
  },
  compactTitle: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  compactDesc: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  compactActionBtn: {
    minWidth: Spacing['4xl'],
    minHeight: Spacing['4xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  compactActionText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});

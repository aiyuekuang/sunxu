import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET_ANDROID, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

type WorkbenchTone = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface HomeWorkbenchMetric {
  label: string;
  value: string;
  tone?: WorkbenchTone;
}

export interface HomeWorkbenchAction {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: WorkbenchTone;
  onPress: () => void;
}

export function toWorkbenchMetricValue(value: number | null): string {
  return value == null ? '—' : String(value);
}

interface HomeWorkbenchCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  metrics: HomeWorkbenchMetric[];
  actions: HomeWorkbenchAction[];
  note?: string;
  loading?: boolean;
  errorText?: string | null;
  moreLabel?: string;
  onPressMore?: () => void;
  children?: React.ReactNode;
}

function resolveToneColor(tone: WorkbenchTone, colors: ReturnType<typeof useTheme>['colors']) {
  switch (tone) {
    case 'primary':
      return colors.primary;
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'error':
      return colors.error;
    default:
      return colors.text;
  }
}

export function HomeWorkbenchCard({
  icon,
  title,
  description,
  metrics,
  actions,
  note,
  loading = false,
  errorText,
  moreLabel = '查看全部',
  onPressMore,
  children,
}: HomeWorkbenchCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
    >
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight },
            ]}
          >
            <Ionicons name={icon} size={16} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
          </View>
        </View>
        {onPressMore ? (
          <TouchableOpacity
            activeOpacity={0.72}
            hitSlop={HIT_SLOP}
            onPress={onPressMore}
            accessibilityRole="button"
            accessibilityLabel={moreLabel + title}
            style={styles.moreBtn}
          >
            <Ionicons accessible={false} name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <InlineLoading />
        </View>
      ) : (
        <>
          <View style={styles.metricRow}>
            {metrics.map((metric) => {
              const toneColor = resolveToneColor(metric.tone ?? 'default', colors);
              return (
                <View
                  key={metric.label}
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <Text style={[styles.metricValue, { color: toneColor }]}>{metric.value}</Text>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                    {metric.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {children ? <View style={styles.childrenWrap}>{children}</View> : null}

          {errorText ? (
            <Text style={[styles.note, { color: colors.textMuted }]}>{errorText}</Text>
          ) : note ? (
            <Text style={[styles.note, { color: colors.textSecondary }]}>{note}</Text>
          ) : null}

          <View style={styles.actionRow}>
            {actions.map((action) => {
              const toneColor = resolveToneColor(action.tone ?? 'default', colors);
              return (
                <TouchableOpacity
                  key={action.key}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.borderLight,
                    },
                  ]}
                  activeOpacity={0.72}
                  onPress={action.onPress}
                >
                  <Ionicons name={action.icon} size={15} color={toneColor} />
                  <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  description: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  moreBtn: {
    minWidth: MIN_TOUCH_TARGET_ANDROID,
    minHeight: MIN_TOUCH_TARGET_ANDROID,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingWrap: {
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    minHeight: 62,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: FontSize.xs,
  },
  note: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  childrenWrap: {
    gap: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionBtn: {
    minHeight: 44,
    minWidth: '31%',
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
});

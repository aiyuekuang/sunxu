import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { AppText as Text } from './AppText.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface DetailCardProps {
  title?: string;
  children: React.ReactNode;
  /** 卡片外层布局样式；style 仍只作用于内容卡片。 */
  containerStyle?: ViewStyle;
  style?: ViewStyle;
  /** 不显示内边距（用于自定义内部布局） */
  noPadding?: boolean;
  /** 标题右侧自定义内容 */
  right?: React.ReactNode;
}

export function DetailCard({
  title,
  children,
  containerStyle,
  style,
  noPadding,
  right,
}: DetailCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {title || right ? (
        <View style={styles.titleRow}>
          {title ? (
            <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
          ) : (
            <View />
          )}
          {right}
        </View>
      ) : null}
      <View
        style={[
          styles.card,
          Shadow.sm,
          { backgroundColor: colors.surface },
          noPadding ? null : styles.cardPadding,
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value?: string | number | null;
  /** 是否为最后一行（不显示底部分隔线） */
  last?: boolean;
  /** 右侧自定义渲染 */
  right?: React.ReactNode;
  /** 点击回调，有值时显示右侧箭头图标 */
  onPress?: () => void;
}

export function InfoRow({ label, value, last, right, onPress }: InfoRowProps) {
  const { colors } = useTheme();
  const borderStyle = last
    ? null
    : { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border };

  const content = (
    <>
      <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
      {right ?? (
        <View style={styles.rowRight}>
          <Text
            style={[styles.rowValue, { color: onPress ? colors.primary : colors.text }]}
            numberOfLines={2}
          >
            {value ?? '-'}
          </Text>
          {onPress && <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />}
        </View>
      )}
    </>
  );

  const primaryRow = onPress ? (
    <Pressable style={[styles.row, borderStyle]} onPress={onPress}>
      {content}
    </Pressable>
  ) : (
    <View style={[styles.row, borderStyle]}>{content}</View>
  );

  return primaryRow;
}

interface StatusTagProps {
  label: string;
  color: string;
  bg: string;
}

export function StatusTag({ label, color, bg }: StatusTagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
    marginLeft: Spacing.xs,
    marginRight: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  card: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  cardPadding: {
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 1,
    gap: Spacing.md,
  },
  rowLabel: {
    fontSize: FontSize.base,
    flexShrink: 0,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 2,
  },
  rowValue: {
    fontSize: FontSize.base,
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});

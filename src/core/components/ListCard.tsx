import type React from 'react';
import { type StyleProp, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { FontSize, Radius, Shadow, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText.tsx';

interface ListCardProps {
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * 通用列表卡片容器，提供统一的圆角、阴影、背景色、间距
 */
export function ListCard({
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityHint,
  style,
  children,
}: ListCardProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress && !onLongPress}
      accessibilityRole={onPress || onLongPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {children}
    </TouchableOpacity>
  );
}

// ---- Compound sub-components ----

/** 卡片头部：左侧 + 右侧（通常是编号 + Badge） */
function CardHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

/** 卡片标题行 */
function CardTitle({
  children,
  numberOfLines = 1,
}: {
  children: React.ReactNode;
  numberOfLines?: number;
}) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.title, { color: colors.text }]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

/** 卡片副标题/描述 */
function CardSubtitle({
  children,
  numberOfLines = 2,
}: {
  children: React.ReactNode;
  numberOfLines?: number;
}) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

/** 卡片元数据行（水平排列） */
function CardMeta({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.meta, style]}>{children}</View>;
}

/** 卡片元数据文本 */
function MetaText({ children, color }: { children: React.ReactNode; color?: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.metaText, { color: color ?? colors.textSecondary }]} numberOfLines={1}>
      {children}
    </Text>
  );
}

/** 卡片编号文本（常用于 header 左侧） */
function CardCode({ children, color }: { children: React.ReactNode; color?: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.code, { color: color ?? colors.primary }]} numberOfLines={1}>
      {children}
    </Text>
  );
}

/** 卡片操作按钮行 */
function CardActions({ children }: { children: React.ReactNode }) {
  return <View style={styles.actions}>{children}</View>;
}

// Attach sub-components
ListCard.Header = CardHeader;
ListCard.Title = CardTitle;
ListCard.Subtitle = CardSubtitle;
ListCard.Meta = CardMeta;
ListCard.MetaText = MetaText;
ListCard.Code = CardCode;
ListCard.Actions = CardActions;

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaText: {
    fontSize: FontSize.xs,
  },
  code: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});

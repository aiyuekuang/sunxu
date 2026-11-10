import type React from 'react';
import { type AccessibilityRole, type StyleProp, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { FontSize, Radius, Shadow, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText';

interface ListCardProps {
  /** Makes the full card the primary action, usually opening its detail view. */
  onPress?: () => void;
  /** Optional secondary action for a long press. */
  onLongPress?: () => void;
  /** Spoken name for the card action when a press handler is provided. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Expanded state for cards that reveal inline details. */
  expanded?: boolean;
  /** Controlled selection state for entity/record choice lists. */
  selected?: boolean;
  /** Role for option lists that expose radio or checkbox selection semantics. */
  accessibilityRole?: AccessibilityRole;
  /** Checked state for checkbox-style record selection. */
  checked?: boolean;
  /** Prevents the card action and announces the disabled state. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Shared list-card surface. Without press handlers it stays a plain View so
 * nested actions keep their own touch targets; with `onPress`, the full card
 * becomes the primary action. Avoid nesting another full-card pressable.
 */
export function ListCard({
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityHint,
  expanded,
  selected = false,
  accessibilityRole = 'button',
  checked,
  disabled = false,
  style,
  children,
}: ListCardProps) {
  const { colors } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: selected ? colors.primarySurface : colors.surface,
      borderColor: selected ? colors.primary : colors.borderLight,
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ];

  // A disabled TouchableOpacity can still form a responder boundary on some
  // native versions. Keep visual-only cards as Views so nested controls retain
  // their own touch targets.
  if (!onPress && !onLongPress) {
    return <View style={cardStyle}>{children}</View>;
  }

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, selected, expanded, checked }}
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
    borderWidth: StyleSheet.hairlineWidth,
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

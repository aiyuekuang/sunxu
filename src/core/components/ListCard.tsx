import { Children, Fragment, isValidElement } from 'react';
import type React from 'react';
import {
  type AccessibilityRole,
  type GestureResponderEvent,
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { FontSize, Radius, Shadow, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { ActionButton } from './ActionButton';
import { AppText as Text } from './AppText';
import { Divider } from './Divider';

export interface ListCardProps {
  /** Makes the card the primary action. With Actions, only the information area is tappable. */
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

export type ListCardActionTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface ListCardActionProps {
  children: React.ReactNode;
  onPress: (event: GestureResponderEvent) => void;
  tone?: ListCardActionTone;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export interface ListCardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface ListCardTitleProps {
  children: React.ReactNode;
  numberOfLines?: number;
}

export interface ListCardSubtitleProps {
  children: React.ReactNode;
  numberOfLines?: number;
}

export interface ListCardMetaProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface ListCardMetaTextProps {
  children: React.ReactNode;
  color?: string;
}

export interface ListCardCodeProps {
  children: React.ReactNode;
  color?: string;
}

export interface ListCardActionsProps {
  children: React.ReactNode;
}

/**
 * Shared list-card surface. Without press handlers it stays a plain View.
 * With an action row, `onPress` applies only to the information area so the
 * row actions remain independent controls.
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

  const cardChildren = flattenFragments(children);
  const actionSections = cardChildren.filter(
    (child) => isValidElement(child) && child.type === CardActions,
  );
  const contentChildren = cardChildren.filter(
    (child) => !(isValidElement(child) && child.type === CardActions),
  );
  const hasActionSections = actionSections.length > 0;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: selected ? colors.primarySurface : colors.surface,
      borderColor: selected ? colors.primary : colors.borderLight,
      opacity: disabled && !hasActionSections ? 0.5 : 1,
    },
    style,
  ];

  // Keep detail navigation separate from the action row. This avoids nested
  // interactive elements when a card has independently tappable actions.
  if (actionSections.length > 0) {
    return (
      <View style={cardStyle}>
        {contentChildren.length > 0 ? (
          onPress || onLongPress ? (
            <TouchableOpacity
              style={[styles.cardContent, { opacity: disabled ? 0.5 : 1 }]}
              onPress={onPress}
              onLongPress={onLongPress}
              disabled={disabled}
              activeOpacity={0.75}
              accessibilityRole={accessibilityRole}
              accessibilityLabel={accessibilityLabel}
              accessibilityHint={accessibilityHint}
              accessibilityState={{ disabled, selected, expanded, checked }}
            >
              {contentChildren}
            </TouchableOpacity>
          ) : (
            <View style={[styles.cardContent, { opacity: disabled ? 0.5 : 1 }]}>
              {contentChildren}
            </View>
          )
        ) : null}
        {actionSections}
      </View>
    );
  }

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
function CardHeader({ children, style }: ListCardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

/** 卡片标题行 */
function CardTitle({
  children,
  numberOfLines = 1,
}: ListCardTitleProps) {
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
}: ListCardSubtitleProps) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

/** 卡片元数据行（水平排列） */
function CardMeta({ children, style }: ListCardMetaProps) {
  return <View style={[styles.meta, style]}>{children}</View>;
}

/** 卡片元数据文本 */
function MetaText({ children, color }: ListCardMetaTextProps) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.metaText, { color: color ?? colors.textSecondary }]} numberOfLines={1}>
      {children}
    </Text>
  );
}

/** 卡片编号文本（常用于 header 左侧） */
function CardCode({ children, color }: ListCardCodeProps) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.code, { color: color ?? colors.primary }]} numberOfLines={1}>
      {children}
    </Text>
  );
}

function flattenFragments(children: React.ReactNode): React.ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement<{ children?: React.ReactNode }>(child) && child.type === Fragment) {
      return flattenFragments(child.props.children);
    }
    return [child];
  });
}

/** Compact, theme-aware action used in a ListCard action row. */
function CardAction({
  children,
  onPress,
  tone = 'neutral',
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ListCardActionProps) {
  const { colors } = useTheme();
  const textColor = {
    neutral: colors.textSecondary,
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.error,
  }[tone];

  return (
    <ActionButton
      variant="text"
      size="md"
      textColor={textColor}
      disabled={disabled}
      loading={loading}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={styles.actionButton}
      contentStyle={styles.actionButtonContent}
      onPress={(event) => {
        event.stopPropagation();
        onPress(event);
      }}
    >
      {children}
    </ActionButton>
  );
}

function isActionControl(child: React.ReactNode): boolean {
  if (!isValidElement(child)) return false;
  const props = child.props as {
    accessibilityRole?: unknown;
    disabled?: unknown;
    loading?: unknown;
    onPress?: unknown;
  };
  return (
    typeof props.onPress === 'function' ||
    props.accessibilityRole === 'button' ||
    typeof props.disabled === 'boolean' ||
    typeof props.loading === 'boolean'
  );
}

const warnedActionCounts = new Set<number>();

/** Bottom action row. Use up to three controls; overflow belongs in SwipeableRow. */
function CardActions({ children }: ListCardActionsProps) {
  const nodes = flattenFragments(children);
  const actionNodes = nodes.filter(isActionControl);
  const supportingNodes = nodes.filter((node) => !isActionControl(node));

  if (__DEV__ && actionNodes.length > 3 && !warnedActionCounts.has(actionNodes.length)) {
    warnedActionCounts.add(actionNodes.length);
    console.warn(
      `[Sunxu] ListCard.Actions has ${actionNodes.length} visible actions. Keep at most 3 and move overflow to SwipeableRow.rightActions.`,
    );
  }

  return (
    <View style={styles.actions}>
      {supportingNodes.length > 0 ? (
        <View style={styles.actionSupporting}>{supportingNodes}</View>
      ) : null}
      {actionNodes.length > 0 ? (
        <View style={styles.actionRow}>
          {actionNodes.map((child, index) => {
            const key = isValidElement(child) && child.key != null ? child.key : `action-${index}`;
            return (
              <Fragment key={key}>
                {index > 0 ? <Divider orientation="vertical" style={styles.actionDivider} /> : null}
                <View style={styles.actionCell}>{child}</View>
              </Fragment>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

// Attach sub-components
ListCard.Header = CardHeader;
ListCard.Title = CardTitle;
ListCard.Subtitle = CardSubtitle;
ListCard.Meta = CardMeta;
ListCard.MetaText = MetaText;
ListCard.Code = CardCode;
ListCard.Action = CardAction;
ListCard.Actions = CardActions;

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  cardContent: {
    gap: Spacing.xs,
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
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  actionSupporting: {
    gap: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  actionCell: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  actionButton: {
    width: '100%',
    borderWidth: 0,
  },
  actionButtonContent: {
    paddingHorizontal: Spacing.xs,
  },
  actionDivider: {
    marginVertical: Spacing.sm,
  },
});

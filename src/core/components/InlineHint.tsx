import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { FontSize, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText';

export interface InlineHintProps {
  /** 用于生成按钮的可访问名称，例如「填写说明」。 */
  label: string;
  /** 展开后显示的简短补充说明。重要规则应保持可见，不放入此控件。 */
  hint: string;
  style?: ViewStyle;
}

/** Compact, inline disclosure for short optional guidance. */
export function InlineHint({ label, hint, style }: InlineHintProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setExpanded((current) => !current)}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? '收起' : '查看'}${label}`}
        accessibilityState={{ expanded }}
      >
        <Ionicons name="help-circle-outline" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
      {expanded ? <Text style={[styles.message, { color: colors.textSecondary }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  trigger: {
    width: 28,
    height: 28,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    minWidth: 0,
    marginTop: 4,
    fontSize: FontSize.xs,
    lineHeight: 20,
  },
});

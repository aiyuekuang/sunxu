import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../../core/components/AppText.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../../core/theme/tokens';
import { useTheme } from '../../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileActionsMenuProps {
  /** 是否显示计件工资入口 */
  showPiecework: boolean;
  /** 点击计件工资 */
  onPiecework: () => void;
  /** 点击修改密码 */
  onChangePassword: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileActionsMenu({
  showPiecework,
  onPiecework,
  onChangePassword,
}: ProfileActionsMenuProps) {
  const { colors } = useTheme();

  const separatorStyle = {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderRow,
  };

  return (
    <View style={[styles.menuGroup, { backgroundColor: colors.surface }]}>
      {showPiecework && (
        <TouchableOpacity
          style={[styles.menuItem, separatorStyle]}
          onPress={onPiecework}
          activeOpacity={0.7}
        >
          <Ionicons name="cash-outline" size={20} color={colors.success} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>计件工资</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.menuItem, separatorStyle]}
        onPress={onChangePassword}
        activeOpacity={0.7}
      >
        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
        <Text style={[styles.menuLabel, { color: colors.text }]}>修改密码</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  menuGroup: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.base,
  },
});

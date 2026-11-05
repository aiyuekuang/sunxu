import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomActionBar } from '../../../../core/components/BottomActionBar.tsx';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanPrimaryAction {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
}

interface PlanActionBarProps {
  action: PlanPrimaryAction | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlanActionBar({ action }: PlanActionBarProps) {
  const { colors } = useTheme();

  if (!action) return null;

  return (
    <BottomActionBar style={styles.footer}>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: action.color }]}
        onPress={action.onPress}
      >
        <Ionicons
          name={action.icon}
          size={16}
          color={colors.textOnPrimary}
          style={styles.btnIcon}
        />
        <Text style={[styles.actionBtnText, { color: colors.textOnPrimary }]}>{action.label}</Text>
      </TouchableOpacity>
    </BottomActionBar>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  actionBtn: {
    minHeight: MIN_TOUCH_TARGET,
    width: '100%',
    maxWidth: 340,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
  btnIcon: { marginRight: 4 },
});

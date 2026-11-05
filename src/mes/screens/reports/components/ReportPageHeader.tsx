import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, MIN_TOUCH_TARGET, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface ReportPageHeaderProps {
  title: string;
  amountVisible?: boolean;
  showAmountToggle?: boolean;
  onToggleAmount?: () => void;
}

export function ReportPageHeader({
  title,
  amountVisible = false,
  showAmountToggle = false,
  onToggleAmount,
}: ReportPageHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const canToggleAmount = showAmountToggle && Boolean(onToggleAmount);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: insets.top + Spacing.md,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {canToggleAmount ? (
        <TouchableOpacity
          style={styles.amountButton}
          onPress={onToggleAmount}
          accessibilityRole="button"
          accessibilityLabel={amountVisible ? '隐藏金额' : '显示金额'}
          accessibilityState={{ selected: amountVisible }}
        >
          <Ionicons
            name={amountVisible ? 'eye' : 'eye-off'}
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: FontSize.lg, fontWeight: '700' },
  amountButton: {
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

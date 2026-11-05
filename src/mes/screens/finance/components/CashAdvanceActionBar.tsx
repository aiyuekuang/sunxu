import { StyleSheet, TouchableOpacity } from 'react-native';
import type { CashAdvance } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomActionBar } from '../../../../core/components/BottomActionBar.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { hasFinanceAction } from '../../../constants/finance-action-policy';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface CashAdvanceActionBarProps {
  advance: CashAdvance;
  canSubmit: boolean;
  canWithdraw: boolean;
  canCancel: boolean;
  canApprove: boolean;
  canReject: boolean;
  canMore: boolean;
  running: boolean;
  onSubmit: () => void;
  onWithdraw: () => void;
  onCancel: () => void;
  onApprove: () => void;
  onReject: () => void;
  onMore: () => void;
}

export function CashAdvanceActionBar({
  advance,
  canSubmit,
  canWithdraw,
  canCancel,
  canApprove,
  canReject,
  canMore,
  running,
  onSubmit,
  onWithdraw,
  onCancel,
  onApprove,
  onReject,
  onMore,
}: CashAdvanceActionBarProps) {
  const { colors } = useTheme();
  const actions: Array<{
    key: string;
    label: string;
    variant: 'primary' | 'warning' | 'error';
    onPress: () => void;
  }> = [];

  if (canSubmit && hasFinanceAction(advance, 'submit', ['draft'])) {
    actions.push({ key: 'submit', label: '提交申请', variant: 'primary', onPress: onSubmit });
  }
  if (canWithdraw && hasFinanceAction(advance, 'withdraw', ['submitted'])) {
    actions.push({ key: 'withdraw', label: '撤回', variant: 'warning', onPress: onWithdraw });
  }
  if (canCancel && hasFinanceAction(advance, 'cancel', ['draft', 'submitted', 'approved'])) {
    actions.push({ key: 'cancel', label: '取消', variant: 'error', onPress: onCancel });
  }
  if (canApprove && hasFinanceAction(advance, 'approve', ['submitted'])) {
    actions.push({ key: 'approve', label: '审批通过', variant: 'primary', onPress: onApprove });
  }
  if (canReject && hasFinanceAction(advance, 'reject', ['submitted'])) {
    actions.push({ key: 'reject', label: '驳回', variant: 'error', onPress: onReject });
  }
  if (canMore) {
    actions.push({ key: 'more', label: '更多', variant: 'warning', onPress: onMore });
  }

  if (actions.length === 0) return null;

  const variantStyle = {
    primary: { backgroundColor: colors.primary, color: colors.textOnPrimary },
    warning: { backgroundColor: colors.warning, color: colors.textOnPrimary },
    error: { backgroundColor: colors.error, color: colors.textOnPrimary },
  };

  return (
    <BottomActionBar style={styles.container}>
      {actions.map((action) => {
        const visual = variantStyle[action.variant];
        return (
          <TouchableOpacity
            key={action.key}
            style={[styles.button, { backgroundColor: visual.backgroundColor }]}
            onPress={action.onPress}
            disabled={running}
            activeOpacity={0.75}
          >
            {running ? (
              <InlineLoading color={visual.color} />
            ) : (
              <Text style={[styles.buttonText, { color: visual.color }]}>{action.label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </BottomActionBar>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
  },
  buttonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});

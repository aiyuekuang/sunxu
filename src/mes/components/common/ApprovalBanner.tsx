import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import type { ApprovalState } from '../../host/hooks/useApprovalStatus';
import { useTheme } from '../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApprovalBannerProps {
  /** useApprovalStatus 返回的状态对象 */
  approval: ApprovalState;
  /** 点击横幅时回调（可用于滚动到时间线位置） */
  onPress?: () => void;
  /** 是否允许重新审批，默认 true。业务状态已推进时应传 false */
  allowReset?: boolean;
  /** 是否允许撤回审批，默认 false。仅在 submitted 状态下由提交人撤回 */
  allowRecall?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ApprovalBanner({
  approval,
  onPress,
  allowReset = true,
  allowRecall = false,
}: ApprovalBannerProps) {
  const { colors } = useTheme();

  if (approval.loading || !approval.isConfigured) return null;

  const config = getBannerConfig(approval, colors);

  return (
    <Pressable
      style={[styles.container, { backgroundColor: config.bg }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.row}>
        <Ionicons
          name={config.icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color={config.color}
        />
        <Text style={[styles.title, { color: config.color }]} numberOfLines={1}>
          {config.title}
        </Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={14} color={config.color} style={styles.chevron} />
        )}
      </View>
      {config.subtitle && (
        <Text style={[styles.subtitle, { color: config.subtitleColor }]} numberOfLines={1}>
          {config.subtitle}
        </Text>
      )}
      {/* 已通过/已驳回 + 有权限 → 重新审批按钮 */}
      {allowReset &&
        (approval.status === 'approved' || approval.status === 'rejected') &&
        approval.canHandle && (
          <TouchableOpacity
            style={[styles.resetBtn, { borderColor: `${config.color}40` }]}
            onPress={approval.reset}
          >
            <Ionicons name="refresh-outline" size={13} color={config.color} />
            <Text style={[styles.resetText, { color: config.color }]}>重新审批</Text>
          </TouchableOpacity>
        )}
      {/* 待审批 + 允许撤回 → 撤回按钮 */}
      {allowRecall && approval.status === 'pending_approval' && approval.canRecall && (
        <TouchableOpacity
          style={[styles.resetBtn, { borderColor: `${config.color}40` }]}
          onPress={approval.recall}
        >
          <Ionicons name="arrow-undo-outline" size={13} color={config.color} />
          <Text style={[styles.resetText, { color: config.color }]}>撤回审批</Text>
        </TouchableOpacity>
      )}
    </Pressable>
  );
}

// ─── Banner Config ────────────────────────────────────────────────────────────

interface BannerConfig {
  icon: string;
  title: string;
  subtitle: string | null;
  color: string;
  subtitleColor: string;
  bg: string;
}

function getBannerConfig(approval: ApprovalState, colors: Record<string, string>): BannerConfig {
  const { status, currentStep, totalSteps, currentStepLabel, currentAssigneeName } = approval;

  if (status === 'none') {
    if (approval.needsSubmission) {
      return {
        icon: 'time-outline',
        title: `待提交审批 · 共${totalSteps}步`,
        subtitle: '当前单据已配置审批流程，提交后才会进入审批',
        color: colors.textSecondary,
        subtitleColor: colors.textMuted,
        bg: colors.surfaceSecondary,
      };
    }
    return {
      icon: 'time-outline',
      title: `审批已配置 · 共${totalSteps}步`,
      subtitle: '当前单据已配置审批流程，但你没有提交权限',
      color: colors.textSecondary,
      subtitleColor: colors.textMuted,
      bg: colors.surfaceSecondary,
    };
  }

  if (status === 'pending_approval') {
    if (approval.isPendingMyAction) {
      return {
        icon: 'time-outline',
        title: `待你审批 · 第${currentStep}步 ${currentStepLabel}（共${totalSteps}步）`,
        subtitle: currentAssigneeName ? `审批人：${currentAssigneeName}（就是你）` : null,
        color: colors.warning,
        subtitleColor: colors.textSecondary,
        bg: colors.warningLight,
      };
    }
    return {
      icon: 'time-outline',
      title: `审批中 · 等待${currentStepLabel || '审批'}（${currentStep}/${totalSteps}步）`,
      subtitle: currentAssigneeName ? `当前审批人：${currentAssigneeName}` : null,
      color: colors.textSecondary,
      subtitleColor: colors.textMuted,
      bg: colors.surfaceSecondary,
    };
  }

  if (status === 'approved') {
    return {
      icon: 'checkmark-circle-outline',
      title: '审批已通过',
      subtitle: null,
      color: colors.success,
      subtitleColor: colors.textSecondary,
      bg: colors.successLight,
    };
  }

  if (status === 'rejected') {
    const rejectedStep = approval.steps.find((s) => s.status === 'rejected');
    const stepInfo = rejectedStep ? ` · 第${rejectedStep.step}步 ${rejectedStep.label}` : '';
    return {
      icon: 'close-circle-outline',
      title: `审批已驳回${stepInfo}`,
      subtitle: approval.rejectionReason ? `原因："${approval.rejectionReason}"` : null,
      color: colors.error,
      subtitleColor: colors.error,
      bg: colors.errorLight,
    };
  }

  if (status === 'cancelled') {
    return {
      icon: 'close-circle-outline',
      title: '审批已终止',
      subtitle: '当前单据已取消，审批流程已同步结束',
      color: colors.textMuted,
      subtitleColor: colors.textSecondary,
      bg: colors.surfaceSecondary,
    };
  }

  // isConfigured 已过滤未配置场景
  return {
    icon: 'information-circle-outline',
    title: '',
    subtitle: null,
    color: colors.textMuted,
    subtitleColor: colors.textMuted,
    bg: colors.surfaceSecondary,
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    opacity: 0.6,
  },
  subtitle: {
    fontSize: FontSize.xs,
    marginLeft: 22, // icon(18) + gap(4)
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    marginLeft: 22,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  resetText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
});

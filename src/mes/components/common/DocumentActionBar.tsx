import { StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { ApprovalActionBar, ApprovalLockedBar } from './ApprovalActionBar.tsx';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { BottomActionBar } from '../../../core/components/BottomActionBar.tsx';
import { InlineLoading } from '../../../core/components/LoadingView.tsx';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import type { ApprovalState } from '../../host/hooks/useApprovalStatus';
import type { ActionButtonDef } from '../../host/hooks/useDocumentActions';
import { useTheme } from '../../../core/theme/useTheme';
import { toast } from '../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentActionBarProps {
  /** 审批状态 */
  approval: ApprovalState;
  /** 操作 handler 字典 */
  handlers: Record<string, () => void>;
  /** 操作可见性字典（有权限且当前可执行才 true） */
  visibility: Record<string, boolean>;
  /** 操作可用性字典（有权限且当前可执行才 true），不传则按 visibility 处理 */
  enabled?: Record<string, boolean>;
  /** 操作禁用原因字典 */
  reasons?: Record<string, string>;
  /** 按钮 UI 配置 */
  buttons: Record<string, ActionButtonDef>;
  /** 是否正在执行操作 */
  actionLoading?: boolean;
  /** 是否需要提交审批 */
  needsSubmission?: boolean;
  /** 提交审批 handler */
  onSubmitApproval?: () => void;
  /** 容器样式覆盖 */
  style?: StyleProp<ViewStyle>;
}

// ─── 颜色映射 ─────────────────────────────────────────────────────────────────

type Variant = ActionButtonDef['variant'];

function useVariantColors() {
  const { colors } = useTheme();
  return {
    primary: { bg: colors.primary, text: colors.textOnPrimary },
    success: { bg: colors.success, text: colors.textOnPrimary },
    warning: { bg: colors.warning, text: colors.textOnPrimary },
    error: { bg: colors.error, text: colors.textOnPrimary },
    muted: { bg: colors.surfaceSecondary, text: colors.textSecondary },
  } satisfies Record<Variant, { bg: string; text: string }>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DocumentActionBar({
  approval,
  handlers,
  visibility,
  enabled,
  reasons,
  buttons,
  actionLoading = false,
  needsSubmission = false,
  onSubmitApproval,
  style,
}: DocumentActionBarProps) {
  const { colors } = useTheme();
  const variantColors = useVariantColors();

  // ─── 审批加载中 → 不显示（防止业务按钮闪烁） ──────────────────────────────

  if (approval.loading) return null;

  // ─── 审批三段式优先 ─────────────────────────────────────────────────────────

  // 1. 轮到当前用户审批 → 通过/驳回按钮
  if (approval.isPendingMyAction) {
    return <ApprovalActionBar approval={approval} />;
  }

  // 2. 等待他人审批 → 锁定提示栏
  if (approval.isPending) {
    return (
      <ApprovalLockedBar
        assigneeName={approval.currentAssigneeName}
        currentStep={approval.currentStep}
        totalSteps={approval.totalSteps}
      />
    );
  }

  // 3. 审批被驳回/已通过且当前用户可操作 → 重审/确认审批栏
  if ((approval.status === 'rejected' || approval.status === 'approved') && approval.canHandle) {
    return <ApprovalActionBar approval={approval} />;
  }

  // ─── 收集可见的按钮 ─────────────────────────────────────────────────────────

  const visibleButtons: Array<{
    key: string;
    def: ActionButtonDef;
    onPress: () => void;
    disabled?: boolean;
    reason?: string;
  }> = [];

  // 提交审批按钮
  if (needsSubmission && onSubmitApproval) {
    visibleButtons.push({
      key: '__submitApproval',
      def: { label: '提交审批', variant: 'warning' },
      onPress: onSubmitApproval,
    });
  }

  // 业务按钮：默认只渲染当前真正可执行的动作
  for (const [key, def] of Object.entries(buttons)) {
    if (visibility[key]) {
      const isEnabled = enabled ? enabled[key] !== false : true;
      const reason = !isEnabled ? (reasons?.[key] ?? '当前条件未满足，暂不可执行') : undefined;
      visibleButtons.push({ key, def, onPress: handlers[key], disabled: !isEnabled, reason });
    }
  }

  if (visibleButtons.length === 0) return null;

  // ─── 渲染 ──────────────────────────────────────────────────────────────────

  return (
    <BottomActionBar style={[styles.container, style]}>
      {visibleButtons.map(({ key, def, onPress, disabled, reason }) => {
        const vc = variantColors[def.variant];
        const handlePress = () => {
          if (disabled) {
            toast.info(reason ?? '当前条件未满足，暂不可执行');
            return;
          }
          onPress();
        };
        const isUnavailable = Boolean(disabled);
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.btn,
              { backgroundColor: isUnavailable ? colors.surfaceSecondary : vc.bg },
              isUnavailable && { borderColor: colors.border },
              isUnavailable && styles.btnDisabled,
            ]}
            onPress={handlePress}
            disabled={actionLoading}
            accessibilityRole="button"
            accessibilityState={{ disabled: isUnavailable || actionLoading }}
            accessibilityHint={isUnavailable ? reason : undefined}
            activeOpacity={0.7}
          >
            {actionLoading ? (
              <InlineLoading />
            ) : (
              <Text style={[styles.btnText, { color: isUnavailable ? colors.textMuted : vc.text }]}>
                {isUnavailable ? `${def.label}（暂不可用）` : def.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </BottomActionBar>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  btnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  btnDisabled: {
    borderWidth: 1,
  },
});

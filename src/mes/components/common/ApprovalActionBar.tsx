import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { BottomActionBar } from '../../../core/components/BottomActionBar.tsx';
import { BottomSheet } from '../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../core/components/FormField.tsx';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import type { ApprovalState } from '../../host/hooks/useApprovalStatus';
import { useTheme } from '../../../core/theme/useTheme';
import { toast } from '../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApprovalActionBarProps {
  /** useApprovalStatus 返回的状态对象 */
  approval: ApprovalState;
}

/** 当待审批但不是当前用户时显示的锁定栏 */
export interface ApprovalLockedBarProps {
  /** 当前审批人名 */
  assigneeName: string;
  /** 当前步骤 / 总步骤 */
  currentStep: number;
  totalSteps: number;
}

// ─── ApprovalActionBar（通过 / 驳回 / 重新审批）───────────────────────────────

export function ApprovalActionBar({ approval }: ApprovalActionBarProps) {
  const { colors } = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [action, setAction] = useState<'approved' | 'rejected'>('approved');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenSheet = (act: 'approved' | 'rejected') => {
    setAction(act);
    setComment('');
    setSheetVisible(true);
  };

  const handleSubmit = async () => {
    if (action === 'rejected' && !comment.trim()) {
      toast.error('请输入驳回原因');
      return;
    }
    setSubmitting(true);
    try {
      if (action === 'approved') {
        await approval.approve(comment || undefined);
      } else {
        await approval.reject(comment);
      }
      setSheetVisible(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!approval.hasApproval) return null;

  // 待审批 + 轮到我 → 通过/驳回按钮
  if (approval.isPendingMyAction) {
    return (
      <BottomActionBar style={styles.bar}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.success }]}
          onPress={() => handleOpenSheet('approved')}
        >
          <Ionicons name="checkmark" size={16} color={colors.textOnPrimary} />
          <Text style={[styles.btnText, { color: colors.textOnPrimary }]}>通过</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.error }]}
          onPress={() => handleOpenSheet('rejected')}
        >
          <Ionicons name="close" size={16} color={colors.textOnPrimary} />
          <Text style={[styles.btnText, { color: colors.textOnPrimary }]}>驳回</Text>
        </TouchableOpacity>

        <BottomSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          title={action === 'approved' ? '审批通过' : '驳回'}
          confirmText="确认"
          cancelText="取消"
          confirmButtonColor={action === 'approved' ? colors.success : colors.error}
          onConfirm={handleSubmit}
          loading={submitting}
          avoidKeyboard
        >
          <FormField
            label={action === 'rejected' ? '驳回原因' : '审批意见'}
            value={comment}
            onChangeText={setComment}
            placeholder={action === 'rejected' ? '请输入驳回原因（必填）' : '审批意见（可选）'}
            multiline
            numberOfLines={3}
          />
        </BottomSheet>
      </BottomActionBar>
    );
  }

  // 已驳回 / 已通过 + 有操作权限 → 重新审批按钮
  if ((approval.status === 'rejected' || approval.status === 'approved') && approval.canHandle) {
    return (
      <BottomActionBar style={styles.bar}>
        <TouchableOpacity
          style={[styles.resetBtn, { borderColor: colors.border }]}
          onPress={approval.reset}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>重新审批</Text>
        </TouchableOpacity>
      </BottomActionBar>
    );
  }

  return null;
}

// ─── ApprovalLockedBar（等待他人审批）─────────────────────────────────────────

export function ApprovalLockedBar({
  assigneeName,
  currentStep,
  totalSteps,
}: ApprovalLockedBarProps) {
  const { colors } = useTheme();

  return (
    <BottomActionBar
      style={[styles.bar, styles.lockedBar]}
      backgroundColor={colors.surfaceSecondary}
    >
      <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
      <View style={styles.lockedContent}>
        <Text style={[styles.lockedTitle, { color: colors.textSecondary }]}>
          等待审批通过后可操作
        </Text>
        <Text style={[styles.lockedSubtitle, { color: colors.textMuted }]}>
          当前审批人：{assigneeName || '未指定'}（第{currentStep}/{totalSteps}步）
        </Text>
      </View>
    </BottomActionBar>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  btnText: { fontSize: FontSize.base, fontWeight: '600' },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  resetBtnText: { fontSize: FontSize.sm, fontWeight: '500' },
  lockedBar: {
    gap: Spacing.sm,
  },
  lockedContent: { flex: 1, gap: 1 },
  lockedTitle: { fontSize: FontSize.sm, fontWeight: '500' },
  lockedSubtitle: { fontSize: FontSize.xs },
});

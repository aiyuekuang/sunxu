import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { MaterialIssueOrder } from '../../../types/models/MaterialIssueOrder';
import { materialIssueService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

interface MaterialIssueReverseSheetProps {
  issue: MaterialIssueOrder | null;
  mode?: 'reverse' | 'reverseAudit';
  onClose: () => void;
  onSuccess: () => void;
}

export function MaterialIssueReverseSheet({
  issue,
  mode = 'reverse',
  onClose,
  onSuccess,
}: MaterialIssueReverseSheetProps) {
  const { colors } = useTheme();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const issueId = issue?.id;

  useEffect(() => {
    if (issueId) setReason('');
  }, [issueId]);

  const handleSubmit = useCallback(async () => {
    if (!issue) return;
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.info('请填写冲正原因');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'reverseAudit') {
        await materialIssueService.reverseAuditIssue({ id: issue.id, reason: trimmed });
        toast.success('生产领料单已反审核，可修改数量后重新确认发料');
      } else {
        await materialIssueService.reverseIssue({ id: issue.id, reason: trimmed });
        toast.success('生产领料单已冲正，库存已回补');
      }
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : mode === 'reverseAudit'
            ? '反审核失败'
            : '冲正失败',
      );
    } finally {
      setSubmitting(false);
    }
  }, [issue, mode, onSuccess, reason]);

  return (
    <BottomSheet
      visible={!!issue}
      onClose={onClose}
      title={mode === 'reverseAudit' ? '反审核生产领料' : '冲正生产领料'}
      subtitle={issue?.issueNo}
      confirmText={mode === 'reverseAudit' ? '确认反审核' : '确认冲正'}
      confirmButtonColor={colors.warning}
      onConfirm={handleSubmit}
      loading={submitting}
      closeDisabled={submitting}
      avoidKeyboard
      dynamicHeight
    >
      {issue ? (
        <>
          <View style={[styles.warningCard, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.warningTitle, { color: colors.text }]}>整单回补库存</Text>
            <Text style={[styles.warningText, { color: colors.textSecondary }]}>
              {mode === 'reverseAudit'
                ? '系统会回补本次发料库存，单据恢复为草稿；随后可修改实发数量并重新确认发料。已经发生部分退料的单据不能反审核。'
                : '原领料记录不会删除，单据会变为“已冲正”。已经发生部分退料的单据不能整单冲正。'}
            </Text>
          </View>
          <FormField
            label={mode === 'reverseAudit' ? '反审核原因' : '冲正原因'}
            required
            value={reason}
            onChangeText={setReason}
            placeholder={mode === 'reverseAudit' ? '请输入反审核原因' : '请填写业务原因'}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
        </>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  warningCard: {
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: 4,
  },
  warningTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  warningText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});

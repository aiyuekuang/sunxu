import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { qualityService } from '../../../host/services';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { Spacing } from '../../../../core/theme/tokens';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CancelAmendModalProps {
  /** 质检单 ID */
  inspectionId: string;
  /** 质检单号（用于提示文案） */
  inspectionNo: string;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CancelAmendModal({
  inspectionId,
  inspectionNo,
  onClose,
  onSuccess,
}: CancelAmendModalProps) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      toast.error('请填写取消修正原因');
      return;
    }
    setSaving(true);
    try {
      await qualityService.cancelAndAmend({ id: inspectionId, reason: reason.trim() });
      toast.success('已取消并创建修正单');
      onSuccess();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet
      visible
      onClose={onClose}
      title={`取消并修正 ${inspectionNo}`}
      confirmText="确认取消并修正"
      onConfirm={handleConfirm}
      loading={saving}
      confirmButtonColor={undefined}
      avoidKeyboard
    >
      <FormField
        label="取消修正原因"
        required
        value={reason}
        onChangeText={setReason}
        placeholder="请输入取消并修正的原因"
        multiline
        style={styles.reasonInput}
      />
    </BottomSheet>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  reasonInput: {
    minHeight: 80,
    marginTop: Spacing.sm,
  },
});

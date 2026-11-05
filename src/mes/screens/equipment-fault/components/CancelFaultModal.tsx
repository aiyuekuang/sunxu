import { useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CancelFaultModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Close callback */
  onClose: () => void;
  /** Submit callback with optional cancel reason */
  onSubmit: (reason: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CancelFaultModal({ visible, onClose, onSubmit }: CancelFaultModalProps) {
  const { colors } = useTheme();
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSubmit(reason.trim());
    setReason('');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="取消故障单"
      confirmText="确认取消"
      cancelText="返回"
      confirmButtonColor={colors.error}
      onConfirm={handleSubmit}
      avoidKeyboard
      dynamicHeight
    >
      <FormField
        label="取消原因（选填）"
        value={reason}
        onChangeText={setReason}
        placeholder="请输入取消原因..."
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </BottomSheet>
  );
}

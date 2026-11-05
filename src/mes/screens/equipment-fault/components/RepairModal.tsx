import { useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RepairModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Close callback */
  onClose: () => void;
  /** Submit callback with repair action and optional root cause */
  onSubmit: (repairAction: string, rootCause: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RepairModal({ visible, onClose, onSubmit }: RepairModalProps) {
  const { colors } = useTheme();
  const [repairAction, setRepairAction] = useState('');
  const [rootCause, setRootCause] = useState('');

  const handleSubmit = () => {
    if (!repairAction.trim()) {
      toast.info('请填写维修措施');
      return;
    }
    onSubmit(repairAction.trim(), rootCause.trim());
    setRepairAction('');
    setRootCause('');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="完成维修"
      confirmText="确认修复"
      cancelText="取消"
      confirmButtonColor={colors.success}
      onConfirm={handleSubmit}
      avoidKeyboard
      dynamicHeight
    >
      <FormField
        label="维修措施"
        required
        value={repairAction}
        onChangeText={setRepairAction}
        placeholder="请描述具体维修措施..."
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <FormField
        label="根本原因（选填）"
        value={rootCause}
        onChangeText={setRootCause}
        placeholder="请分析故障根本原因..."
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </BottomSheet>
  );
}

import { useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VerifyModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Whether this is a pass or reject verification */
  passed: boolean;
  /** Close callback */
  onClose: () => void;
  /** Submit callback with verification result text */
  onSubmit: (result: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VerifyModal({ visible, passed, onClose, onSubmit }: VerifyModalProps) {
  const { colors } = useTheme();
  const [result, setResult] = useState('');

  const handleSubmit = () => {
    if (!result.trim()) {
      toast.info(passed ? '请填写验收结论' : '请填写返修原因');
      return;
    }
    onSubmit(result.trim());
    setResult('');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={passed ? '验收通过' : '打回重修'}
      confirmText={passed ? '确认通过' : '打回重修'}
      cancelText="取消"
      confirmButtonColor={passed ? colors.success : colors.error}
      onConfirm={handleSubmit}
      avoidKeyboard
      dynamicHeight
    >
      <FormField
        label={passed ? '验收结论' : '返修原因'}
        required
        value={result}
        onChangeText={setResult}
        placeholder={passed ? '请填写验收结论...' : '请填写返修原因...'}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </BottomSheet>
  );
}

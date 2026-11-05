import { useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

export interface ReopenModalProps {
  visible: boolean;
  orderNo: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function ReopenModal({ visible, orderNo, onClose, onSubmit }: ReopenModalProps) {
  const { colors } = useTheme();
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.info('请输入撤销完工原因');
      return;
    }
    onSubmit(trimmed);
    setReason('');
  };

  const handleClose = () => {
    onClose();
    setReason('');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={`撤销完工：${orderNo}`}
      confirmText="确认撤销"
      confirmButtonColor={colors.warning}
      onConfirm={handleSubmit}
      avoidKeyboard
      dynamicHeight
    >
      <FormField
        label="撤销完工原因"
        required
        value={reason}
        onChangeText={setReason}
        placeholder="请输入撤销完工原因"
        multiline
        numberOfLines={3}
      />
    </BottomSheet>
  );
}

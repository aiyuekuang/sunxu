import { useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

export interface StockCountCancelModalProps {
  visible: boolean;
  countNo: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function StockCountCancelModal({
  visible,
  countNo,
  onClose,
  onSubmit,
}: StockCountCancelModalProps) {
  const { colors } = useTheme();
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.info('请输入取消原因');
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
      title={`取消盘点：${countNo}`}
      confirmText="确认取消"
      confirmButtonColor={colors.error}
      onConfirm={handleSubmit}
      avoidKeyboard
      dynamicHeight
    >
      <FormField
        label="取消原因"
        required
        value={reason}
        onChangeText={setReason}
        placeholder="请输入取消原因"
        multiline
        numberOfLines={3}
      />
    </BottomSheet>
  );
}

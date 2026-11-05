import { useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

type Props = {
  visible: boolean;
  prNo: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

export function PurchaseRequisitionReverseAuditModal({ visible, prNo, onClose, onSubmit }: Props) {
  const { colors } = useTheme();
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.info('请输入反审核原因');
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
      title={`反审核采购申请：${prNo}`}
      confirmText="确认反审核"
      confirmButtonColor={colors.error}
      onConfirm={handleSubmit}
      avoidKeyboard
      dynamicHeight
    >
      <FormField
        label="反审核原因"
        required
        value={reason}
        onChangeText={setReason}
        placeholder="请输入反审核原因"
        multiline
        numberOfLines={3}
      />
    </BottomSheet>
  );
}

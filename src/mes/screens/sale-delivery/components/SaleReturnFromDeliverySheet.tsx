import { useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { useDict } from '../../../host/hooks/useDict';
import { toast } from '../../../../core/toast';

interface SaleReturnFromDeliverySheetProps {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reasonCode: string) => void;
}

export function SaleReturnFromDeliverySheet({
  visible,
  loading = false,
  onClose,
  onSubmit,
}: SaleReturnFromDeliverySheetProps) {
  const [reasonCode, setReasonCode] = useState('');
  const { options: reasonOptions } = useDict('sale_return_reason');

  const handleSubmit = () => {
    if (!reasonCode) {
      toast.info('请选择退货原因');
      return;
    }
    onSubmit(reasonCode);
    setReasonCode('');
  };

  const handleClose = () => {
    setReasonCode('');
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="发起销售退货"
      subtitle="创建退货草稿前请先选择真实的退货原因。"
      confirmText="创建草稿"
      onConfirm={handleSubmit}
      loading={loading}
      disabled={loading}
      dynamicHeight
    >
      <PickerField
        label="退货原因"
        required
        value={reasonCode}
        options={reasonOptions}
        onChange={setReasonCode}
        placeholder="请选择退货原因"
      />
    </BottomSheet>
  );
}

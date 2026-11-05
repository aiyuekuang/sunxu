import { useState } from 'react';
import type { WorkOrderOperation } from '../../../host/services';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

export interface RevokeModalProps {
  visible: boolean;
  op: WorkOrderOperation | null;
  onClose: () => void;
  onSubmit: (
    revokeCompletedQty: number,
    revokeScrapQty: number,
    remark: string,
    operationId: string,
  ) => void;
}

export function RevokeModal({ visible, op, onClose, onSubmit }: RevokeModalProps) {
  const { colors } = useTheme();
  const [revokeCompletedQty, setRevokeCompletedQty] = useState('');
  const [revokeScrapQty, setRevokeScrapQty] = useState('0');
  const [remark, setRemark] = useState('');

  const handleSubmit = () => {
    const qty = parseFloat(revokeCompletedQty);
    if (Number.isNaN(qty) || qty <= 0) {
      toast.info('请输入有效的冲正良品数量');
      return;
    }
    if (!op) return;
    onSubmit(qty, parseFloat(revokeScrapQty) || 0, remark, op.id);
    setRevokeCompletedQty('');
    setRevokeScrapQty('0');
    setRemark('');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`报工冲正：${op?.operationName}`}
      confirmText="确认冲正"
      confirmButtonColor={colors.warning}
      onConfirm={handleSubmit}
      avoidKeyboard
      dynamicHeight
    >
      <QuickNumInput
        label={`冲正良品数量（已报良品 ${op ? Number(op.completedQty) : 0}）`}
        value={revokeCompletedQty}
        onChangeText={setRevokeCompletedQty}
        max={op ? Number(op.completedQty) : 0}
        placeholder="请输入冲正良品数量"
      />
      <QuickNumInput
        label="冲正报废数量"
        value={revokeScrapQty}
        onChangeText={setRevokeScrapQty}
        max={op ? Number(op.scrappedQty) : 0}
        quickButtons={[
          { label: '0', value: 'min' },
          { label: '+1', value: 1 },
        ]}
        placeholder="0"
      />
      <FormField
        label="备注"
        value={remark}
        onChangeText={setRemark}
        placeholder="冲正原因"
        multiline
        numberOfLines={3}
      />
    </BottomSheet>
  );
}

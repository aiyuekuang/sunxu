import { useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { toast } from '../../../../core/toast';

export interface SplitModalProps {
  visible: boolean;
  maxQty: number;
  allowFullSplit: boolean;
  unit: string;
  onClose: () => void;
  onSubmit: (splitQty: number, description: string) => void;
}

export function SplitModal({
  visible,
  maxQty,
  allowFullSplit,
  unit,
  onClose,
  onSubmit,
}: SplitModalProps) {
  const [splitQty, setSplitQty] = useState('');
  const [description, setDescription] = useState('');
  const maxAllowedQty = allowFullSplit ? maxQty : maxQty - 1;

  const handleSubmit = () => {
    const qty = parseFloat(splitQty);
    if (Number.isNaN(qty) || qty <= 0) {
      toast.info('请输入有效的拆分数量');
      return;
    }
    const exceedsLimit = allowFullSplit ? qty > maxQty : qty >= maxQty;
    if (exceedsLimit) {
      toast.info(
        allowFullSplit
          ? `拆分数量不能大于剩余可用数量 ${maxQty}`
          : `拆分数量必须小于剩余可用数量 ${maxQty}`,
      );
      return;
    }
    onSubmit(qty, description);
    setSplitQty('');
    setDescription('');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="拆分工单"
      confirmText="确认拆分"
      onConfirm={handleSubmit}
      avoidKeyboard
      dynamicHeight
    >
      <QuickNumInput
        label="拆分数量"
        value={splitQty}
        onChangeText={setSplitQty}
        max={maxAllowedQty}
        min={1}
        hint={`可用 ${maxQty} ${unit}`}
        placeholder={`最大 ${maxAllowedQty}`}
        unit={unit}
      />
      <FormField
        label="备注"
        value={description}
        onChangeText={setDescription}
        placeholder="可选备注"
        multiline
        numberOfLines={3}
      />
    </BottomSheet>
  );
}

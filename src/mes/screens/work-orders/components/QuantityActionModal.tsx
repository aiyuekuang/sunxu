import { useEffect, useMemo, useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { formatNumber } from '../../../../core/utils/format';
import { toast } from '../../../../core/toast';

export type QuantityActionType = 'edit' | 'append' | 'supplement';

interface QuantityActionModalProps {
  visible: boolean;
  actionType: QuantityActionType | null;
  orderNo: string;
  plannedQty: number;
  unit: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    actionType: QuantityActionType,
    quantity: number,
    reason: string,
  ) => void | Promise<void>;
}

const ACTION_META: Record<
  QuantityActionType,
  { title: string; quantityLabel: string; hint: string; confirmText: string }
> = {
  edit: {
    title: '改工单数量',
    quantityLabel: '目标投产数量',
    hint: '已发生报工、入库或质检事实时，目标数量不能低于事实底线。',
    confirmText: '预检改数量',
  },
  append: {
    title: '追加投产',
    quantityLabel: '本次追加数量',
    hint: '追加只增加当前工单投产数量，不静默改历史报工、库存或排产。',
    confirmText: '预检追加',
  },
  supplement: {
    title: '补加工单',
    quantityLabel: '补产数量',
    hint: '完工、结案，或当前单没有未完成工序可承接追加时创建关联补加工单，原工单不重新打开。',
    confirmText: '预检补产',
  },
};

export function QuantityActionModal({
  visible,
  actionType,
  orderNo,
  plannedQty,
  unit,
  loading = false,
  onClose,
  onSubmit,
}: QuantityActionModalProps) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const meta = actionType ? ACTION_META[actionType] : ACTION_META.edit;
  const title = `${meta.title}：${orderNo}`;

  useEffect(() => {
    if (!visible || !actionType) return;
    setQuantity(actionType === 'edit' ? String(plannedQty) : '');
    setReason('');
  }, [visible, actionType, plannedQty]);

  const quickButtons = useMemo(
    () =>
      actionType === 'edit'
        ? [
            { label: '+1', value: 1 },
            { label: '+10', value: 10 },
          ]
        : [
            { label: '+1', value: 1 },
            { label: '+10', value: 10 },
            { label: '+50', value: 50 },
          ],
    [actionType],
  );

  const handleSubmit = async () => {
    if (!actionType) return;
    const parsed = Number.parseFloat(quantity);
    const trimmedReason = reason.trim();
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.info(`请输入大于 0 的${meta.quantityLabel}`);
      return;
    }
    try {
      await onSubmit(actionType, parsed, trimmedReason);
      setQuantity('');
      setReason('');
    } catch {
      // 错误提示由提交方按接口语义处理；这里保留用户输入，方便修正后重试。
    }
  };

  const handleClose = () => {
    onClose();
    setQuantity('');
    setReason('');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={title}
      confirmText={meta.confirmText}
      onConfirm={handleSubmit}
      loading={loading}
      disabled={loading}
      avoidKeyboard
      dynamicHeight
    >
      <QuickNumInput
        label={meta.quantityLabel}
        value={quantity}
        onChangeText={setQuantity}
        min={0.0001}
        precision={4}
        required
        help={{ title: meta.quantityLabel, purpose: meta.hint }}
        unit={unit || undefined}
        hint={`当前投产 ${formatNumber(plannedQty, { maximumFractionDigits: 4 })} ${unit || ''}`.trim()}
        placeholder="请输入数量"
        quickButtons={quickButtons}
      />
      <FormField
        label={`${meta.title}原因`}
        value={reason}
        onChangeText={setReason}
        placeholder="按公司策略填写原因"
        multiline
        numberOfLines={3}
      />
    </BottomSheet>
  );
}

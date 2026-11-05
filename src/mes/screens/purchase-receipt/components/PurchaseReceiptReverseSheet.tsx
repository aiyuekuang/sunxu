import { useEffect, useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { today } from '../../../../core/utils/date';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PurchaseReceiptReverseSheetProps {
  visible: boolean;
  receiptNo: string;
  onClose: () => void;
  onSubmit: (businessDate: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PurchaseReceiptReverseSheet({
  visible,
  receiptNo,
  onClose,
  onSubmit,
}: PurchaseReceiptReverseSheetProps) {
  const [businessDate, setBusinessDate] = useState(today());

  useEffect(() => {
    if (visible) setBusinessDate(today());
  }, [visible]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`冲正采购入库单：${receiptNo}`}
      subtitle="冲正将回滚库存与关联采购订单收货数量。"
      confirmText="确认冲正"
      onConfirm={() => onSubmit(businessDate)}
      avoidKeyboard
      dynamicHeight
    >
      <DatePickerField
        label="库存业务日期"
        value={businessDate}
        onChange={setBusinessDate}
        showCurrentShortcut
        required
        clearable={false}
        maximumDate={today()}
      />
    </BottomSheet>
  );
}

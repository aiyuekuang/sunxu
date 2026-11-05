import { useState } from 'react';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { useTheme } from '../../../../core/theme/useTheme';

export interface EndSessionModalProps {
  visible: boolean;
  lifeCountUnit: string;
  onClose: () => void;
  onConfirm: (useCount?: number, remark?: string) => Promise<void>;
}

export function EndSessionModal({
  visible,
  lifeCountUnit,
  onClose,
  onConfirm,
}: EndSessionModalProps) {
  const { colors } = useTheme();
  const [useCount, setUseCount] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(useCount ? Number(useCount) : undefined, remark || undefined);
      setUseCount('');
      setRemark('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="下机确认"
      confirmText="确认下机"
      confirmButtonColor={colors.primary}
      onConfirm={handleConfirm}
      loading={loading}
      avoidKeyboard
      dynamicHeight
    >
      <QuickNumInput
        label={`手工补录寿命消耗（${lifeCountUnit}，可选）`}
        value={useCount}
        onChangeText={setUseCount}
        placeholder="输入需手工补录的寿命消耗"
        hint="已随工序报工自动累计时不可重复填写"
        step={0.0001}
        min={0.0001}
      />
      <FormField
        label="备注（可选）"
        value={remark}
        onChangeText={setRemark}
        placeholder="输入备注"
      />
    </BottomSheet>
  );
}

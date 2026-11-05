import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { Spacing } from '../../../../core/theme/tokens';
import { today, toISO } from '../../../../core/utils/date';

interface RouteActivationModalProps {
  visible: boolean;
  routeName?: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: (params: { effectiveFrom: string; changeReason?: string }) => void | Promise<void>;
}

export function RouteActivationModal({
  visible,
  routeName,
  loading,
  onClose,
  onConfirm,
}: RouteActivationModalProps) {
  const [changeReason, setChangeReason] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(today());

  useEffect(() => {
    if (visible) {
      setEffectiveFrom(today());
      return;
    }
    setChangeReason('');
  }, [visible]);

  const handleClose = () => {
    setChangeReason('');
    setEffectiveFrom(today());
    onClose();
  };

  const handleConfirm = () => {
    const reason = changeReason.trim();
    void onConfirm({
      effectiveFrom: toISO(effectiveFrom),
      changeReason: reason || undefined,
    });
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="启用工艺路线"
      subtitle={routeName ? `路线：${routeName}` : undefined}
      confirmText="启用"
      cancelText="取消"
      onConfirm={handleConfirm}
      loading={loading}
      avoidKeyboard
      dynamicHeight
    >
      <View style={styles.content}>
        <DatePickerField
          label="版本生效时间"
          value={effectiveFrom}
          onChange={setEffectiveFrom}
          placeholder="选择版本生效日期"
          clearable={false}
        />
        <FormField
          label="变更说明（选填）"
          value={changeReason}
          onChangeText={setChangeReason}
          placeholder="例如客户版本切换、工艺参数调整；不填则系统自动记录"
          multiline
          numberOfLines={3}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.sm, paddingBottom: Spacing.sm },
});

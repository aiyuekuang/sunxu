import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  type DefectSeverity,
  type QualityDefect,
  qualityService,
} from '../../../host/services';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { toast } from '../../../../core/toast';
import { INSPECTION_QTY_MIN, normalizeInspectionQty } from './inspection-utils.ts';

interface DefectFormSheetProps {
  visible: boolean;
  inspectionId: string;
  defaultQty?: number;
  onClose: () => void;
  onSuccess: (defect: QualityDefect) => void;
}

export function DefectFormSheet({
  visible,
  inspectionId,
  defaultQty = 1,
  onClose,
  onSuccess,
}: DefectFormSheetProps) {
  const { options: defectCodeOptions } = useDict('defect_code');
  const { options: severityOptions } = useDict('defect_severity');
  const [defectCode, setDefectCode] = useState('');
  const [description, setDescription] = useState('');
  const [qty, setQty] = useState(String(defaultQty > 0 ? defaultQty : 1));
  const [severity, setSeverity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDefectCode('');
    setDescription('');
    setQty(String(defaultQty > 0 ? defaultQty : 1));
    setSeverity('');
    setRemarks('');
  }, [defaultQty, visible]);

  const handleSubmit = async () => {
    const normalizedQty = normalizeInspectionQty(qty);
    if (!description.trim()) {
      toast.error('请填写缺陷描述');
      return;
    }
    if (normalizedQty === undefined || normalizedQty < INSPECTION_QTY_MIN) {
      toast.error('请填写有效的缺陷数量');
      return;
    }
    if (!severity) {
      toast.error('请选择严重程度');
      return;
    }

    setSubmitting(true);
    try {
      const defect = await qualityService.addDefect({
        inspectionId,
        defectCode: defectCode || undefined,
        description: description.trim(),
        qty: normalizedQty,
        severity: severity as DefectSeverity,
        remarks: remarks.trim() || undefined,
      });
      toast.success('缺陷记录已添加');
      onSuccess(defect);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '缺陷记录添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title="添加缺陷记录"
      confirmText="保存缺陷"
      onConfirm={handleSubmit}
      loading={submitting}
      avoidKeyboard
    >
      <View style={styles.form}>
        <PickerField
          label="缺陷编码"
          value={defectCode}
          options={defectCodeOptions}
          onChange={setDefectCode}
          placeholder="请选择缺陷编码"
          clearable
        />
        <FormField
          label="缺陷描述"
          required
          value={description}
          onChangeText={setDescription}
          placeholder="描述缺陷的位置、表现等"
          multiline
          numberOfLines={3}
        />
        <QuickNumInput
          label="缺陷数量"
          value={qty}
          onChangeText={setQty}
          placeholder="1"
          min={INSPECTION_QTY_MIN}
          precision={4}
          step={1}
          required
        />
        <ChipSelectField
          label="严重程度"
          required
          options={severityOptions}
          value={severity}
          onChange={(value) => setSeverity(value as string)}
          overflow="scroll"
        />
        <FormField
          label="备注（可选）"
          value={remarks}
          onChangeText={setRemarks}
          placeholder="可选"
          multiline
          numberOfLines={2}
        />
      </View>
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.sm,
  },
});

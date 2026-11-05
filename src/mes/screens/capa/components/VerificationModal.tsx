import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { DateRangeQuickSelect } from '../../../../core/components/DateRangeQuickSelect.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { Spacing } from '../../../../core/theme/tokens';
import { toast } from '../../../../core/toast';

interface VerificationPayload {
  verificationResult: string;
  verificationMethod: string;
  actionEvidence: string;
  observationStartDate?: string;
  observationEndDate?: string;
  recurrenceResult?: string;
  trainingRecord?: string;
  standardUpdateRecord?: string;
}

interface VerificationModalProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: VerificationPayload) => Promise<void>;
}

export function VerificationModal({ visible, loading, onClose, onSubmit }: VerificationModalProps) {
  const [verificationResult, setVerificationResult] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [actionEvidence, setActionEvidence] = useState('');
  const [observationStartDate, setObservationStartDate] = useState('');
  const [observationEndDate, setObservationEndDate] = useState('');
  const [recurrenceResult, setRecurrenceResult] = useState('');
  const [trainingRecord, setTrainingRecord] = useState('');
  const [standardUpdateRecord, setStandardUpdateRecord] = useState('');

  const reset = () => {
    setVerificationResult('');
    setVerificationMethod('');
    setActionEvidence('');
    setObservationStartDate('');
    setObservationEndDate('');
    setRecurrenceResult('');
    setTrainingRecord('');
    setStandardUpdateRecord('');
  };

  const handleSubmit = async () => {
    if (!verificationResult.trim()) {
      toast.info('请填写验证说明');
      return;
    }
    if (!verificationMethod.trim()) {
      toast.info('请填写验证方式');
      return;
    }
    if (!actionEvidence.trim()) {
      toast.info('请填写整改执行证据');
      return;
    }
    if (observationStartDate && observationEndDate && observationStartDate > observationEndDate) {
      toast.info('观察结束日期不能早于开始日期');
      return;
    }
    await onSubmit({
      verificationResult: verificationResult.trim(),
      verificationMethod: verificationMethod.trim(),
      actionEvidence: actionEvidence.trim(),
      observationStartDate: observationStartDate || undefined,
      observationEndDate: observationEndDate || undefined,
      recurrenceResult: recurrenceResult.trim() || undefined,
      trainingRecord: trainingRecord.trim() || undefined,
      standardUpdateRecord: standardUpdateRecord.trim() || undefined,
    });
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="验收通过"
      confirmText="通过"
      cancelText="取消"
      onConfirm={handleSubmit}
      loading={loading}
      avoidKeyboard
      maxHeightRatio={0.9}
    >
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <FormField
            label="验证说明"
            required
            value={verificationResult}
            onChangeText={setVerificationResult}
            placeholder="请说明验证结果和结论依据..."
            multiline
            numberOfLines={4}
          />
          <FormField
            label="验证方式"
            required
            value={verificationMethod}
            onChangeText={setVerificationMethod}
            placeholder="例如复检、抽查、现场确认、数据趋势..."
            multiline
            numberOfLines={3}
          />
          <FormField
            label="整改执行证据"
            required
            value={actionEvidence}
            onChangeText={setActionEvidence}
            placeholder="例如照片、记录编号、复检批次、执行说明..."
            multiline
            numberOfLines={3}
          />
          <DatePickerField
            label="观察开始日期"
            value={observationStartDate}
            showCurrentShortcut={false}
            onChange={setObservationStartDate}
            placeholder="选择日期"
            clearable
          />
          <DatePickerField
            label="观察结束日期"
            value={observationEndDate}
            showCurrentShortcut={false}
            onChange={setObservationEndDate}
            placeholder="选择日期"
            clearable
          />
          <DateRangeQuickSelect
            onSelect={([start, end]) => {
              setObservationStartDate(start);
              setObservationEndDate(end);
            }}
          />
          <FormField
            label="复发观察结论"
            value={recurrenceResult}
            onChangeText={setRecurrenceResult}
            placeholder="说明观察期内是否复发、重复率是否下降..."
            multiline
            numberOfLines={3}
          />
          <FormField
            label="培训/告知记录"
            value={trainingRecord}
            onChangeText={setTrainingRecord}
            placeholder="例如培训批次、通知范围、班组交底..."
            multiline
            numberOfLines={3}
          />
          <FormField
            label="标准/流程更新记录"
            value={standardUpdateRecord}
            onChangeText={setStandardUpdateRecord}
            placeholder="例如作业指导书、检验规范、工艺文件版本..."
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 560 },
  content: { gap: Spacing.sm, paddingBottom: Spacing.md },
});

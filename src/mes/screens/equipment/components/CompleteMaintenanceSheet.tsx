import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { MaintenanceStepDto } from '../../../types/models/MaintenanceStepDto';
import { type EquipmentMaintenance, equipmentService } from '../../../host/services';
import { uploadService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { PhotoPicker } from '../../../../core/components/PhotoPicker.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { today } from '../../../../core/utils/date';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompleteMaintenanceSheetProps {
  /** 当前保养记录，null 时隐藏弹窗 */
  maintenance: Pick<EquipmentMaintenance, 'id' | 'steps'> | null;
  onClose: () => void;
  onSuccess: () => void;
}

type MaintenanceStepFormValue = MaintenanceStepDto & {
  localPhotoUris: string[];
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CompleteMaintenanceSheet({
  maintenance,
  onClose,
  onSuccess,
}: CompleteMaintenanceSheetProps) {
  const { colors } = useTheme();
  const [completedDate, setCompletedDate] = useState('');
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState<MaintenanceStepFormValue[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!maintenance) {
      setCompletedDate('');
      setResult('');
      setSteps([]);
      return;
    }

    setCompletedDate(today());
    setResult('');
    setSteps(
      (maintenance.steps ?? []).map((step, index) => ({
        id: step.id ?? `step-${index + 1}`,
        name: step.name ?? `步骤 ${index + 1}`,
        content: step.content ?? undefined,
        required: step.required ?? true,
        photoRequired: step.photoRequired ?? false,
        result: step.result ?? undefined,
        remark: step.remark ?? undefined,
        localPhotoUris: [],
      })),
    );
  }, [maintenance]);

  const handleClose = () => {
    setCompletedDate('');
    setResult('');
    setSteps([]);
    onClose();
  };

  const updateStep = (index: number, patch: Partial<MaintenanceStepFormValue>) => {
    setSteps((prev) => prev.map((step, idx) => (idx === index ? { ...step, ...patch } : step)));
  };

  const handleComplete = async () => {
    if (!maintenance) return;
    if (!completedDate) {
      toast.error('请填写完成日期');
      return;
    }
    const missingRequiredIndex = steps.findIndex(
      (step) => step.required !== false && !step.result?.trim(),
    );
    if (missingRequiredIndex >= 0) {
      toast.error(`请填写第 ${missingRequiredIndex + 1} 步的执行结果`);
      return;
    }
    const missingPhotoIndex = steps.findIndex(
      (step) => step.photoRequired && step.localPhotoUris.length === 0,
    );
    if (missingPhotoIndex >= 0) {
      toast.error(`请上传第 ${missingPhotoIndex + 1} 步的现场照片`);
      return;
    }
    setSaving(true);
    try {
      const submittedSteps = await Promise.all(
        steps.map(async (step) => {
          const photoUrls = step.localPhotoUris.length
            ? await uploadService.uploadImages(step.localPhotoUris)
            : [];
          if (photoUrls.length !== step.localPhotoUris.length) {
            throw new Error(`第 ${step.name} 步照片上传失败，请重试`);
          }
          return {
            id: step.id,
            name: step.name,
            content: step.content ?? undefined,
            required: step.required ?? true,
            photoRequired: step.photoRequired ?? false,
            result: step.result?.trim() || undefined,
            remark: step.remark?.trim() || undefined,
            photoUrls,
          };
        }),
      );
      await equipmentService.completeMaintenance({
        id: maintenance.id,
        completedDate,
        result: result || undefined,
        steps: steps.length > 0 ? submittedSteps : undefined,
      });
      toast.success('保养已完成');
      setCompletedDate('');
      setResult('');
      setSteps([]);
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet
      visible={!!maintenance}
      onClose={handleClose}
      title="完成保养"
      confirmText="确认完成"
      onConfirm={handleComplete}
      loading={saving}
      avoidKeyboard
    >
      <View style={styles.body}>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>请填写保养完成信息</Text>
        <DatePickerField
          label="完成日期"
          value={completedDate}
          onChange={setCompletedDate}
          required
          showCurrentShortcut
        />
        {steps.length > 0 ? (
          <View style={styles.stepList}>
            {steps.map((step, index) => (
              <View
                key={step.id}
                style={[
                  styles.stepCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.stepHeader}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {index + 1}. {step.name}
                  </Text>
                  <Text
                    style={[
                      styles.stepRequired,
                      { color: step.required === false ? colors.textTertiary : colors.primary },
                    ]}
                  >
                    {step.required === false ? '可选' : '必填'}
                  </Text>
                </View>
                {step.content ? (
                  <Text style={[styles.stepContent, { color: colors.textSecondary }]}>
                    {step.content}
                  </Text>
                ) : null}
                <FormField
                  label={step.required === false ? '执行结果（可选）' : '执行结果'}
                  required={step.required !== false}
                  value={step.result ?? ''}
                  onChangeText={(value) => updateStep(index, { result: value })}
                  placeholder="如：已完成、已更换、运行正常"
                  multiline
                />
                <FormField
                  label="步骤备注（可选）"
                  value={step.remark ?? ''}
                  onChangeText={(value) => updateStep(index, { remark: value })}
                  placeholder="补充步骤异常、耗材更换、测量结果等"
                  multiline
                />
                {step.photoRequired ? (
                  <PhotoPicker
                    photos={step.localPhotoUris}
                    onPhotosChange={(localPhotoUris) => updateStep(index, { localPhotoUris })}
                    maxCount={5}
                    label="必拍照片"
                  />
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
        <FormField
          label={steps.length > 0 ? '整体结果/总结（可选）' : '保养结果'}
          value={result}
          onChangeText={setResult}
          placeholder="填写保养结果或备注..."
          multiline
          numberOfLines={3}
        />
      </View>
    </BottomSheet>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  body: {
    gap: Spacing.sm,
  },
  hint: {
    fontSize: FontSize.xs,
  },
  stepList: {
    gap: Spacing.sm,
  },
  stepCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  stepTitle: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  stepRequired: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  stepContent: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});

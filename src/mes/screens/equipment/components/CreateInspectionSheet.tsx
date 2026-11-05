import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { EquipmentInspectionTask } from '../../../types/models/EquipmentInspectionTask';
import type { InspectionItemDto } from '../../../types/models/InspectionItemDto';
import type {
  Equipment,
  EquipmentInspectionTemplateItem,
  InspectionItem,
} from '../../../host/services';
import { equipmentService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { PhotoPicker } from '../../../../core/components/PhotoPicker.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatTime, today } from '../../../../core/utils/date';
import { toast } from '../../../../core/toast';

interface CreateInspectionSheetProps {
  visible: boolean;
  equipmentId: string;
  inspectionTemplate: Equipment['inspectionTemplate'];
  task?: EquipmentInspectionTask;
  onClose: () => void;
  onSuccess: () => void;
}

const RESULT_OPTIONS = [
  { value: 'normal', label: '正常', color: '#00B578' },
  { value: 'abnormal', label: '异常', color: '#FF3141' },
];

type PointCheckItem = EquipmentInspectionTemplateItem & InspectionItem;

function getTaskItems(task?: EquipmentInspectionTask): EquipmentInspectionTemplateItem[] {
  if (!task) return [];
  return task.items.map((raw, index) => {
    const item = raw as Partial<EquipmentInspectionTemplateItem>;
    return {
      id: item.id ?? `task-item-${index + 1}`,
      name: item.name ?? `点检项 ${index + 1}`,
      standard: item.standard,
      checkType: item.checkType,
      unit: item.unit,
      minValue: item.minValue,
      maxValue: item.maxValue,
      options: item.options,
      required: item.required,
      photoRule: item.photoRule,
    };
  });
}

export function CreateInspectionSheet({
  visible,
  equipmentId,
  inspectionTemplate,
  task,
  onClose,
  onSuccess,
}: CreateInspectionSheetProps) {
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<PointCheckItem[]>([]);
  const [photoUris, setPhotoUris] = useState<Record<string, string[]>>({});
  const [photoEvidenceIds, setPhotoEvidenceIds] = useState<Record<string, string[]>>({});
  const [remarks, setRemarks] = useState('');

  const templateItems = useMemo(() => {
    const taskItems = getTaskItems(task);
    return task ? taskItems : (inspectionTemplate ?? []);
  }, [inspectionTemplate, task]);

  useEffect(() => {
    if (!visible) return;
    setItems(
      templateItems.map((item) => ({
        ...item,
        id: item.id,
        name: item.name,
        result: undefined,
        actualValue: undefined,
        actualText: '',
        remark: '',
        photoEvidenceIds: [],
      })),
    );
    setPhotoUris({});
    setPhotoEvidenceIds({});
    setRemarks('');
  }, [templateItems, visible]);

  const updateItem = (index: number, patch: Partial<PointCheckItem>) => {
    setItems((previous) =>
      previous.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  };

  const getResult = (item: PointCheckItem): 'normal' | 'abnormal' | undefined => {
    if (item.checkType === 'numeric' && item.actualValue != null) {
      return (item.minValue != null && item.actualValue < item.minValue) ||
        (item.maxValue != null && item.actualValue > item.maxValue)
        ? 'abnormal'
        : 'normal';
    }
    return item.result;
  };

  const validate = (): string | undefined => {
    for (const item of items) {
      const result = getResult(item);
      const evidenceIds = photoEvidenceIds[item.id] ?? [];
      if (item.required !== false) {
        if (item.checkType === 'numeric' && item.actualValue == null)
          return `请填写「${item.name}」的实测值`;
        if (
          (item.checkType === 'selection' || item.checkType === 'text') &&
          !item.actualText?.trim()
        )
          return `请填写「${item.name}」的实际结果`;
        if (item.checkType !== 'numeric' && !result) return `请判定「${item.name}」是否正常`;
      }
      if (result === 'abnormal' && !item.remark?.trim())
        return `异常项「${item.name}」需要填写异常说明`;
      if (
        (item.photoRule === 'always' || (item.photoRule === 'abnormal' && result === 'abnormal')) &&
        evidenceIds.length === 0
      ) {
        return `请为「${item.name}」现场拍照`;
      }
    }
    return undefined;
  };

  const validationMessage = validate();
  const hasAbnormal = items.some((item) => getResult(item) === 'abnormal');

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('该设备暂未配置点检标准，请先在管理端配置点检模板');
      return;
    }
    const message = validate();
    if (message) {
      toast.error(message);
      return;
    }
    setSaving(true);
    try {
      const submittedItems: InspectionItem[] = items.flatMap((item) => {
        const actualValue = item.actualValue;
        const actualText = item.actualText?.trim() || undefined;
        const result = getResult(item);
        const isBlank =
          actualValue == null && !actualText && !result && !photoEvidenceIds[item.id]?.length;
        if (item.required === false && isBlank) return [];
        return [
          {
            id: item.id,
            name: item.name,
            result,
            actualValue,
            actualText,
            remark: item.remark?.trim() || undefined,
            photoEvidenceIds: photoEvidenceIds[item.id] ?? [],
          },
        ];
      });
      await equipmentService.createInspection({
        equipmentId,
        taskId: task?.id,
        inspectionDate: today(),
        items: submittedItems as unknown as InspectionItemDto[],
        remarks: remarks.trim() || undefined,
      });
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '提交点检失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title="设备点检"
      subtitle={
        task
          ? `${task.stage === 'before_shift' ? '上班点检' : '下班点检'} · ${task.shiftCalendar?.name ?? '当前班次'} · ${formatTime(task.windowStartsAt)}–${formatTime(task.windowEndsAt)}`
          : '现场填写结果；点检时间、人员和证据由系统记录'
      }
      confirmText="提交点检"
      onConfirm={handleSubmit}
      loading={saving}
      disabled={items.length === 0}
      confirmDisabledHint={items.length === 0 ? '设备没有点检项目，请先配置模板' : undefined}
      avoidKeyboard
    >
      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            当前设备没有可执行的点检项目，请联系设备管理员配置点检模板。
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => {
            const result = getResult(item);
            const photoRequired =
              item.photoRule === 'always' ||
              (item.photoRule === 'abnormal' && result === 'abnormal');
            const photoEnabled = item.photoRule !== 'none' && item.photoRule != null;
            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: result === 'abnormal' ? colors.error : colors.border,
                  },
                ]}
              >
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemIndex, { color: colors.textSecondary }]}>
                    {index + 1}.
                  </Text>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                  {item.required !== false && (
                    <Text style={[styles.required, { color: colors.error }]}>必检</Text>
                  )}
                </View>
                <Text style={[styles.standard, { color: colors.textSecondary }]}>
                  标准：{item.standard?.trim() || '未填写'}
                </Text>
                {item.checkType === 'numeric' ? (
                  <>
                    <Text style={[styles.standard, { color: colors.textSecondary }]}>
                      范围：{item.minValue != null ? `≥ ${item.minValue}` : '不限下限'}
                      {item.maxValue != null ? `，≤ ${item.maxValue}` : '，不限上限'}
                      {item.unit ? ` ${item.unit}` : ''}
                    </Text>
                    <FormField
                      label={`实测值${item.unit ? `（${item.unit}）` : ''}`}
                      value={item.actualValue == null ? '' : String(item.actualValue)}
                      onChangeText={(value) =>
                        updateItem(index, { actualValue: value.trim() ? Number(value) : undefined })
                      }
                      keyboardType="decimal-pad"
                      required={item.required !== false}
                      placeholder="输入现场测量值"
                    />
                    {item.actualValue != null && (
                      <Text
                        style={[
                          styles.resultHint,
                          { color: result === 'abnormal' ? colors.error : colors.success },
                        ]}
                      >
                        {result === 'abnormal' ? '超出标准范围' : '数值在标准范围内'}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    {item.checkType === 'selection' && (
                      <ChipSelectField
                        label="实际结果"
                        required={item.required !== false}
                        options={(item.options ?? []).map((value) => ({ value, label: value }))}
                        value={item.actualText ?? ''}
                        onChange={(actualText) => updateItem(index, { actualText })}
                        overflow="scroll"
                      />
                    )}
                    {item.checkType === 'text' && (
                      <FormField
                        label="实际结果"
                        value={item.actualText ?? ''}
                        onChangeText={(actualText) => updateItem(index, { actualText })}
                        required={item.required !== false}
                        placeholder="填写现场观察结果"
                      />
                    )}
                    <ChipSelectField
                      label="检查判定"
                      required={item.required !== false}
                      options={RESULT_OPTIONS}
                      value={item.result ?? ''}
                      onChange={(value) =>
                        updateItem(index, { result: value as 'normal' | 'abnormal' })
                      }
                    />
                  </>
                )}
                {result === 'abnormal' && (
                  <FormField
                    label="异常说明"
                    value={item.remark ?? ''}
                    onChangeText={(remark) => updateItem(index, { remark })}
                    placeholder="请描述异常情况"
                    required
                    multiline
                  />
                )}
                {photoEnabled && (
                  <View style={styles.photoBlock}>
                    <PhotoPicker
                      key={`${task?.id ?? 'manual'}-${item.id}`}
                      photos={photoUris[item.id] ?? []}
                      onPhotosChange={(uris) =>
                        setPhotoUris((current) => ({ ...current, [item.id]: uris }))
                      }
                      cameraOnly
                      label={photoRequired ? '现场照片（必拍）' : '现场照片'}
                      maxCount={3}
                      onPhotoCaptured={async (uri) => {
                        const evidence = await equipmentService.uploadInspectionPhoto({
                          uri,
                          equipmentId,
                          itemId: item.id,
                          taskId: task?.id,
                        });
                        return evidence.id;
                      }}
                      onPhotoEvidenceChange={(ids) =>
                        setPhotoEvidenceIds((current) => ({ ...current, [item.id]: ids }))
                      }
                    />
                    <Text style={[styles.photoHint, { color: colors.textSecondary }]}>
                      仅支持现场拍摄；系统会为照片添加设备位置和服务器时间。
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
          <FormField
            label={hasAbnormal ? '整体备注（可选）' : '备注（可选）'}
            value={remarks}
            onChangeText={setRemarks}
            placeholder="本次点检的整体备注"
            multiline
          />
          {validationMessage && (
            <Text style={[styles.validation, { color: colors.error }]}>{validationMessage}</Text>
          )}
        </View>
      )}
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.md },
  itemCard: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, gap: Spacing.sm },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  itemIndex: { fontSize: FontSize.base, fontWeight: '500' },
  itemName: { flex: 1, fontSize: FontSize.base, fontWeight: '600' },
  required: { fontSize: FontSize.xs, fontWeight: '600' },
  standard: { fontSize: FontSize.xs, lineHeight: 18 },
  resultHint: { fontSize: FontSize.xs, fontWeight: '500' },
  photoBlock: { gap: Spacing.xs },
  photoHint: { fontSize: FontSize.xs, lineHeight: 17 },
  validation: { fontSize: FontSize.sm },
  emptyBox: { paddingVertical: Spacing.xl, paddingHorizontal: Spacing.md, alignItems: 'center' },
  emptyText: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});

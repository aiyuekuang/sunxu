// biome-ignore-all lint/suspicious/noArrayIndexKey: measurement slots have fixed sequence identities from the template and cannot be reordered
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { QualityInspectionRecord } from '../../../types/models/QualityInspectionRecord';
import { SubmitInspectionRecordType } from '../../../types/models/SubmitInspectionRecordType';
import {
  type QualityDefect,
  type QualityInspection,
  qualityService,
} from '../../../host/services';
import { uploadService } from '../../../host/services';
import { userService } from '../../../host/services';
import type { SimpleUser } from '../../../host/api-types';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge } from '../../../../core/components/Badge.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { PhotoPicker } from '../../../../core/components/PhotoPicker.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import {
  buildCustomFieldFormPayload,
  CustomFieldFormSection,
  validateCustomFields,
} from '../../../components/custom-fields/CustomFieldFormSection.tsx';
import { useCustomFieldSchema } from '../../../components/custom-fields/useCustomFieldSchema.ts';
import { INSPECTION_TYPE_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';
import { DefectFormSheet } from './DefectFormSheet.tsx';
import {
  deriveInspectionConclusion,
  deriveInspectionQuantitiesFromPass,
  evaluateItem,
  hasAutomaticInspectionJudgement,
  hasCompleteInspectionQuantities,
  INSPECTION_QTY_MIN,
  isInspectionQtyClosed,
  normalizeInspectionQty,
  specLabel,
} from './inspection-utils.ts';

function getProcessRecordType(value: string): SubmitInspectionRecordType | null {
  switch (value) {
    case 'first':
      return SubmitInspectionRecordType.FIRST;
    case 'process':
      return SubmitInspectionRecordType.PROCESS;
    case 'last':
      return SubmitInspectionRecordType.LAST;
    case 'other':
      return SubmitInspectionRecordType.OTHER;
    default:
      return null;
  }
}

interface SubmitItemForm {
  id: string;
  itemName: string;
  standard?: string | null;
  unit?: string | null;
  upperLimit?: number | null;
  lowerLimit?: number | null;
  resultType: 'numeric' | 'judgement' | 'selection' | 'text';
  options?: string[] | null;
  acceptedValues?: string[] | null;
  isRequired: boolean;
  photoRequired: boolean;
  requiredMeasurementCount: number;
  measuredValue: string;
  measuredValues: string[];
  photos: string[];
  isPassed: '' | 'pass' | 'fail';
  remarks: string;
  customValues: Record<string, unknown>;
}

export interface SubmitModalProps {
  inspection: QualityInspection;
  recheckSource?: Pick<QualityInspectionRecord, 'id' | 'sequenceNo' | 'recordType'> | null;
  onClose: () => void;
  onSuccess: () => void;
  onDefectAdded?: () => void | Promise<void>;
}

export function SubmitModal({
  inspection,
  recheckSource,
  onClose,
  onSuccess,
  onDefectAdded,
}: SubmitModalProps) {
  const { colors } = useTheme();
  const customFieldSchema = useCustomFieldSchema('quality_inspection_record_item');
  const [customFieldErrors, setCustomFieldErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const { options: conclusionOptions } = useDict('inspection_conclusion');
  const initialRecordType =
    recheckSource?.recordType && recheckSource.recordType !== 'recheck'
      ? recheckSource.recordType
      : inspection.type === 'ipqc'
        ? 'process'
        : 'other';
  const [form, setForm] = useState({
    recordType: initialRecordType,
    sampleQty: '',
    passQty: '',
    failQty: '',
    conclusion: '',
    remarks: '',
  });
  const [itemForms, setItemForms] = useState<SubmitItemForm[]>(() =>
    (inspection.items ?? []).map((item) => ({
      id: item.id,
      itemName: item.itemName,
      standard: item.standard,
      unit: item.unit,
      upperLimit: item.upperLimit,
      lowerLimit: item.lowerLimit,
      resultType: item.resultType,
      options: item.options,
      acceptedValues: item.acceptedValues,
      isRequired: item.isRequired,
      photoRequired: item.photoRequired ?? false,
      requiredMeasurementCount:
        item.resultType === 'numeric' ? item.requiredMeasurementCount || 1 : 1,
      measuredValue: '',
      measuredValues: Array.from(
        {
          length: item.resultType === 'numeric' ? item.requiredMeasurementCount || 1 : 0,
        },
        () => '',
      ),
      photos: [],
      isPassed: '',
      remarks: '',
      customValues: {},
    })),
  );
  const [defects, setDefects] = useState<QualityDefect[]>(() => inspection.defects ?? []);
  const [defectVisible, setDefectVisible] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<SimpleUser | null>(null);
  const [saving, setSaving] = useState(false);
  const failQty = normalizeInspectionQty(form.failQty) ?? 0;
  const totalDefectQty =
    normalizeInspectionQty(defects.reduce((sum, defect) => sum + Number(defect.qty ?? 0), 0)) ?? 0;
  const hasFailedItem = useMemo(
    () => itemForms.some((item) => item.isPassed === 'fail'),
    [itemForms],
  );
  const quantitiesComplete = useMemo(
    () =>
      hasCompleteInspectionQuantities({
        sampleQty: form.sampleQty,
        passQty: form.passQty,
        failQty: form.failQty,
      }),
    [form.failQty, form.passQty, form.sampleQty],
  );
  const autoConclusion = useMemo(
    () =>
      quantitiesComplete
        ? deriveInspectionConclusion({
            passQty: Number(form.passQty) || 0,
            failQty,
            hasFailedItem,
          })
        : '',
    [failQty, form.passQty, hasFailedItem, quantitiesComplete],
  );
  const conclusionLabel = useMemo(
    () =>
      conclusionOptions.find((option) => option.value === form.conclusion)?.label ||
      form.conclusion ||
      '',
    [conclusionOptions, form.conclusion],
  );

  const updateItem = (
    itemId: string,
    patch: Partial<
      Pick<
        SubmitItemForm,
        'measuredValue' | 'measuredValues' | 'photos' | 'isPassed' | 'remarks' | 'customValues'
      >
    >,
  ) => {
    setItemForms((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextItem = { ...item, ...patch };
        if (
          (patch.measuredValue !== undefined || patch.measuredValues !== undefined) &&
          patch.isPassed === undefined &&
          hasAutomaticInspectionJudgement(nextItem)
        ) {
          const autoResult =
            nextItem.resultType === 'numeric'
              ? (() => {
                  if (nextItem.measuredValues.some((value) => value.trim() === '')) {
                    return undefined;
                  }
                  const results = nextItem.measuredValues.map((value) =>
                    evaluateItem(nextItem, value),
                  );
                  return results.some((result) => result === false)
                    ? false
                    : results.every((result) => result === true)
                      ? true
                      : undefined;
                })()
              : evaluateItem(nextItem, nextItem.measuredValue);
          nextItem.isPassed = autoResult == null ? '' : autoResult ? 'pass' : 'fail';
        }
        return nextItem;
      }),
    );
  };

  useEffect(() => {
    setForm((prev) =>
      prev.conclusion === autoConclusion ? prev : { ...prev, conclusion: autoConclusion },
    );
  }, [autoConclusion]);

  const updateQuantity = (field: 'sampleQty' | 'passQty', value: string) => {
    setForm((prev) => {
      const nextForm = { ...prev, [field]: value };
      const qtyPatch = deriveInspectionQuantitiesFromPass({
        sampleQty: nextForm.sampleQty,
        passQty: nextForm.passQty,
      });

      return {
        ...nextForm,
        passQty: Object.hasOwn(qtyPatch, 'passQty')
          ? qtyPatch.passQty === undefined
            ? ''
            : String(qtyPatch.passQty)
          : nextForm.passQty,
        failQty: Object.hasOwn(qtyPatch, 'failQty')
          ? qtyPatch.failQty === undefined
            ? ''
            : String(qtyPatch.failQty)
          : nextForm.failQty,
      };
    });
  };

  const validateItemForms = (): boolean => {
    let completedCount = 0;
    for (const item of itemForms) {
      const measured = item.measuredValue.trim();
      const hasMeasured =
        item.resultType === 'numeric'
          ? item.measuredValues.length === item.requiredMeasurementCount &&
            item.measuredValues.every(
              (value) => value.trim() !== '' && Number.isFinite(Number(value)),
            )
          : measured.length > 0;
      const hasJudgement = item.isPassed !== '';
      const requiresMeasured = item.resultType !== 'judgement';
      if (item.photoRequired && item.photos.length === 0) {
        toast.error(`检验项「${item.itemName}」必须上传照片`);
        return false;
      }
      if (hasJudgement && (!requiresMeasured || hasMeasured)) completedCount += 1;
      if (requiresMeasured && !hasMeasured) {
        toast.error(
          item.resultType === 'numeric'
            ? `检验项「${item.itemName}」要求录入${item.requiredMeasurementCount}个有效测量值`
            : `检验项「${item.itemName}」必须填写检验结果`,
        );
        return false;
      }
      if (!hasJudgement) {
        toast.error(`检验项「${item.itemName}」必须明确选择合格或不合格`);
        return false;
      }
      if (item.isRequired && ((!hasMeasured && requiresMeasured) || !hasJudgement)) {
        toast.error(`必检项「${item.itemName}」尚未完成录入`);
        return false;
      }
    }
    if (itemForms.length > 0 && completedCount === 0) {
      toast.error('请至少录入一条检验项结果');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (customFieldSchema.loading || customFieldSchema.loadError) {
      toast.info('检验项自定义字段尚未成功加载，请稍后重试');
      return;
    }
    const nextCustomFieldErrors: Record<string, Record<string, string>> = {};
    for (const item of itemForms) {
      const fieldErrors = validateCustomFields(
        customFieldSchema.fields,
        item.customValues,
        'create',
      );
      if (Object.keys(fieldErrors).length > 0) nextCustomFieldErrors[item.id] = fieldErrors;
    }
    setCustomFieldErrors(nextCustomFieldErrors);
    if (Object.keys(nextCustomFieldErrors).length > 0) {
      toast.error('请完善检验项自定义字段');
      return;
    }
    const sq = normalizeInspectionQty(form.sampleQty);
    const pq = normalizeInspectionQty(form.passQty);
    const fq = normalizeInspectionQty(form.failQty);
    if (sq === undefined || sq < INSPECTION_QTY_MIN) {
      toast.error('请填写有效的检验数量');
      return;
    }
    if (form.passQty.trim() === '' || form.failQty.trim() === '') {
      toast.error('请填写合格数量，系统将自动计算不合格数量');
      return;
    }
    if (pq === undefined || fq === undefined || pq < 0 || fq < 0) {
      toast.error('请输入有效的合格数量');
      return;
    }
    if (!isInspectionQtyClosed(sq, pq, fq)) {
      toast.error('合格数量和不合格数量之和必须等于检验数量');
      return;
    }
    if (!autoConclusion) {
      toast.error('请先填写抽检数量和合格数量');
      return;
    }
    if (inspection.type === 'ipqc' && !selectedOperator) {
      toast.error('请选择本次受检作业人');
      return;
    }
    const recordType =
      inspection.type === 'ipqc'
        ? getProcessRecordType(form.recordType)
        : SubmitInspectionRecordType.OTHER;
    if (!recordType) {
      toast.error('请选择过程检验的检查方式');
      return;
    }
    if (!validateItemForms()) return;
    setSaving(true);
    try {
      const submittedItems = [];
      for (const item of itemForms) {
        const photoUrls =
          item.photoRequired && item.photos.length > 0
            ? await uploadService.uploadImages(item.photos)
            : undefined;
        if (item.photoRequired && photoUrls?.length !== item.photos.length) {
          throw new Error(`检验项「${item.itemName}」照片上传失败，请重试`);
        }
        submittedItems.push({
          id: item.id,
          measuredValue:
            item.resultType === 'numeric' ? undefined : item.measuredValue.trim() || undefined,
          measuredValues:
            item.resultType === 'numeric'
              ? item.measuredValues.map((value) => Number(value))
              : undefined,
          isPassed: item.isPassed === '' ? undefined : item.isPassed === 'pass',
          photoUrls,
          remarks: item.remarks.trim() || undefined,
          ...buildCustomFieldFormPayload(
            customFieldSchema.fields,
            customFieldSchema.schemaVersion,
            item.customValues,
          ),
        });
      }
      await qualityService.submitRecord({
        id: inspection.id,
        recordType,
        recheckOfRecordId: recheckSource?.id,
        operatorId: inspection.type === 'ipqc' ? selectedOperator?.id : undefined,
        sampleQty: sq,
        passQty: pq,
        failQty: fq,
        remarks: form.remarks || undefined,
        items: submittedItems,
      });
      onSuccess();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible
      onClose={onClose}
      title={recheckSource ? '发起复检' : '新增检查记录'}
      confirmText={recheckSource ? '保存复检记录' : '保存检查记录'}
      onConfirm={handleSubmit}
      loading={saving}
      avoidKeyboard
    >
      <View
        style={[
          styles.formSection,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.stageNotice,
            { backgroundColor: colors.primarySurface, borderColor: colors.primary },
          ]}
        >
          <Text style={[styles.stageNoticeTitle, { color: colors.text }]}>
            检验阶段：{INSPECTION_TYPE_CONFIG[inspection.type]?.label ?? inspection.type}
          </Text>
          <Text style={[styles.stageNoticeText, { color: colors.textSecondary }]}>
            {recheckSource
              ? `本次复检关联第 ${recheckSource.sequenceNo} 次不合格检查记录；结果不会自动覆盖原不合格，仍需按处置流程放行。`
              : inspection.type === 'ipqc'
                ? '检验阶段由当前质检单确定；本次选择实际检查方式。'
                : '检验阶段和抽样方式均由当前质检单及其检验模板确定，本次无需选择过程检查方式。'}
          </Text>
        </View>
        {inspection.type === 'ipqc' ? (
          <>
            <ChipSelectField
              label="检查方式"
              options={[
                { label: '首件检', value: 'first' },
                { label: '过程/巡检', value: 'process' },
                { label: '末件检', value: 'last' },
                { label: '其他检查', value: 'other' },
              ]}
              value={form.recordType}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  recordType: String(value ?? 'other'),
                }))
              }
            />
            <EntityPickerField<SimpleUser>
              label="本次作业人"
              required
              value={selectedOperator}
              onChange={setSelectedOperator}
              fetchFn={async (params) => {
                const list = await userService.simpleList(params.keyword || undefined);
                return { list: list as SimpleUser[], total: list.length };
              }}
              keyExtractor={(user) => user.id}
              labelExtractor={(user) => user.realName || user.username}
              sublabelExtractor={(user) => (user.realName ? `@${user.username}` : '')}
              placeholder="选择本次受检工件的实际作业人"
              clearable={false}
            />
          </>
        ) : null}
        {inspection.type === 'ipqc' ? (
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
            跨班或换人时，每次检查分别选择实际作业人；检查人由当前登录账号自动记录。
          </Text>
        ) : null}
        <QuickNumInput
          label="抽检数量"
          value={form.sampleQty}
          onChangeText={(t) => updateQuantity('sampleQty', t)}
          placeholder="0"
          required
          min={INSPECTION_QTY_MIN}
          precision={4}
          quickButtons={[
            { label: '+1', value: 1 },
            { label: '+5', value: 5 },
          ]}
        />
        <QuickNumInput
          label="合格数量"
          value={form.passQty}
          onChangeText={(t) => updateQuantity('passQty', t)}
          placeholder="0"
          max={Number(form.sampleQty) || 0}
          precision={4}
          quickButtons={[
            { label: '+1', value: 1 },
            { label: '+5', value: 5 },
            { label: '最大', value: 'max' },
          ]}
        />
        <FormField
          label="不合格数量（自动）"
          value={form.failQty}
          placeholder="按抽检数量减去合格数量自动计算"
          editable={false}
        />
      </View>

      {(failQty > 0 || defects.length > 0) && (
        <View
          style={[
            styles.itemSection,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <Text style={[styles.itemSectionTitle, { color: colors.text }]}>缺陷记录</Text>
              <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
                已记录 {totalDefectQty} / 不合格 {failQty}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setDefectVisible(true)} style={styles.addBtn}>
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.addBtnText, { color: colors.primary }]}>添加</Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.defectSummaryCard,
              {
                backgroundColor: defects.length > 0 ? colors.primarySurface : colors.warningSurface,
              },
            ]}
          >
            <Text style={[styles.defectSummaryText, { color: colors.text }]}>
              {defects.length > 0
                ? `已记录 ${defects.length} 条缺陷，数量合计 ${totalDefectQty}`
                : '当前还没有缺陷记录'}
            </Text>
            <Text style={[styles.defectSummaryHint, { color: colors.textSecondary }]}>
              检查记录可先保存，完成质检单前需补齐累计不合格数量对应的缺陷
            </Text>
          </View>
        </View>
      )}

      {itemForms.length > 0 && (
        <View
          style={[
            styles.itemSection,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.itemSectionTitle, { color: colors.text }]}>检验项结果录入</Text>
          {itemForms.map((item) => {
            const isAutomatic = hasAutomaticInspectionJudgement(item);
            return (
              <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.surface }]}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleRow}>
                    <Text style={[styles.itemName, { color: colors.text }]}>
                      {item.itemName}
                      {item.isRequired ? ' *' : ''}
                    </Text>
                    {item.photoRequired ? (
                      <Badge label="必拍照片" variant="info" size="sm" />
                    ) : null}
                    {isAutomatic && <Badge label="自动判定" variant="info" size="sm" />}
                  </View>
                  <Text style={[styles.itemSpec, { color: colors.textSecondary }]}>
                    {isAutomatic ? '合格范围' : '判定标准'}：{specLabel(item) || '-'}
                  </Text>
                </View>

                {item.resultType === 'selection' ? (
                  <ChipSelectField
                    label="检验结果"
                    options={(item.options ?? []).map((value) => ({ label: value, value }))}
                    value={item.measuredValue}
                    onChange={(value) =>
                      updateItem(item.id, { measuredValue: String(value ?? '') })
                    }
                  />
                ) : item.resultType === 'numeric' ? (
                  <View style={styles.measurementList}>
                    <Text style={[styles.measurementHint, { color: colors.textSecondary }]}>
                      需录入 {item.requiredMeasurementCount} 个测量值
                    </Text>
                    {item.measuredValues.map((value, measurementIndex) => (
                      <FormField
                        key={`${item.id}-${measurementIndex}`}
                        label={`测量值 ${measurementIndex + 1}/${item.requiredMeasurementCount}`}
                        value={value}
                        onChangeText={(text) => {
                          const measuredValues = [...item.measuredValues];
                          measuredValues[measurementIndex] = text;
                          updateItem(item.id, { measuredValues });
                        }}
                        placeholder="请输入实测值"
                        keyboardType="decimal-pad"
                        rightElement={
                          item.unit ? (
                            <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>
                              {item.unit}
                            </Text>
                          ) : undefined
                        }
                      />
                    ))}
                  </View>
                ) : item.resultType === 'judgement' ? null : (
                  <FormField
                    label="检验记录"
                    value={item.measuredValue}
                    onChangeText={(t) => updateItem(item.id, { measuredValue: t })}
                    placeholder="请输入检验记录"
                  />
                )}

                {item.photoRequired ? (
                  <PhotoPicker
                    photos={item.photos}
                    onPhotosChange={(photos) => updateItem(item.id, { photos })}
                    maxCount={5}
                    label="必拍照片（必填）"
                  />
                ) : null}

                {isAutomatic ? (
                  <View style={styles.autoResult}>
                    <Text style={[styles.autoResultLabel, { color: colors.text }]}>判定结果</Text>
                    <Badge
                      label={
                        item.isPassed === 'pass'
                          ? '自动合格'
                          : item.isPassed === 'fail'
                            ? '自动不合格'
                            : '录入后自动判定'
                      }
                      variant={
                        item.isPassed === 'pass'
                          ? 'success'
                          : item.isPassed === 'fail'
                            ? 'error'
                            : 'default'
                      }
                    />
                  </View>
                ) : (
                  <ChipSelectField
                    label="判定结果"
                    options={[
                      { label: '合格', value: 'pass' },
                      { label: '不合格', value: 'fail' },
                    ]}
                    value={item.isPassed}
                    onChange={(v) =>
                      updateItem(item.id, { isPassed: (v as '' | 'pass' | 'fail') || '' })
                    }
                    clearable
                  />
                )}

                <FormField
                  label="备注（可选）"
                  value={item.remarks}
                  onChangeText={(t) => updateItem(item.id, { remarks: t })}
                  placeholder="可选"
                  multiline
                />
                <CustomFieldFormSection
                  fields={customFieldSchema.fields}
                  values={item.customValues}
                  errors={customFieldErrors[item.id] ?? {}}
                  mode="create"
                  loading={customFieldSchema.loading}
                  loadError={customFieldSchema.loadError}
                  showSection={false}
                  onChange={(fieldKey, value) =>
                    updateItem(item.id, {
                      customValues: { ...item.customValues, [fieldKey]: value },
                    })
                  }
                />
              </View>
            );
          })}
        </View>
      )}

      <View
        style={[
          styles.formSection,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.readonlyField}>
          <Text style={[styles.readonlyLabel, { color: colors.text }]}>检验结论</Text>
          <View
            style={[
              styles.readonlyValueBox,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.readonlyValue, { color: colors.text }]}>
              {quantitiesComplete
                ? conclusionLabel || '系统自动判定'
                : '请先填写抽检数量和合格数量，系统再自动判定'}
            </Text>
          </View>
        </View>

        <FormField
          label="备注（可选）"
          value={form.remarks}
          onChangeText={(t) => setForm((f) => ({ ...f, remarks: t }))}
          placeholder="可选"
          multiline
        />
      </View>

      <DefectFormSheet
        visible={defectVisible}
        inspectionId={inspection.id}
        defaultQty={failQty || 1}
        onClose={() => setDefectVisible(false)}
        onSuccess={(defect) => {
          setDefects((prev) => [defect, ...prev]);
          setDefectVisible(false);
          void onDefectAdded?.();
        }}
      />
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  formSection: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  stageNotice: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  stageNoticeTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  stageNoticeText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  readonlyField: {
    gap: Spacing.xs,
  },
  readonlyLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  readonlyValueBox: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  readonlyValue: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  itemSection: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  itemSectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 2,
  },
  sectionHint: {
    fontSize: FontSize.xs,
  },
  itemCard: {
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  defectSummaryCard: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  defectSummaryText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  defectSummaryHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  itemHeader: { gap: 2 },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  itemName: { fontSize: FontSize.sm, fontWeight: '600' },
  itemSpec: { fontSize: FontSize.xs },
  inputUnit: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  measurementList: {
    gap: Spacing.xs,
  },
  measurementHint: {
    fontSize: FontSize.xs,
  },
  autoResult: {
    gap: Spacing.xs,
  },
  autoResultLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});

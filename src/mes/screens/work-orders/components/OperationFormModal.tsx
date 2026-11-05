import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { workCenterService, workOrderService } from '../../../host/services';
import { PostGapTimeMode } from '../../../types/models/PostGapTimeMode';
import { equipmentService } from '../../../host/services';
import type { WorkCenter } from '../../../host/services';
import type { WorkOrderOperation } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { MultiEntityPickerField } from '../../../../core/components/MultiEntityPickerField.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { modalAddText } from '../../../constants/button-labels';
import { Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import {
  type EquipmentSelectionItem,
  loadEquipmentSelectionInOrder,
} from '../../../utils/equipment-selection';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OperationFormModalProps {
  /** 所属工单 ID */
  workOrderId: string;
  /** 当前工单工序列表（用于前置校验） */
  operations: WorkOrderOperation[];
  /** 编辑模式时传入已有工序，新增时为 null */
  op: WorkOrderOperation | null;
  /** visible=true 时弹窗可见 */
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OperationFormModal({
  workOrderId,
  operations,
  op,
  visible,
  onClose,
  onSuccess,
}: OperationFormModalProps) {
  const { colors } = useTheme();
  const isEdit = op !== null;
  const { options: equipmentTypeOptions } = useDict('equipment_type');
  const { permitted: canViewPrices } = useAmountDisplay();

  const [operationName, setOperationName] = useState('');
  const [sequence, setSequence] = useState('');
  const [standardTime, setStandardTime] = useState('');
  const [setupTime, setSetupTime] = useState('');
  const [postGapMinutes, setPostGapMinutes] = useState('');
  const [postGapTimeMode, setPostGapTimeMode] = useState<PostGapTimeMode>(PostGapTimeMode.NATURAL);
  const [equipmentType, setEquipmentType] = useState('');
  const [pieceRate, setPieceRate] = useState('');
  const [auxiliaryPriceRatio, setAuxiliaryPriceRatio] = useState('');
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<WorkCenter | null>(null);
  const [selectedEquipments, setSelectedEquipments] = useState<EquipmentSelectionItem[]>([]);
  const [equipmentSelectionLoading, setEquipmentSelectionLoading] = useState(false);
  const [selectedPredecessors, setSelectedPredecessors] = useState<WorkOrderOperation[]>([]);
  const [saving, setSaving] = useState(false);

  const maxSequence = operations.reduce((max, item) => {
    const seq = Number(item.sequence);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, 0);

  const hasReportedOps = operations.some(
    (item) => Number(item.completedQty) > 0 || Number(item.scrappedQty) > 0 || !!item.reportedAt,
  );
  const availablePredecessors = useMemo(
    () =>
      operations
        .filter((item) => item.id !== op?.id)
        .sort((a, b) => Number(a.sequence) - Number(b.sequence)),
    [operations, op?.id],
  );

  const fetchPredecessorOperations = useCallback(
    async (params: { page: number; pageSize: number; keyword?: string }) => {
      const keyword = params.keyword?.trim().toLowerCase();
      const matched = keyword
        ? availablePredecessors.filter((item) =>
            [item.operationName, String(item.sequence), item.stageName ?? '']
              .join(' ')
              .toLowerCase()
              .includes(keyword),
          )
        : availablePredecessors;
      return {
        list: matched.slice((params.page - 1) * params.pageSize, params.page * params.pageSize),
        total: matched.length,
      };
    },
    [availablePredecessors],
  );

  // 打开时初始化表单
  useEffect(() => {
    if (!visible) return;
    let isCurrent = true;
    setEquipmentSelectionLoading(false);
    if (isEdit && op) {
      setOperationName(op.operationName);
      setSequence(String(op.sequence));
      setStandardTime(op.standardTime != null ? String(op.standardTime) : '');
      setSetupTime(op.setupTime != null ? String(op.setupTime) : '');
      setPostGapMinutes(op.postGapMinutes != null ? String(op.postGapMinutes) : '');
      setPostGapTimeMode(op.postGapTimeMode ?? PostGapTimeMode.NATURAL);
      setEquipmentType(op.equipmentType ?? '');
      setPieceRate(op.pieceRateSnapshot != null ? String(op.pieceRateSnapshot) : '');
      setAuxiliaryPriceRatio(
        op.auxiliaryPriceRatioSnapshot != null ? String(op.auxiliaryPriceRatioSnapshot) : '',
      );
      if (op.workCenterId) {
        workCenterService
          .detail(op.workCenterId)
          .then(setSelectedWorkCenter)
          .catch(() => {
            setSelectedWorkCenter(null);
          });
      } else {
        setSelectedWorkCenter(null);
      }
      const allowedEquipmentIds = op.allowedEquipmentIds ?? [];
      if (allowedEquipmentIds.length > 0) {
        setEquipmentSelectionLoading(true);
        void loadEquipmentSelectionInOrder(allowedEquipmentIds).then((items) => {
          if (!isCurrent) return;
          setSelectedEquipments(items);
          setEquipmentSelectionLoading(false);
          const unavailableCount = items.filter((item) => item.unavailable).length;
          if (unavailableCount > 0) {
            toast.info(
              `${unavailableCount} 台已选设备资料暂时不可读取，原设备编号和顺序已保留；可在已选列表中移除后重新选择。`,
            );
          }
        });
      } else {
        setSelectedEquipments([]);
      }
      const predecessorIds = new Set(
        op.predecessorDependencies?.map((item) => item.predecessorOperationId) ??
          op.predecessorOperationIds ??
          [],
      );
      setSelectedPredecessors(operations.filter((item) => predecessorIds.has(item.id)));
    } else {
      setOperationName('');
      setSequence('');
      setStandardTime('');
      setSetupTime('');
      setPostGapMinutes('');
      setPostGapTimeMode(PostGapTimeMode.NATURAL);
      setEquipmentType('');
      setPieceRate('');
      setAuxiliaryPriceRatio('');
      setSelectedWorkCenter(null);
      setSelectedEquipments([]);
      setEquipmentSelectionLoading(false);
      setSelectedPredecessors(
        hasReportedOps && availablePredecessors.length > 0
          ? [availablePredecessors[availablePredecessors.length - 1]]
          : [],
      );
    }
    return () => {
      isCurrent = false;
    };
  }, [visible, op, isEdit, operations, hasReportedOps, availablePredecessors]);

  const fetchWorkCenters = useCallback(
    (params: { page: number; pageSize: number; keyword?: string }) =>
      workCenterService.list({ ...params, isActive: true }),
    [],
  );

  const handleSubmit = async () => {
    if (isEdit && op?.isOutsourced) {
      toast.info('委外工序请在 Web 端维护交付物、准备时间、单件加工时间和委外单');
      return;
    }
    if (!operationName.trim()) {
      toast.error('请输入工序名称');
      return;
    }
    if (!standardTime.trim() || Number(standardTime) <= 0) {
      toast.error('请填写单件标准工时');
      return;
    }
    if (!equipmentType) {
      toast.error('请选择设备类型');
      return;
    }
    let parsedSequence: number | undefined;
    if (sequence.trim()) {
      const seq = Number(sequence);
      if (!Number.isInteger(seq) || seq <= 0) {
        toast.error('顺序号必须是大于 0 的整数');
        return;
      }
      parsedSequence = seq;
    }
    let parsedSetupTime: number | null | undefined;
    if (setupTime.trim()) {
      const parsed = Number(setupTime);
      if (!Number.isFinite(parsed) || parsed < 0) {
        toast.error('准备工时必须是大于等于 0 的数字');
        return;
      }
      parsedSetupTime = parsed;
    } else if (isEdit) {
      parsedSetupTime = null;
    }
    let parsedPostGapMinutes: number | null | undefined;
    if (postGapMinutes.trim()) {
      const parsed = Number(postGapMinutes);
      if (!Number.isFinite(parsed) || parsed < 0) {
        toast.error('后置等待时长必须是大于等于 0 的数字');
        return;
      }
      parsedPostGapMinutes = parsed;
    } else if (isEdit) {
      parsedPostGapMinutes = null;
    }
    let parsedPieceRate: number | null | undefined;
    if (pieceRate.trim()) {
      const parsed = Number(pieceRate);
      if (!Number.isFinite(parsed) || parsed < 0) {
        toast.error('计件单价必须是大于等于 0 的数字');
        return;
      }
      parsedPieceRate = parsed;
    } else if (isEdit) {
      parsedPieceRate = null;
    }
    let parsedAuxiliaryPriceRatio: number | null | undefined;
    if (auxiliaryPriceRatio.trim()) {
      const parsed = Number(auxiliaryPriceRatio);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
        toast.error('辅操工价比例必须是 0~1 之间的数字');
        return;
      }
      parsedAuxiliaryPriceRatio = parsed;
    } else if (isEdit) {
      parsedAuxiliaryPriceRatio = null;
    }
    // 后端规则：工单已发生报工时，新增工序仅允许尾部追加
    if (
      !isEdit &&
      hasReportedOps &&
      parsedSequence !== undefined &&
      parsedSequence <= maxSequence
    ) {
      toast.error(`工单已发生报工，仅支持追加末尾工序（顺序号需大于 ${maxSequence}）`);
      return;
    }
    if (!isEdit && hasReportedOps && selectedPredecessors.length === 0) {
      toast.error('生产中追加工序必须选择前置工序');
      return;
    }
    if (
      isEdit &&
      hasReportedOps &&
      ((op?.predecessorDependencies?.length ?? 0) > 0 ||
        (op?.predecessorOperationIds?.length ?? 0) > 0) &&
      selectedPredecessors.length === 0
    ) {
      toast.error('生产中不可清空已有前置工序');
      return;
    }
    const predecessorDependencies = selectedPredecessors.map((item) => ({
      predecessorOperationId: item.id,
    }));
    setSaving(true);
    try {
      if (isEdit && op) {
        await workOrderService.updateOperation({
          workOrderId,
          operationId: op.id,
          operationName: operationName.trim(),
          sequence: parsedSequence,
          standardTime: Number(standardTime),
          setupTime: parsedSetupTime,
          postGapMinutes: parsedPostGapMinutes,
          postGapTimeMode,
          equipmentType,
          pieceRate: parsedPieceRate,
          auxiliaryPriceRatio: parsedAuxiliaryPriceRatio,
          workCenterId: selectedWorkCenter?.id ?? null,
          allowedEquipmentIds: selectedEquipments.map((item) => item.id),
          predecessorDependencies,
        });
        toast.success('工序已更新');
      } else {
        await workOrderService.addOperation({
          workOrderId,
          operationName: operationName.trim(),
          sequence: parsedSequence,
          standardTime: Number(standardTime),
          setupTime: parsedSetupTime,
          postGapMinutes: parsedPostGapMinutes,
          postGapTimeMode,
          equipmentType,
          pieceRate: parsedPieceRate,
          auxiliaryPriceRatio: parsedAuxiliaryPriceRatio,
          workCenterId: selectedWorkCenter?.id,
          allowedEquipmentIds: selectedEquipments.map((item) => item.id),
          ...(predecessorDependencies.length > 0 ? { predecessorDependencies } : {}),
        });
        toast.success('工序已添加');
      }
      onSuccess();
      onClose();
    } catch (e: unknown) {
      toast.error((e as Error)?.message || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={isEdit ? '编辑' : '添加工序'}
      confirmText={modalAddText('工序', isEdit)}
      onConfirm={handleSubmit}
      loading={saving}
      disabled={equipmentSelectionLoading}
      confirmDisabledHint={
        equipmentSelectionLoading ? '正在读取已选设备，读取完成后才能保存。' : undefined
      }
      avoidKeyboard
    >
      <View style={styles.form}>
        <FormField
          label="工序名称"
          required
          value={operationName}
          onChangeText={setOperationName}
          placeholder="请输入工序名称"
        />

        <FormField
          label="顺序号"
          value={sequence}
          onChangeText={setSequence}
          placeholder={isEdit ? String(op?.sequence ?? '') : '不填则追加到末尾'}
          keyboardType="number-pad"
        />

        <MultiEntityPickerField<WorkOrderOperation>
          label="前置工序"
          values={selectedPredecessors}
          onChange={setSelectedPredecessors}
          fetchFn={fetchPredecessorOperations}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.operationName}
          sublabelExtractor={(item) =>
            `序号 ${item.sequence}${item.stageNo != null ? ` · 阶段 ${item.stageNo}` : ''}`
          }
          title="选择前置工序"
          placeholder={
            hasReportedOps
              ? isEdit
                ? '生产中不可清空已有前置'
                : '生产中追加必须选择'
              : '可选，不选则作为起点'
          }
          required={hasReportedOps && !isEdit}
        />

        <FormField
          label="单件标准工时(分钟/件)"
          required
          value={standardTime}
          onChangeText={setStandardTime}
          placeholder="排产必填"
          keyboardType="numeric"
        />

        <FormField
          label="准备时间(分钟)"
          value={setupTime}
          onChangeText={setSetupTime}
          placeholder="不填默认 0"
          keyboardType="numeric"
        />

        <FormField
          label="后置等待时长(分钟)"
          value={postGapMinutes}
          onChangeText={setPostGapMinutes}
          placeholder="留空默认10分钟；0=无额外等待"
          keyboardType="numeric"
        />

        <PickerField
          label="后置等待计时方式"
          value={postGapTimeMode}
          options={[
            { label: '自然时间（默认）', value: PostGapTimeMode.NATURAL },
            { label: '按排班累计', value: PostGapTimeMode.WORK_SCHEDULE },
          ]}
          onChange={(value) => setPostGapTimeMode(value as PostGapTimeMode)}
        />

        {canViewPrices && (
          <>
            <FormField
              label="计件单价(元/件)"
              value={pieceRate}
              onChangeText={setPieceRate}
              placeholder="不填则不参与计件工资"
              keyboardType="numeric"
            />

            <FormField
              label="辅操工价比例(0~1)"
              value={auxiliaryPriceRatio}
              onChangeText={setAuxiliaryPriceRatio}
              placeholder="如 0.6"
              keyboardType="numeric"
            />
          </>
        )}

        <PickerField
          label="设备类型"
          required
          value={equipmentType}
          options={equipmentTypeOptions}
          onChange={(value) => {
            setEquipmentType(value);
            setSelectedEquipments([]);
          }}
          placeholder="排产按此类型匹配设备"
          clearable
        />

        {equipmentType ? (
          <>
            <MultiEntityPickerField<EquipmentSelectionItem>
              label="允许设备"
              orderedSelection
              orderedItemHeader="设备"
              orderedPriorityHeader="设备优先级"
              values={selectedEquipments}
              onChange={setSelectedEquipments}
              fetchFn={(params) =>
                equipmentService.list({
                  ...params,
                  equipmentType,
                  workCenterId: selectedWorkCenter?.id,
                  includeChildWorkCenters: Boolean(selectedWorkCenter?.id),
                })
              }
              keyExtractor={(item) => item.id}
              labelExtractor={(item) => item.name}
              sublabelExtractor={(item) =>
                item.unavailable ? `设备编号：${item.code}` : item.code
              }
              title="选择允许设备"
              placeholder="不选则该类型设备全部可用"
            />
            <Text style={{ color: colors.textTertiary }}>
              优先级 1 最高。自动排产按可行时间安排，条件相同时参考这里的设备顺序
            </Text>
          </>
        ) : null}

        <EntityPickerField<WorkCenter>
          label="工作中心"
          value={selectedWorkCenter}
          onChange={(item) => {
            setSelectedWorkCenter(item);
            setSelectedEquipments([]);
          }}
          fetchFn={fetchWorkCenters}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.name}
          sublabelExtractor={(item) => item.code}
          title="选择工作中心"
          placeholder="可选，不选则不限制"
        />
      </View>
    </FullScreenModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  form: {
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});

import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PostGapTimeMode } from '../../../types/models/PostGapTimeMode';
import { RouteTopologyDependencyDto } from '../../../types/models/RouteTopologyDependencyDto';
import type { RouteTopologyOperationDto } from '../../../types/models/RouteTopologyOperationDto';
import { equipmentService } from '../../../host/services';
import { type ProcessOperation, processRouteService } from '../../../host/services';
import { type Tooling, toolingService } from '../../../host/services';
import { userService } from '../../../host/services';
import { type WorkCenter, workCenterService } from '../../../host/services';
import type { SimpleUser } from '../../../host/api-types';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField, FormSwitch } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { MultiEntityPickerField } from '../../../../core/components/MultiEntityPickerField.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { modalAddText } from '../../../constants/button-labels';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import {
  type EquipmentSelectionItem,
  loadEquipmentSelectionInOrder,
} from '../../../utils/equipment-selection';
import { toast } from '../../../../core/toast';
import {
  hasDefaultInspectionTemplateBinding,
  type InspectionTemplateBinding,
  ProcessOperationInspectionTemplateBindingsField,
  preserveInspectionTemplateBindings,
} from './ProcessOperationInspectionTemplateBindingsField.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * @enum 仅前端展示用，后端忽略此字段
 * 原因：后端所有时间字段硬编码为分钟（process-operation.entity.ts），timeUnit 标注为"前端传参，忽略"
 * 审计日期：2026-04-02
 */
const TIME_UNITS = [
  { label: '秒', value: '秒' },
  { label: '分钟', value: '分钟' },
  { label: '小时', value: '小时' },
];

interface OpFormState {
  operationName: string;
  operationCode: string;
  isEnabled: boolean;
  standardTime: string;
  setupTime: string;
  setupGroupCode: string;
  postGapMinutes: string;
  postGapTimeMode: PostGapTimeMode;
  transferBatchQty: string;
  timeUnit: string;
  equipmentType: string;
  requiredToolingType: string;
  isQcRequired: boolean;
  isOutsourced: boolean;
  description: string;
  pieceRate: string;
  auxiliaryPriceRatio: string;
}

const EMPTY_FORM: OpFormState = {
  operationName: '',
  operationCode: '',
  isEnabled: true,
  standardTime: '',
  setupTime: '',
  setupGroupCode: '',
  postGapMinutes: '',
  postGapTimeMode: PostGapTimeMode.NATURAL,
  transferBatchQty: '',
  timeUnit: '分钟',
  equipmentType: '',
  requiredToolingType: '',
  isQcRequired: false,
  isOutsourced: false,
  description: '',
  pieceRate: '',
  auxiliaryPriceRatio: '',
};

type RouteDependency = {
  predecessorOperationId?: string | null;
  successorOperationId?: string | null;
  dependencyType?: RouteTopologyDependencyDto.dependencyType | 'finish_to_start' | null;
  transferBatchQty?: number | null;
  minGoodQty?: number | null;
  remark?: string | null;
  sort?: number | null;
};

export interface ProcessRouteOperationFormModalProps {
  visible: boolean;
  /** 所属路线 ID */
  routeId: string;
  /** 编辑模式时传入已有工序，新增时为 null */
  op: ProcessOperation | null;
  /** 当前路线工序，用于选择前置工序 */
  routeOperations: ProcessOperation[];
  /** 当前路线前置关系，用于编辑回显和保存拓扑 */
  routeDependencies: RouteDependency[];
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProcessRouteOperationFormModal({
  visible,
  routeId,
  op,
  routeOperations,
  routeDependencies,
  onClose,
  onSuccess,
}: ProcessRouteOperationFormModalProps) {
  const { colors } = useTheme();
  const { permitted: canViewPrices } = useAmountDisplay();
  const isEdit = op !== null;
  const { options: equipTypeOptions } = useDict('equipment_type');
  const { options: toolingTypeOptions } = useDict('tooling_type');

  const [form, setForm] = useState<OpFormState>(EMPTY_FORM);
  const [selectedDefaultAssignee, setSelectedDefaultAssignee] = useState<SimpleUser | null>(null);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<WorkCenter | null>(null);
  const [selectedEquipments, setSelectedEquipments] = useState<EquipmentSelectionItem[]>([]);
  const [equipmentSelectionLoading, setEquipmentSelectionLoading] = useState(false);
  const [selectedToolings, setSelectedToolings] = useState<Tooling[]>([]);
  const [inspectionTemplateBindings, setInspectionTemplateBindings] = useState<
    InspectionTemplateBinding[]
  >([]);
  const [selectedPredecessors, setSelectedPredecessors] = useState<ProcessOperation[]>([]);
  const [saving, setSaving] = useState(false);

  const availablePredecessors = useMemo(() => {
    const sorted = [...routeOperations].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    if (!op) return sorted;
    return sorted.filter((item) => item.id !== op.id && (item.sequence ?? 0) < (op.sequence ?? 0));
  }, [op, routeOperations]);

  useEffect(() => {
    if (!visible) return;
    let isCurrent = true;
    setEquipmentSelectionLoading(false);
    if (isEdit && op) {
      setForm({
        operationName: op.name,
        operationCode: op.code ?? '',
        isEnabled: op.isEnabled !== false,
        standardTime: op.standardTime != null ? String(op.standardTime) : '',
        setupTime: op.setupTime != null ? String(op.setupTime) : '',
        setupGroupCode: op.setupGroupCode ?? '',
        postGapMinutes: op.postGapMinutes != null ? String(op.postGapMinutes) : '',
        postGapTimeMode: op.postGapTimeMode ?? PostGapTimeMode.NATURAL,
        transferBatchQty: op.transferBatchQty != null ? String(op.transferBatchQty) : '',
        timeUnit: '分钟',
        equipmentType: op.equipmentType ?? '',
        requiredToolingType: op.requiredToolingType ?? '',
        isQcRequired: op.isQualityCheck,
        isOutsourced: op.isOutsourced,
        description: op.description ?? '',
        pieceRate: op.pieceRate != null ? String(op.pieceRate) : '',
        auxiliaryPriceRatio: op.auxiliaryPriceRatio != null ? String(op.auxiliaryPriceRatio) : '',
      });
      setInspectionTemplateBindings(
        preserveInspectionTemplateBindings(op.inspectionTemplateBindings),
      );
      if (op.defaultAssignee) {
        setSelectedDefaultAssignee(op.defaultAssignee as unknown as SimpleUser);
      } else {
        setSelectedDefaultAssignee(null);
      }
      // 回显工作中心
      if (op.workCenterId) {
        workCenterService.detail(op.workCenterId).then(setSelectedWorkCenter);
      } else {
        setSelectedWorkCenter(null);
      }
      // 回显允许设备
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
      if (op.allowedToolingIds?.length) {
        const idSet = new Set(op.allowedToolingIds);
        toolingService
          .list({
            page: 1,
            pageSize: Math.max(100, op.allowedToolingIds.length),
            type: op.requiredToolingType ?? undefined,
          })
          .then((res) => {
            setSelectedToolings(res.list.filter((item: Tooling) => idSet.has(item.id)));
          });
      } else {
        setSelectedToolings([]);
      }
      const predecessorIds = new Set(
        routeDependencies
          .filter((dependency) => dependency.successorOperationId === op.id)
          .map((dependency) => dependency.predecessorOperationId)
          .filter((id): id is string => !!id),
      );
      if (predecessorIds.size === 0) {
        op.predecessorOperationIds?.forEach((id) => {
          predecessorIds.add(id);
        });
      }
      setSelectedPredecessors(availablePredecessors.filter((item) => predecessorIds.has(item.id)));
    } else {
      setForm(EMPTY_FORM);
      setSelectedDefaultAssignee(null);
      setSelectedWorkCenter(null);
      setSelectedEquipments([]);
      setEquipmentSelectionLoading(false);
      setSelectedToolings([]);
      setInspectionTemplateBindings([]);
      setSelectedPredecessors(
        availablePredecessors.length > 0
          ? [availablePredecessors[availablePredecessors.length - 1]]
          : [],
      );
    }
    return () => {
      isCurrent = false;
    };
  }, [visible, op, isEdit, routeDependencies, availablePredecessors]);

  const setField = <K extends keyof OpFormState>(key: K, value: OpFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const fetchUsers = useCallback(
    async (p: { page: number; pageSize: number; keyword?: string }) => {
      const list = await userService.simpleList(p.keyword || undefined);
      return { list, total: list.length };
    },
    [],
  );

  const fetchWorkCenters = useCallback(
    (p: { page: number; pageSize: number; keyword?: string }) =>
      workCenterService.list({ ...p, isActive: true }),
    [],
  );

  const fetchPredecessors = useCallback(
    async (p: { page: number; pageSize: number; keyword?: string }) => {
      const keyword = p.keyword?.trim();
      const list = keyword
        ? availablePredecessors.filter((item) =>
            [item.name, item.code, String(item.sequence)].some((value) =>
              value?.toLowerCase().includes(keyword.toLowerCase()),
            ),
          )
        : availablePredecessors;
      return { list, total: list.length };
    },
    [availablePredecessors],
  );

  const buildTopologyOperations = useCallback(
    (operations: ProcessOperation[]): RouteTopologyOperationDto[] =>
      [...operations]
        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
        .map((operation, index) => ({
          id: operation.id,
          sequence: operation.sequence ?? (index + 1) * 10,
          stageNo: operation.stageNo ?? undefined,
          stageName: operation.stageName ?? undefined,
        })),
    [],
  );

  const buildTopologyDependencies = useCallback(
    (successor: ProcessOperation): RouteTopologyDependencyDto[] => {
      const keptDependencies = routeDependencies
        .filter(
          (dependency) =>
            dependency.predecessorOperationId &&
            dependency.successorOperationId &&
            dependency.successorOperationId !== successor.id,
        )
        .map((dependency, index) => ({
          predecessorOperationId: dependency.predecessorOperationId as string,
          successorOperationId: dependency.successorOperationId as string,
          dependencyType: RouteTopologyDependencyDto.dependencyType.FINISH_TO_START,
          transferBatchQty: dependency.transferBatchQty ?? undefined,
          minGoodQty: dependency.minGoodQty ?? undefined,
          remark: dependency.remark ?? undefined,
          sort: index,
        }));

      return [
        ...keptDependencies,
        ...selectedPredecessors.map((predecessor, index) => ({
          predecessorOperationId: predecessor.id,
          successorOperationId: successor.id,
          dependencyType: RouteTopologyDependencyDto.dependencyType.FINISH_TO_START,
          transferBatchQty: predecessor.transferBatchQty ?? undefined,
          sort: keptDependencies.length + index,
        })),
      ];
    },
    [routeDependencies, selectedPredecessors],
  );

  const handleSubmit = async () => {
    if (!form.operationName.trim()) {
      toast.error('请输入工序名称');
      return;
    }
    if (form.isOutsourced) {
      toast.info('委外工序需在 Web 工艺路线维护中配置委外交付物、准备时间和单件加工时间');
      return;
    }
    if (!form.standardTime || Number(form.standardTime) <= 0) {
      toast.error('请填写单件标准工时');
      return;
    }
    if (!form.equipmentType) {
      toast.error('请选择设备类型');
      return;
    }
    if (form.isQcRequired && !hasDefaultInspectionTemplateBinding(inspectionTemplateBindings)) {
      toast.error('开启过程检验后，请先选择默认 IPQC 模板');
      return;
    }
    let parsedTransferBatchQty: number | undefined;
    if (form.transferBatchQty.trim()) {
      const parsed = Number(form.transferBatchQty);
      if (!Number.isFinite(parsed) || parsed < 0) {
        toast.error('转移批量必须是不小于 0 的数字');
        return;
      }
      parsedTransferBatchQty = parsed;
    }
    let parsedPostGapMinutes: number | undefined;
    if (form.postGapMinutes.trim()) {
      const parsed = Number(form.postGapMinutes);
      if (!Number.isFinite(parsed) || parsed < 0) {
        toast.error('后置等待时长必须是不小于 0 的数字');
        return;
      }
      parsedPostGapMinutes = parsed;
    }
    let parsedAuxiliaryPriceRatio: number | undefined;
    if (form.auxiliaryPriceRatio.trim()) {
      const parsed = Number(form.auxiliaryPriceRatio);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
        toast.error('辅操工价比例必须是 0~1 之间的数字');
        return;
      }
      parsedAuxiliaryPriceRatio = parsed;
    }
    setSaving(true);
    try {
      const payload = {
        operationName: form.operationName,
        isEnabled: form.isEnabled,
        standardTime: Number(form.standardTime),
        setupTime: form.setupTime ? Number(form.setupTime) : 0,
        setupGroupCode: form.setupGroupCode.trim() || undefined,
        postGapMinutes: parsedPostGapMinutes,
        postGapTimeMode: form.postGapTimeMode,
        transferBatchQty: parsedTransferBatchQty,
        timeUnit: form.timeUnit || undefined,
        equipmentType: form.equipmentType,
        isQcRequired: form.isQcRequired,
        isOutsourced: form.isOutsourced,
        description: form.description || undefined,
        pieceRate: form.pieceRate ? Number(form.pieceRate) : undefined,
        auxiliaryPriceRatio: parsedAuxiliaryPriceRatio,
        defaultAssigneeId: selectedDefaultAssignee?.id || undefined,
        workCenterId: selectedWorkCenter?.id || undefined,
        allowedEquipmentIds: selectedEquipments.map((e) => e.id),
        requiredToolingType: form.requiredToolingType || undefined,
        allowedToolingIds: selectedToolings.map((item) => item.id),
        inspectionTemplateBindings: form.isQcRequired ? inspectionTemplateBindings : [],
      };

      if (isEdit && op) {
        const saved = await processRouteService.updateOperation({ id: op.id, ...payload });
        const nextOperations = routeOperations.map((item) => (item.id === saved.id ? saved : item));
        await processRouteService.saveTopology({
          routeId,
          operations: buildTopologyOperations(nextOperations),
          dependencies: buildTopologyDependencies(saved),
        });
        toast.success('工序已更新');
      } else {
        const saved = await processRouteService.addOperation({
          routeId,
          operationCode: form.operationCode || undefined,
          ...payload,
        });
        await processRouteService.saveTopology({
          routeId,
          operations: buildTopologyOperations([...routeOperations, saved]),
          dependencies: buildTopologyDependencies(saved),
        });
        toast.success('工序已添加');
      }
      onSuccess();
      onClose();
    } catch (e: unknown) {
      toast.error((e as Error).message);
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
          value={form.operationName}
          onChangeText={(t) => setField('operationName', t)}
          placeholder="如：车削、铣削..."
        />

        <FormSwitch
          label="是否启用"
          value={form.isEnabled}
          onValueChange={(value) => setField('isEnabled', value)}
        />
        <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
          停用后不进入后续新建工单；已下达工单保持原有工序。
        </Text>

        {!isEdit && (
          <FormField
            label="工序编码"
            value={form.operationCode}
            onChangeText={(t) => setField('operationCode', t)}
            placeholder="可选"
          />
        )}

        <MultiEntityPickerField<ProcessOperation>
          label="前置工序（可多选）"
          values={selectedPredecessors}
          onChange={setSelectedPredecessors}
          fetchFn={fetchPredecessors}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => `${item.sequence}. ${item.name}`}
          sublabelExtractor={(item) => (item.code ? `编码 ${item.code}` : '')}
          title="选择前置工序"
          placeholder={
            routeOperations.length === 0 ? '第一道工序可不选' : '默认接上一道，可改为多选'
          }
        />
        <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
          不选表示起点工序。两道工序选择同一个前置工序，就会并行；汇合工序可同时选择多个前置。
        </Text>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <FormField
              label="单件工时(分钟/件)"
              required
              value={form.standardTime}
              onChangeText={(t) => setField('standardTime', t)}
              placeholder="必填"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.flex1}>
            <PickerField
              label="时间单位"
              value={form.timeUnit}
              options={TIME_UNITS}
              onChange={(v) => setField('timeUnit', v)}
            />
          </View>
        </View>

        <FormField
          label="准备时间（分钟）"
          value={form.setupTime}
          onChangeText={(t) => setField('setupTime', t)}
          placeholder="无需准备填0"
          keyboardType="numeric"
        />

        <FormField
          label="准备组编码"
          value={form.setupGroupCode}
          onChangeText={(t) => setField('setupGroupCode', t)}
          placeholder="如：MOLD-A（可选）"
        />
        <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
          启用准备/换型排产规则后，相同编码会优先连续生产，减少重复准备；不填仍按每单固定准备时间排产。
        </Text>

        <FormField
          label="后置等待时长（分钟）"
          value={form.postGapMinutes}
          onChangeText={(t) => setField('postGapMinutes', t)}
          placeholder="留空默认10分钟；0=无额外等待"
          keyboardType="numeric"
        />

        <PickerField
          label="后置等待计时方式"
          value={form.postGapTimeMode}
          options={[
            { label: '自然时间（默认）', value: PostGapTimeMode.NATURAL },
            { label: '按排班累计', value: PostGapTimeMode.WORK_SCHEDULE },
          ]}
          onChange={(v) => setField('postGapTimeMode', v as PostGapTimeMode)}
        />
        <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
          自然时间连续经过；按排班累计只计算承接资源工作时段，休息时暂停。
        </Text>

        <FormField
          label="转移批量"
          value={form.transferBatchQty}
          onChangeText={(t) => setField('transferBatchQty', t)}
          placeholder="留空表示需全部完成"
          keyboardType="numeric"
        />

        <PickerField
          label="设备类型"
          required
          value={form.equipmentType}
          options={equipTypeOptions}
          onChange={(v) => {
            setField('equipmentType', v);
            setSelectedEquipments([]);
          }}
          placeholder="排产按此类型匹配设备"
          clearable
        />
        <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
          设备类型确定候选范围；允许设备用于进一步缩小范围，未选择时该类型设备均可参与排产
        </Text>

        {form.equipmentType ? (
          <>
            <MultiEntityPickerField<EquipmentSelectionItem>
              label="允许设备"
              orderedSelection
              orderedItemHeader="设备"
              orderedPriorityHeader="设备优先级"
              values={selectedEquipments}
              onChange={setSelectedEquipments}
              fetchFn={(p) =>
                equipmentService.list({
                  ...p,
                  equipmentType: form.equipmentType,
                  workCenterId: selectedWorkCenter?.id,
                  includeChildWorkCenters: Boolean(selectedWorkCenter?.id),
                })
              }
              keyExtractor={(e) => e.id}
              labelExtractor={(e) => e.name}
              sublabelExtractor={(e) => (e.unavailable ? `设备编号：${e.code}` : e.code)}
              title="选择允许设备"
              placeholder="不选 = 全部可用"
            />
            <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
              优先级 1 最高。自动排产先按可行时间安排，条件相同时优先选择顺序靠前的设备
            </Text>
          </>
        ) : null}

        <PickerField
          label="要求工装类型"
          value={form.requiredToolingType}
          options={toolingTypeOptions}
          onChange={(v) => {
            setField('requiredToolingType', v);
            setSelectedToolings([]);
          }}
          placeholder="不限制工装"
          clearable
        />
        {form.requiredToolingType ? (
          <>
            <MultiEntityPickerField<Tooling>
              label="允许使用工装（候选范围）"
              values={selectedToolings}
              onChange={setSelectedToolings}
              fetchFn={(p) =>
                toolingService.list({
                  ...p,
                  type: form.requiredToolingType,
                })
              }
              keyExtractor={(item) => item.id}
              labelExtractor={(item) => item.name}
              sublabelExtractor={(item) => item.toolingCode}
              title="选择允许使用工装"
              placeholder="不选 = 此类型全部可用"
            />
            <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
              可选。这里只限定现场可选候选范围，实际使用以扫码或确认生成的工装使用记录为准
            </Text>
          </>
        ) : null}

        <EntityPickerField<WorkCenter>
          label="工作中心"
          value={selectedWorkCenter}
          onChange={(wc) => {
            setSelectedWorkCenter(wc);
            setSelectedEquipments([]);
          }}
          fetchFn={fetchWorkCenters}
          keyExtractor={(wc) => wc.id}
          labelExtractor={(wc) => wc.name}
          sublabelExtractor={(wc) => wc.code}
          placeholder="不选则不限制车间，全厂调度"
          clearable
        />
        <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
          可选。指定后排产只在该车间及其下级中匹配设备，适用于洁净室、专用产线等场景
        </Text>

        {canViewPrices && (
          <>
            <FormField
              label="计件单价（元/件）"
              value={form.pieceRate}
              onChangeText={(t) => setField('pieceRate', t)}
              placeholder="0.00"
              keyboardType="numeric"
            />
            <FormField
              label="辅操工价比例（0~1）"
              value={form.auxiliaryPriceRatio}
              onChangeText={(t) => setField('auxiliaryPriceRatio', t)}
              placeholder="如 0.6"
              keyboardType="numeric"
            />
          </>
        )}

        <EntityPickerField
          label="默认操作员"
          value={selectedDefaultAssignee}
          onChange={setSelectedDefaultAssignee}
          fetchFn={fetchUsers}
          keyExtractor={(u) => u.id}
          labelExtractor={(u) => u.realName || u.username}
          sublabelExtractor={(u) => (u.realName ? `@${u.username}` : '')}
          placeholder="选择默认操作员（可选）"
          clearable
        />

        <FormField
          label="工序说明"
          value={form.description}
          onChangeText={(t) => setField('description', t)}
          placeholder="可选"
          multiline
          numberOfLines={2}
        />

        <FormSwitch
          label="过程检验（IPQC）"
          value={form.isQcRequired}
          onValueChange={(v) => {
            setField('isQcRequired', v);
            if (!v) setInspectionTemplateBindings([]);
          }}
        />
        <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
          开启后，本工序报工进入过程检验周期；成品/完工检验由 Web 端 FQC 检验批规则配置。
        </Text>
        {form.isQcRequired ? (
          <ProcessOperationInspectionTemplateBindingsField
            value={inspectionTemplateBindings}
            onChange={setInspectionTemplateBindings}
          />
        ) : null}

        <FormSwitch
          label="委外工序"
          value={form.isOutsourced}
          onValueChange={() => {
            toast.info('委外工序需在 Web 工艺路线维护中配置委外交付物、准备时间和单件加工时间');
          }}
        />
        <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
          App 仅维护内部工序资源；委外交付物、准备时间和单件加工时间请在 Web 工艺路线中维护。
        </Text>
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
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  fieldHint: {
    fontSize: FontSize.xs,
    marginTop: -Spacing.xs,
    lineHeight: FontSize.xs * 1.4,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { toDateTimeStr } from '../../../../core/utils/date';
import { scheduleService } from '../../../host/services';
import { EquipmentListDto } from '../../../types/models/EquipmentListDto';
import { type Equipment, equipmentService } from '../../../host/services';
import { userService } from '../../../host/services';
import { workCenterService } from '../../../host/services';
import {
  type WorkOrder,
  type WorkOrderDetail,
  workOrderService,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { DrillDownTreePicker, type TreePickerNode } from '../../../../core/components/DrillDownTreePicker.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { PAGE_SIZE } from '../../../constants/enums';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import type { RootStackParamList } from '../../../host/navigation';
import { formatQtyWithUnit } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import { showScheduleActionableError } from './schedule-error-action.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type ScheduleableOperation = WorkOrderDetail['operations'][number];

function filterEquipmentsForOperation(
  list: Equipment[],
  operation: ScheduleableOperation | null,
): Equipment[] {
  let nextList = list;
  if (operation?.equipmentType) {
    nextList = nextList.filter((equipment) => equipment.equipmentType === operation.equipmentType);
  }
  if (operation?.allowedEquipmentIds?.length) {
    const allowedIdSet = new Set(operation.allowedEquipmentIds);
    nextList = nextList.filter((equipment) => allowedIdSet.has(equipment.id));
  }
  return nextList;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateEntryModal({ visible, onClose, onCreated }: CreateEntryModalProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [workCenterId, setWorkCenterId] = useState<string | null>(null);
  const [workCenterName, setWorkCenterName] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedOperationId, setSelectedOperationId] = useState<string>('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [plannedStart, setPlannedStart] = useState(toDateTimeStr(new Date()));
  const [plannedEnd, setPlannedEnd] = useState(
    toDateTimeStr(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [saving, setSaving] = useState(false);

  // 树形选择器状态
  const [treePickerVisible, setTreePickerVisible] = useState(false);
  const [treeData, setTreeData] = useState<TreePickerNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [operations, setOperations] = useState<ScheduleableOperation[]>([]);
  const [hasOperationSnapshots, setHasOperationSnapshots] = useState(false);
  const [hasWholeOrderSchedule, setHasWholeOrderSchedule] = useState(false);
  const [loadingOperations, setLoadingOperations] = useState(false);
  const [operationLoadFailed, setOperationLoadFailed] = useState(false);
  const operationLoadId = React.useRef(0);
  const [assignees, setAssignees] = useState<
    Array<{ id: string; username: string; realName: string | null }>
  >([]);

  const openTreePicker = async () => {
    setTreePickerVisible(true);
    setLoadingTree(true);
    try {
      const data = await workCenterService.tree();
      setTreeData(data as unknown as TreePickerNode[]);
    } finally {
      setLoadingTree(false);
    }
  };

  const loadEquipments = useCallback(
    async (wcId: string | undefined, operation: ScheduleableOperation | null) => {
      try {
        const res = await equipmentService.list({
          pageSize: PAGE_SIZE.LARGE,
          ...(wcId ? { workCenterId: wcId } : {}),
          ...(operation?.equipmentType ? { equipmentType: operation.equipmentType } : {}),
          statuses: [EquipmentListDto.status.ACTIVE, EquipmentListDto.status.OCCUPIED],
        } as Record<string, unknown>);
        const allowedIds = operation?.allowedEquipmentIds?.length
          ? new Set(operation.allowedEquipmentIds)
          : null;
        setEquipments(
          res.list.filter(
            (equipment: Equipment) =>
              equipment.isActive && (!allowedIds || allowedIds.has(equipment.id)),
          ),
        );
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : '加载设备失败');
      }
    },
    [],
  );

  const loadOperations = useCallback(async (wo: WorkOrder) => {
    const requestId = ++operationLoadId.current;
    setLoadingOperations(true);
    setOperationLoadFailed(false);
    try {
      const detail = (await workOrderService.detail(wo.id)) as unknown as WorkOrderDetail;
      if (requestId !== operationLoadId.current) return;
      const operationSnapshots = detail.operations ?? [];
      const hasWorkOrderSchedule = (detail.scheduleSlots?.length ?? 0) > 0;
      setHasOperationSnapshots(operationSnapshots.length > 0);
      setHasWholeOrderSchedule(hasWorkOrderSchedule);
      setOperations(
        hasWorkOrderSchedule
          ? []
          : operationSnapshots.filter(
              (operation) =>
                operation.status === 'pending' && (operation.scheduleSlots?.length ?? 0) === 0,
            ),
      );
    } catch (e: unknown) {
      if (requestId !== operationLoadId.current) return;
      setHasOperationSnapshots(false);
      setHasWholeOrderSchedule(false);
      setOperations([]);
      setOperationLoadFailed(true);
      toast.error(e instanceof Error ? e.message : '加载工序失败');
    } finally {
      if (requestId === operationLoadId.current) setLoadingOperations(false);
    }
  }, []);

  const loadAssignees = useCallback(async () => {
    try {
      const list = await userService.simpleList();
      setAssignees(list);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '加载人员失败');
    }
  }, []);

  React.useEffect(() => {
    if (visible) {
      loadAssignees();
    } else {
      setSelectedWorkOrder(null);
      setWorkCenterId(null);
      setWorkCenterName('');
      setSelectedEquipment(null);
      setSelectedOperationId('');
      setSelectedAssigneeId('');
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setPlannedStart(toDateTimeStr(now));
      setPlannedEnd(toDateTimeStr(oneHourLater));
      setEquipments([]);
      setOperations([]);
      setHasOperationSnapshots(false);
      setHasWholeOrderSchedule(false);
      setLoadingOperations(false);
      setOperationLoadFailed(false);
      operationLoadId.current += 1;
      setAssignees([]);
    }
  }, [visible, loadAssignees]);

  const selectedOperation =
    operations.find((operation) => operation.id === selectedOperationId) ?? null;
  const filteredEquipments = filterEquipmentsForOperation(equipments, selectedOperation);
  const isOutsourcedOperation = selectedOperation?.isOutsourced === true;
  const needsEquipment = !!selectedOperation?.equipmentType?.trim();
  const needsWorkCenter =
    !!selectedOperation &&
    !isOutsourcedOperation &&
    !needsEquipment &&
    !selectedOperation.workCenterId;
  const invalidEquipmentConstraint =
    !!selectedOperation &&
    !isOutsourcedOperation &&
    !!selectedOperation.allowedEquipmentIds?.length &&
    !selectedOperation.equipmentType?.trim();

  React.useEffect(() => {
    if (
      selectedEquipment &&
      !filteredEquipments.some((equipment) => equipment.id === selectedEquipment.id)
    ) {
      setSelectedEquipment(null);
    }
  }, [filteredEquipments, selectedEquipment]);

  const handleSave = async () => {
    if (!selectedWorkOrder || !plannedStart || !plannedEnd) {
      toast.info('请填写所有必填项');
      return;
    }
    if (loadingOperations) {
      toast.info('正在读取工单工序，请稍后再提交');
      return;
    }
    if (operationLoadFailed) {
      toast.error('工单工序读取失败，请重新选择工单后再试');
      return;
    }
    if (hasWholeOrderSchedule) {
      toast.error('该工单已有整单排产记录，请调整原记录');
      return;
    }
    if (hasOperationSnapshots && !operations.length) {
      toast.error('该工单没有可新建的待排工序，请调整原排产记录或检查工序状态');
      return;
    }
    if (hasOperationSnapshots && !selectedOperation) {
      toast.info('请选择待排产工序');
      return;
    }
    if (invalidEquipmentConstraint) {
      toast.error('工序限定了设备但未配置设备类型，请先维护工艺路线');
      return;
    }
    if (needsEquipment && !selectedEquipment) {
      toast.info('设备型工序必须选择设备');
      return;
    }
    if (needsWorkCenter && !workCenterId) {
      toast.info('请为该工序选择工作中心');
      return;
    }
    if (new Date(plannedStart) >= new Date(plannedEnd)) {
      toast.error('计划结束时间必须晚于开始时间');
      return;
    }
    setSaving(true);
    try {
      const result = await scheduleService.createEntry({
        workOrderId: selectedWorkOrder.id,
        workCenterId: isOutsourcedOperation ? undefined : (workCenterId ?? undefined),
        equipmentId: isOutsourcedOperation ? undefined : selectedEquipment?.id,
        operationId: selectedOperationId || undefined,
        assigneeId: selectedAssigneeId || undefined,
        plannedStart: new Date(plannedStart).toISOString(),
        plannedEnd: new Date(plannedEnd).toISOString(),
      });
      const dependencyMessage = result.dependencyConflictReason ?? result.dependencyWarning;
      if (dependencyMessage) {
        toast.info(dependencyMessage, '排产创建成功');
      } else {
        toast.success('排产创建成功');
      }
      onCreated();
    } catch (e: unknown) {
      showScheduleActionableError(
        e,
        navigation,
        [selectedWorkOrder.routeId],
        '排产创建失败',
        onClose,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title="手工排产"
      confirmText="新建排产"
      onConfirm={handleSave}
      loading={saving}
      avoidKeyboard
    >
      {/* 工单选择 */}
      <EntityPickerField<WorkOrder>
        label="工单"
        required
        value={selectedWorkOrder}
        onChange={(wo) => {
          setSelectedWorkOrder(wo);
          setWorkCenterId(null);
          setWorkCenterName('');
          setSelectedOperationId('');
          setSelectedEquipment(null);
          setEquipments([]);
          setOperations([]);
          setHasOperationSnapshots(false);
          setHasWholeOrderSchedule(false);
          setOperationLoadFailed(false);
          if (wo) loadOperations(wo);
          else {
            operationLoadId.current += 1;
            setLoadingOperations(false);
          }
        }}
        fetchFn={(p) =>
          workOrderService.list({
            ...p,
            status: 'released',
          })
        }
        keyExtractor={(wo) => wo.id}
        labelExtractor={(wo) => `${wo.orderNo} — ${wo.material?.name ?? ''}`}
        sublabelExtractor={(wo) =>
          `剩余 ${formatQtyWithUnit(
            Math.max(
              0,
              Number(wo.plannedQty) - Number(wo.bottleneckCompletedQty ?? wo.completedQty ?? 0),
            ),
            wo.material?.unit,
            unitLabelMap,
          )}`
        }
        placeholder="选择待排产工单..."
        title="选择工单"
        clearable={false}
      />

      {selectedWorkOrder && loadingOperations && (
        <Text style={{ color: colors.textSecondary }}>正在读取工单工序…</Text>
      )}

      {/* 工序选择 */}
      {selectedWorkOrder &&
        !loadingOperations &&
        hasOperationSnapshots &&
        operations.length > 0 && (
          <PickerField
            label="工序"
            value={selectedOperationId}
            required
            options={operations.map((op) => ({
              label: `${op.sequence ?? ''} ${op.operationName}`,
              value: op.id,
            }))}
            onChange={(operationId) => {
              setSelectedOperationId(operationId);
              setSelectedEquipment(null);
              const operation = operations.find((item) => item.id === operationId) ?? null;
              if (operation?.isOutsourced) {
                setWorkCenterId(null);
                setWorkCenterName('');
                setEquipments([]);
              } else {
                void loadEquipments(workCenterId ?? undefined, operation);
              }
            }}
            placeholder="选择待排产工序"
            clearable={false}
          />
        )}

      {selectedWorkOrder &&
        !loadingOperations &&
        hasOperationSnapshots &&
        operations.length === 0 && (
          <Text style={{ color: colors.error }}>
            {hasWholeOrderSchedule
              ? '该工单已有整单排产记录，请调整原记录后再安排工序。'
              : '该工单当前没有可新建的待排工序，请调整原排产记录或检查工序状态。'}
          </Text>
        )}

      {selectedWorkOrder && !loadingOperations && !hasOperationSnapshots && (
        <Text style={{ color: hasWholeOrderSchedule ? colors.error : colors.textSecondary }}>
          {hasWholeOrderSchedule
            ? '该工单已有整单排产记录，请调整原记录。'
            : '该工单没有工序安排，按整张工单排产。'}
        </Text>
      )}

      {/* 工作中心选择（树形下钻，只选叶子节点） */}
      {!isOutsourcedOperation && (
        <>
          <View style={styles.treeFieldWrapper}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              工作中心{' '}
              {needsWorkCenter && (
                <Text style={{ color: colors.error, fontSize: FontSize.sm }}>*</Text>
              )}
            </Text>
            <Pressable
              style={[styles.treeFieldBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={openTreePicker}
            >
              <Text
                style={[
                  styles.treeFieldText,
                  { color: workCenterName ? colors.text : colors.textTertiary },
                ]}
                numberOfLines={1}
              >
                {workCenterName ||
                  (selectedOperation?.workCenterId && !needsEquipment
                    ? '可选；不选时沿用工序工作中心'
                    : '选择工作中心...')}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </Pressable>
          </View>

          <DrillDownTreePicker
            visible={treePickerVisible}
            onClose={() => setTreePickerVisible(false)}
            title="选择工作中心"
            data={treeData}
            selectedId={workCenterId ?? undefined}
            onSelect={(id, name) => {
              setWorkCenterId(id);
              setWorkCenterName(name);
              setTreePickerVisible(false);
              setSelectedEquipment(null);
              void loadEquipments(id, selectedOperation);
            }}
            loading={loadingTree}
            allowSelectParent={false}
          />
        </>
      )}

      {/* 设备选择 */}
      {!isOutsourcedOperation &&
        (needsEquipment || (workCenterId && filteredEquipments.length > 0)) && (
          <PickerField
            label={needsEquipment ? '设备' : '设备（可选）'}
            value={selectedEquipment?.id ?? ''}
            required={needsEquipment}
            options={filteredEquipments.map((eq) => ({
              label: `${eq.name}（${eq.code}）`,
              value: eq.id,
            }))}
            onChange={(id) =>
              setSelectedEquipment(filteredEquipments.find((eq) => eq.id === id) ?? null)
            }
            placeholder={needsEquipment ? '选择符合工序要求的设备' : '选择设备（可选）'}
            clearable={!needsEquipment}
          />
        )}

      {needsEquipment && filteredEquipments.length === 0 && (
        <Text style={{ color: colors.error }}>没有符合工序设备要求的可用设备。</Text>
      )}

      {/* 执行人选择 */}
      {assignees.length > 0 && (
        <PickerField
          label="执行人（可选）"
          value={selectedAssigneeId}
          options={assignees.map((u) => ({ label: u.realName || u.username, value: u.id }))}
          onChange={setSelectedAssigneeId}
          placeholder="选择执行人（可选）"
          clearable
        />
      )}

      {/* 日期时间 */}
      <DatePickerField
        label="计划开始"
        value={plannedStart}
        onChange={setPlannedStart}
        mode="datetime"
        placeholder="选择计划开始时间"
        required
      />
      <DatePickerField
        label="计划结束"
        value={plannedEnd}
        onChange={setPlannedEnd}
        mode="datetime"
        placeholder="选择计划结束时间"
        required
      />
    </FullScreenModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  treeFieldWrapper: { marginBottom: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.xs },
  treeFieldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    minHeight: 44,
  },
  treeFieldText: { fontSize: FontSize.base, flex: 1 },
});

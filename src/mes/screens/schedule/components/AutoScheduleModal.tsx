import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { type AppliedSchedulePolicyDto, type SchedulePolicyDto, scheduleService } from '../../../host/services';
import type { AutoScheduleFromPlansDto } from '../../../types/models/AutoScheduleFromPlansDto';
import type { PlanScheduleBomOutsourcingDto } from '../../../types/models/PlanScheduleBomOutsourcingDto';
import type { PlanScheduleResultDto } from '../../../types/models/PlanScheduleResultDto';
import { type ProductionPlan, productionPlanService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { confirmAlert } from '../../../../core/components/ConfirmAlert.ts';
import { ContextualHelpButton } from '../../../../core/components/FormLabel.tsx';
import { FormSwitch } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { MultiEntityPickerField } from '../../../../core/components/MultiEntityPickerField.tsx';
import { PlanWorkOrdersModal } from '../../../components/production-plan/PlanWorkOrdersModal.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import type { RootStackParamList } from '../../../host/navigation';
import { SCHEDULE_DISPATCH_RULE_CONFIG } from '../../../constants/status-configs';
import { formatDuration, formatScheduleTime } from '../../../../core/utils/date';
import { formatQtyWithUnit } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import {
  BUFFER_RATIO_OPTIONS,
  formatBufferPolicySummary,
  formatBufferRatio,
} from '../buffer-policy';
import { BomOutsourcingSummary } from './BomOutsourcingSummary.tsx';
import { showScheduleActionableError } from './schedule-error-action.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AutoScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onDone: () => void;
}

type Step = 'select' | 'preview' | 'done';

type PreviewEntry = {
  planId: string;
  planNo: string;
  operationName?: string | null;
  workCenterId?: string | null;
  workCenterName?: string | null;
  equipmentId?: string | null;
  equipmentName?: string | null;
  plannedStart: string;
  plannedEnd: string;
  assigneeId?: string | null;
  durationMinutes: number;
  isBuffer?: boolean | null;
};

const buildPreviewEntryBaseKey = (entry: PreviewEntry): string =>
  [
    entry.planId,
    entry.planNo,
    entry.operationName ?? '',
    entry.workCenterId ?? '',
    entry.equipmentId ?? '',
    entry.plannedStart,
    entry.plannedEnd,
    entry.assigneeId ?? '',
    String(entry.durationMinutes),
    entry.isBuffer ? 'buffer' : 'normal',
  ].join('|');

const DISPATCH_RULE_TIPS: Record<string, string> = {
  edd: '谁的交货日期最近就先做谁，避免延期交货。最常用',
  spt: '哪个订单做得最快就先做哪个，能最快清掉积压的订单数量',
  cr: '综合考虑"离交期还有多久"和"还要做多久"，越紧急的越先做',
  wspt: '在"快做完"的基础上，优先级高的订单额外加权往前排',
  fifo: '谁先下单就先做谁，最公平，但不考虑紧急程度',
};

// 派工规则中文名唯一归口 SCHEDULE_DISPATCH_RULE_CONFIG
const DISPATCH_RULE_LABELS = SCHEDULE_DISPATCH_RULE_CONFIG;

// ─── Component ────────────────────────────────────────────────────────────────

export function AutoScheduleModal({ visible, onClose, onDone }: AutoScheduleModalProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedPlans, setSelectedPlans] = useState<ProductionPlan[]>([]);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [dispatchRule, setDispatchRule] = useState<string>('edd');
  const [bufferRatio, setBufferRatio] = useState<string>('0');
  const [useBufferOverride, setUseBufferOverride] = useState(false);
  const [policy, setPolicy] = useState<SchedulePolicyDto | null>(null);
  const [previewPolicy, setPreviewPolicy] = useState<AppliedSchedulePolicyDto | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [previewEntries, setPreviewEntries] = useState<PreviewEntry[]>([]);
  const [previewBomOutsourcing, setPreviewBomOutsourcing] = useState<
    PlanScheduleBomOutsourcingDto[]
  >([]);
  const [scheduleResult, setScheduleResult] = useState<PlanScheduleResultDto | null>(null);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [previewing, setPreviewing] = useState(false);

  // 新增：工单列表弹窗状态
  const [workOrderModalVisible, setWorkOrderModalVisible] = useState(false);
  const [selectedPlanForWorkOrders, setSelectedPlanForWorkOrders] = useState<ProductionPlan | null>(
    null,
  );

  React.useEffect(() => {
    if (visible) {
      setSelectedPlans([]);
      setDirection('forward');
      setDispatchRule('edd');
      setBufferRatio('0');
      setUseBufferOverride(false);
      setPolicy(null);
      setPreviewPolicy(null);
      setStep('select');
      setPreviewEntries([]);
      setPreviewBomOutsourcing([]);
      setScheduleResult(null);
      setPreviewWarnings([]);
      void (async () => {
        setPolicyLoading(true);
        try {
          const res = await scheduleService.getPolicy();
          setPolicy(res);
          setBufferRatio(String(res.defaultBufferRatio));
        } catch (e: unknown) {
          toast.error((e as Error)?.message ?? '加载排产缓冲策略失败');
        } finally {
          setPolicyLoading(false);
        }
      })();
    }
  }, [visible]);

  const usingBufferOverride = policy?.allowBufferRatioOverride === true && useBufferOverride;
  const appliedBufferRatio = policy
    ? usingBufferOverride
      ? Number(bufferRatio)
      : policy.defaultBufferRatio
    : Number(bufferRatio);
  const appliedBufferSummary = policy
    ? `${formatBufferRatio(appliedBufferRatio) ?? '-'}（${
        usingBufferOverride ? '本次覆盖' : '公司默认'
      }）`
    : '排产缓冲策略未加载';

  /** 检查选中计划中是否有已关联工单的（需要 forceReplace） */
  const hasConflictPlans = selectedPlans.some((p) => {
    const raw = p as Record<string, unknown>;
    const woCount = (raw.workOrderCount as number) ?? 0;
    return woCount > 0;
  });

  const conflictCount = selectedPlans.filter((p) => {
    const raw = p as Record<string, unknown>;
    return ((raw.workOrderCount as number) ?? 0) > 0;
  }).length;

  const buildDto = (): AutoScheduleFromPlansDto => ({
    planIds: selectedPlans.map((p) => p.id),
    direction: direction as AutoScheduleFromPlansDto.direction,
    dispatchRule: dispatchRule as AutoScheduleFromPlansDto.dispatchRule,
    bufferRatio: appliedBufferRatio,
    autoCreateWorkOrders: true,
    forceReplace: hasConflictPlans,
  });

  const doPreview = async () => {
    setPreviewing(true);
    try {
      const result = await scheduleService.scheduleFromPlansPreview(buildDto());
      setPreviewEntries(result.entries ?? []);
      setPreviewBomOutsourcing(result.bomOutsourcing ?? []);
      setPreviewWarnings(result.warnings ?? []);
      setPreviewPolicy(result.appliedPolicy ?? null);
      setStep('preview');
    } catch (e: unknown) {
      showScheduleActionableError(
        e,
        navigation,
        selectedPlans.map((plan) => plan.routeId),
        '预览失败',
        onClose,
      );
    } finally {
      setPreviewing(false);
    }
  };

  const handlePreview = () => {
    if (selectedPlans.length === 0) {
      toast.info('请选择至少一个生产计划');
      return;
    }
    if (!policy || policyLoading) {
      toast.info('排产缓冲策略加载中');
      return;
    }
    if (hasConflictPlans) {
      confirmAlert(
        '工单冲突',
        `选中的 ${selectedPlans.length} 个计划中，有 ${conflictCount} 个已关联工单。继续排产将自动取消草稿、审批中、已下达且未开工的旧工单。已进入执行或终结状态的工单不会被取消。`,
        () => doPreview(),
        '继续排产',
        false,
      );
      return;
    }
    doPreview();
  };

  const handleSchedule = async () => {
    if (selectedPlans.length === 0) {
      toast.info('请选择至少一个生产计划');
      return;
    }
    setScheduling(true);
    try {
      const result = await scheduleService.scheduleFromPlans(buildDto());
      setScheduleResult(result);
      setStep('done');
      onDone();
    } catch (e: unknown) {
      showScheduleActionableError(
        e,
        navigation,
        selectedPlans.map((plan) => plan.routeId),
        '排产失败',
        onClose,
      );
    } finally {
      setScheduling(false);
    }
  };

  const isSelectStep = step === 'select';
  const isDoneStep = step === 'done';
  const previewWarningRows = (() => {
    const warningCounts = new Map<string, number>();
    return previewWarnings.map((warning) => {
      const seq = (warningCounts.get(warning) ?? 0) + 1;
      warningCounts.set(warning, seq);
      return {
        key: `warning:${warning}:${seq}`,
        text: warning,
      };
    });
  })();

  const resultWarningRows = (() => {
    const warningCounts = new Map<string, number>();
    return (scheduleResult?.warnings ?? []).map((warning) => {
      const seq = (warningCounts.get(warning) ?? 0) + 1;
      warningCounts.set(warning, seq);
      return {
        key: `result-warning:${warning}:${seq}`,
        text: warning,
      };
    });
  })();

  const previewEntryRows = (() => {
    const entryCounts = new Map<string, number>();
    return previewEntries.map((entry) => {
      const baseKey = buildPreviewEntryBaseKey(entry);
      const seq = (entryCounts.get(baseKey) ?? 0) + 1;
      entryCounts.set(baseKey, seq);
      return {
        key: seq === 1 ? baseKey : `${baseKey}#${seq}`,
        entry,
      };
    });
  })();

  return (
    <>
      <FullScreenModal
        visible={visible}
        onClose={onClose}
        title={isSelectStep ? '从计划排产' : isDoneStep ? '排产结果' : '预览排产结果'}
        confirmText={isDoneStep ? undefined : isSelectStep ? '预览结果' : '确认排产'}
        onConfirm={isSelectStep ? handlePreview : isDoneStep ? onClose : handleSchedule}
        renderFooter={
          isDoneStep
            ? () => (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={onClose}
                  style={[styles.doneButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.doneButtonText, { color: colors.textOnPrimary }]}>完成</Text>
                </TouchableOpacity>
              )
            : undefined
        }
        loading={isSelectStep ? previewing : scheduling}
        disabled={isSelectStep ? !policy || policyLoading : false}
        confirmDisabledHint={
          isSelectStep
            ? policyLoading
              ? '正在加载排产策略，请稍候'
              : !policy
                ? '排产策略未加载，请关闭后重试'
                : undefined
            : undefined
        }
        avoidKeyboard
      >
        {isSelectStep ? (
          <>
            {/* 排产方向 */}
            <ChipSelectField
              label="排产方向"
              help={{
                title: '排产方向',
                purpose:
                  direction === 'forward'
                    ? '从当前时间向后安排，适合产能充足时。'
                    : '从交货日期向前推算，适合赶交期时。',
              }}
              options={[
                { value: 'forward', label: '正排（从当前时间开始排）' },
                { value: 'backward', label: '倒排（从交期往前排）' },
              ]}
              value={direction}
              onChange={(v) => v && setDirection(v as 'forward' | 'backward')}
            />
            {/* 分派规则 */}
            <ChipSelectField
              label="分派规则"
              help={{
                title: '分派规则',
                purpose: DISPATCH_RULE_TIPS[dispatchRule] ?? '选择工单安排的先后规则。',
              }}
              options={[
                { value: 'edd', label: 'EDD — 最早交期优先' },
                { value: 'spt', label: 'SPT — 最短加工时间优先' },
                { value: 'cr', label: 'CR — 临界比率（综合考虑交期和工时）' },
                { value: 'wspt', label: 'WSPT — 加权最短加工时间（考虑优先级）' },
                { value: 'fifo', label: 'FIFO — 先进先出' },
              ]}
              value={dispatchRule}
              onChange={(v) => v && setDispatchRule(v)}
            />
            {/* 缓冲时间 */}
            <View
              style={[
                styles.policyCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.policyHeader}>
                <Text style={[styles.policyTitle, { color: colors.text }]}>缓冲时间</Text>
                <ContextualHelpButton
                  help={{
                    title: '排产缓冲时间',
                    purpose: '缓冲时间追加在排产总工时末尾，用于吸收生产波动、减少频繁调整。',
                    note: '本次是否可以覆盖公司默认比例，以当前公司策略为准。',
                  }}
                />
              </View>
              <Text style={[styles.policySummary, { color: colors.text }]}>
                当前采用：{policyLoading ? '加载中...' : appliedBufferSummary}
              </Text>
              <Text style={[styles.policyMeta, { color: colors.textSecondary }]}>
                {policyLoading
                  ? '正在加载公司排产缓冲策略...'
                  : policy
                    ? `公司默认：${formatBufferRatio(policy.defaultBufferRatio) ?? '-'} · ${
                        policy.allowBufferRatioOverride
                          ? '可在本次排产临时覆盖'
                          : '仅可使用公司默认'
                      }`
                    : '排产缓冲策略未加载'}
              </Text>
              {!policyLoading && policy?.allowBufferRatioOverride && (
                <FormSwitch
                  label="本次临时覆盖"
                  value={useBufferOverride}
                  onValueChange={setUseBufferOverride}
                />
              )}
              {!policyLoading && policy && usingBufferOverride && (
                <ChipSelectField
                  label="本次覆盖比例"
                  options={BUFFER_RATIO_OPTIONS}
                  value={bufferRatio}
                  onChange={(v) => v && setBufferRatio(v)}
                />
              )}
              {!policyLoading && policy && !policy.allowBufferRatioOverride && (
                <Text style={[styles.policyMeta, { color: colors.textMuted }]}>
                  当前公司策略仅允许使用公司默认比例。
                </Text>
              )}
            </View>

            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
              排产会自动创建工单；若启用审批，审批通过并下达后才进入待开工。
            </Text>

            {/* 选择生产计划 */}
            <MultiEntityPickerField<ProductionPlan>
              label="选择生产计划（已确认）"
              required
              values={selectedPlans}
              onChange={setSelectedPlans}
              fetchFn={(p) => productionPlanService.list({ ...p, status: 'confirmed' })}
              keyExtractor={(plan) => plan.id}
              labelExtractor={(plan) => `${plan.planNo} — ${plan.material?.name ?? ''}`}
              sublabelExtractor={(plan) =>
                `计划 ${formatQtyWithUnit(plan.plannedQty, plan.material?.unit, unitLabelMap)}${
                  plan.dueDate ? ` · 交期 ${plan.dueDate}` : ''
                }`
              }
              title="选择生产计划"
              placeholder="点击选择生产计划..."
              disabledExtractor={(plan) => {
                const raw = plan as Record<string, unknown>;
                const woCount = (raw.workOrderCount as number) ?? 0;
                if (woCount <= 0) return null;
                const activeCount = (raw.activeWorkOrderCount as number) ?? 0;
                if (activeCount > 0) {
                  return `有 ${activeCount} 个已进入执行或终结状态的工单，无法排产`;
                }
                // 草稿/审批中/已下达且未开工的工单可以被强制替换，不再 disable
                return null;
              }}
              // 渲染工单数量徽章
              renderExtra={(plan) => {
                const workOrderCount = (plan as Record<string, unknown>).workOrderCount as
                  | number
                  | undefined;
                if (!workOrderCount || workOrderCount === 0) {
                  return null;
                }
                const activeCount = (plan as Record<string, unknown>).activeWorkOrderCount as
                  | number
                  | undefined;
                const badgeColor = activeCount && activeCount > 0 ? colors.error : colors.primary;
                return (
                  <View style={[styles.workOrderBadge, { backgroundColor: `${badgeColor}10` }]}>
                    <Ionicons name="document-text-outline" size={12} color={badgeColor} />
                    <Text style={[styles.workOrderCount, { color: badgeColor }]}>
                      {workOrderCount}
                    </Text>
                  </View>
                );
              }}
              // 点击工单数量查看详情
              onExtraPress={(plan) => {
                setSelectedPlanForWorkOrders(plan);
                setWorkOrderModalVisible(true);
              }}
            />
          </>
        ) : isDoneStep && scheduleResult ? (
          <>
            <View style={[styles.summaryCard, { backgroundColor: `${colors.primary}10` }]}>
              <Text style={[styles.summaryText, { color: colors.primary }]}>排产完成</Text>
              <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>
                已排产 {scheduleResult.planCount} 个计划，创建 {scheduleResult.workOrderCount}{' '}
                个工单、
                {scheduleResult.entryCount} 条排产记录。
              </Text>
              {scheduleResult.appliedPolicy && (
                <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>
                  缓冲策略:{' '}
                  {formatBufferPolicySummary({
                    ratio: scheduleResult.appliedPolicy.bufferRatio,
                    source: scheduleResult.appliedPolicy.source,
                  }) ?? '-'}
                </Text>
              )}
            </View>

            {(scheduleResult.warnings ?? []).length > 0 && (
              <View style={[styles.warningsBox, { backgroundColor: `${colors.warning}15` }]}>
                {resultWarningRows.map((warningRow) => (
                  <View key={warningRow.key} style={styles.warningRow}>
                    <Ionicons name="warning" size={13} color={colors.warning} />
                    <Text style={[styles.warningText, { color: colors.warning }]}>
                      {warningRow.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {(scheduleResult.bomOutsourcing ?? []).length > 0 ? (
              <BomOutsourcingSummary items={scheduleResult.bomOutsourcing ?? []} mode="result" />
            ) : (
              <View style={[styles.summaryCard, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm }}>
                  本次没有需要生成委外单的 BOM 组件。
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* 预览结果 */}
            <TouchableOpacity onPress={() => setStep('select')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: FontSize.sm }}>返回修改</Text>
            </TouchableOpacity>

            <View style={[styles.summaryCard, { backgroundColor: `${colors.primary}10` }]}>
              <Text style={[styles.summaryText, { color: colors.primary }]}>
                将生成 {previewEntries.length} 个排产条目
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>
                方向: {direction === 'forward' ? '正排' : '倒排'} · 规则:{' '}
                {DISPATCH_RULE_LABELS[dispatchRule] ?? dispatchRule} ·{' '}
                {previewEntries.some((entry) => !entry.workCenterId)
                  ? '设备级 / 整单粗排'
                  : '设备级排产'}
              </Text>
              {previewPolicy && (
                <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>
                  缓冲策略:{' '}
                  {formatBufferPolicySummary({
                    ratio: previewPolicy.bufferRatio,
                    source: previewPolicy.source,
                  }) ?? '-'}
                </Text>
              )}
            </View>

            {/* 警告 */}
            {previewWarnings.length > 0 && (
              <View style={[styles.warningsBox, { backgroundColor: `${colors.warning}15` }]}>
                {previewWarningRows.map((warningRow) => (
                  <View key={warningRow.key} style={styles.warningRow}>
                    <Ionicons name="warning" size={13} color={colors.warning} />
                    <Text style={[styles.warningText, { color: colors.warning }]}>
                      {warningRow.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* 预览条目列表 */}
            {previewEntryRows.map((entryRow) => {
              const { entry } = entryRow;
              const isBuffer = entry.isBuffer === true;
              const start = new Date(entry.plannedStart);
              const end = new Date(entry.plannedEnd);
              return (
                <View
                  key={entryRow.key}
                  style={[styles.previewItem, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.previewHeader}>
                    <Text style={[styles.woCode, { color: colors.primary }]}>{entry.planNo}</Text>
                    <Text style={[styles.durationBadge, { color: colors.textSecondary }]}>
                      {formatDuration(entry.durationMinutes)}
                    </Text>
                  </View>
                  <Text style={[styles.woName, { color: colors.text }]}>
                    {entry.equipmentName ?? entry.workCenterName ?? '-'}
                    {isBuffer ? '（缓冲）' : ''}
                  </Text>
                  {entry.equipmentName && entry.workCenterName && (
                    <Text style={[styles.woSub, { color: colors.textSecondary }]}>
                      {entry.workCenterName}
                    </Text>
                  )}
                  {entry.operationName && (
                    <Text style={[styles.woSub, { color: colors.textSecondary }]}>
                      工序: {entry.operationName}
                    </Text>
                  )}
                  <Text style={[styles.woSub, { color: colors.textMuted }]}>
                    {formatScheduleTime(start)} — {formatScheduleTime(end)}
                  </Text>
                </View>
              );
            })}
            <BomOutsourcingSummary items={previewBomOutsourcing} />
          </>
        )}
      </FullScreenModal>

      {/* 工单列表弹窗 */}
      <PlanWorkOrdersModal
        visible={workOrderModalVisible}
        planId={selectedPlanForWorkOrders?.id ?? null}
        planNo={selectedPlanForWorkOrders?.planNo}
        onClose={() => {
          setWorkOrderModalVisible(false);
          setSelectedPlanForWorkOrders(null);
        }}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hintText: { fontSize: FontSize.xs, lineHeight: 18 },
  woCode: { fontSize: FontSize.xs, fontWeight: '600' },
  woName: { fontSize: FontSize.sm, fontWeight: '500' },
  woSub: { fontSize: FontSize.xs, marginTop: 1 },
  durationBadge: { fontSize: FontSize.xs, fontWeight: '500' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  policyCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  policyTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  policyLinkButton: { paddingVertical: 2 },
  policyLinkText: { fontSize: FontSize.xs, fontWeight: '500' },
  policySummary: { fontSize: FontSize.sm, fontWeight: '600' },
  policyMeta: { fontSize: FontSize.xs, lineHeight: 18 },
  summaryCard: { padding: Spacing.md, borderRadius: Radius.md, gap: Spacing.xs },
  summaryText: { fontSize: FontSize.base, fontWeight: '700' },
  doneButton: {
    alignSelf: 'flex-end',
    minWidth: 112,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
  },
  doneButtonText: { fontSize: FontSize.sm, fontWeight: '600' },
  warningsBox: { padding: Spacing.sm, borderRadius: Radius.md, gap: Spacing.xs },
  warningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  warningText: { fontSize: FontSize.xs, flex: 1 },
  previewItem: { padding: Spacing.sm, borderRadius: Radius.md, gap: 2, ...Shadow.sm },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workOrderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  workOrderCount: { fontSize: FontSize.xs, fontWeight: '600' },
});

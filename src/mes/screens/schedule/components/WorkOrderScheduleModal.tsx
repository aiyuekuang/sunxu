import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { type AppliedSchedulePolicyDto, type SchedulePolicyDto, scheduleService } from '../../../host/services';
import type { AutoScheduleDto } from '../../../types/models/AutoScheduleDto';
import type { AutoSchedulePreviewEntryDto } from '../../../types/models/AutoSchedulePreviewEntryDto';
import type { AutoSchedulePreviewResponseDto } from '../../../types/models/AutoSchedulePreviewResponseDto';
import type { AutoScheduleResponseDto } from '../../../types/models/AutoScheduleResponseDto';
import { type WorkOrder, workOrderService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { ContextualHelpButton } from '../../../../core/components/FormLabel.tsx';
import { FormSwitch } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { MultiEntityPickerField } from '../../../../core/components/MultiEntityPickerField.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import type { RootStackParamList } from '../../../host/navigation';
import { formatScheduleTime } from '../../../../core/utils/date';
import { formatQtyWithUnit } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import {
  BUFFER_RATIO_OPTIONS,
  formatBufferPolicySummary,
  formatBufferRatio,
} from '../buffer-policy';
import { showScheduleActionableError } from './schedule-error-action.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkOrderScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onDone: () => void;
}

type Step = 'select' | 'preview';

type PreviewEntry = AutoSchedulePreviewEntryDto & {
  isBuffer?: boolean | null;
};

const buildPreviewEntryBaseKey = (entry: PreviewEntry): string =>
  [
    entry.workOrderId,
    entry.workOrderNo,
    entry.plannedStart,
    entry.plannedEnd,
    entry.equipmentId ?? '',
    entry.equipmentName ?? '',
    entry.workCenterId ?? '',
    entry.operationId ?? '',
    entry.assigneeId ?? '',
    String(entry.durationMinutes),
    entry.isCritical ? 'critical' : 'normal',
    entry.isBuffer ? 'buffer' : 'main',
  ].join('|');

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkOrderScheduleModal({ visible, onClose, onDone }: WorkOrderScheduleModalProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<WorkOrder[]>([]);
  const [algorithm, setAlgorithm] = useState<'greedy' | 'critical_path'>('greedy');
  const [bufferRatio, setBufferRatio] = useState<string>('0');
  const [useBufferOverride, setUseBufferOverride] = useState(false);
  const [policy, setPolicy] = useState<SchedulePolicyDto | null>(null);
  const [previewPolicy, setPreviewPolicy] = useState<AppliedSchedulePolicyDto | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [previewEntries, setPreviewEntries] = useState<AutoSchedulePreviewEntryDto[]>([]);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [previewing, setPreviewing] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setSelectedWorkOrders([]);
      setAlgorithm('greedy');
      setBufferRatio('0');
      setUseBufferOverride(false);
      setPolicy(null);
      setPreviewPolicy(null);
      setStep('select');
      setPreviewEntries([]);
      setPreviewWarnings([]);
      void (async () => {
        setPolicyLoading(true);
        try {
          const res = await scheduleService.getPolicy();
          setPolicy(res);
          if (res.setupRuleEnabled) {
            setAlgorithm('greedy');
          }
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
  const setupRulesEnabled = policy?.setupRuleEnabled === true;

  const buildDto = (): AutoScheduleDto => ({
    workOrderIds: selectedWorkOrders.map((wo) => wo.id),
    algorithm: algorithm as AutoScheduleDto.algorithm,
    bufferRatio: appliedBufferRatio,
  });

  const handlePreview = async () => {
    if (selectedWorkOrders.length === 0) {
      toast.info('请选择至少一个工单');
      return;
    }
    if (!policy || policyLoading) {
      toast.info('排产缓冲策略加载中');
      return;
    }
    setPreviewing(true);
    try {
      const result = (await scheduleService.autoSchedulePreview(
        buildDto(),
      )) as AutoSchedulePreviewResponseDto;
      setPreviewEntries(result.entries ?? []);
      setPreviewWarnings(result.warnings ?? []);
      setPreviewPolicy(result.appliedPolicy ?? null);
      setStep('preview');
    } catch (e: unknown) {
      showScheduleActionableError(
        e,
        navigation,
        selectedWorkOrders.map((workOrder) => workOrder.routeId),
        '预览失败',
        onClose,
      );
    } finally {
      setPreviewing(false);
    }
  };

  const handleSchedule = async () => {
    if (selectedWorkOrders.length === 0) {
      toast.info('请选择至少一个工单');
      return;
    }
    setScheduling(true);
    try {
      const result = (await scheduleService.autoSchedule(buildDto())) as AutoScheduleResponseDto;
      const appliedPolicySummary = formatBufferPolicySummary({
        ratio: result.appliedPolicy?.bufferRatio,
        source: result.appliedPolicy?.source,
      });
      setPreviewPolicy(result.appliedPolicy ?? null);
      toast.success(
        appliedPolicySummary
          ? `自动排产完成，生成 ${result.total} 条排产记录 · ${appliedPolicySummary}`
          : `自动排产完成，生成 ${result.total} 条排产记录`,
      );
      onDone();
    } catch (e: unknown) {
      showScheduleActionableError(
        e,
        navigation,
        selectedWorkOrders.map((workOrder) => workOrder.routeId),
        '排产失败',
        onClose,
      );
    } finally {
      setScheduling(false);
    }
  };

  const isSelectStep = step === 'select';
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
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={isSelectStep ? '按工单排产' : '预览排产结果'}
      confirmText={isSelectStep ? '预览结果' : '确认排产'}
      onConfirm={isSelectStep ? handlePreview : handleSchedule}
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
          {/* 调度算法 */}
          <ChipSelectField
            label="调度算法"
            help={{
              title: '调度算法',
              purpose:
                algorithm === 'greedy'
                  ? '按交期从近到远逐个安排，适合大多数排产场景。'
                  : '分析工序依赖，优先保障影响总工期的关键工序。',
              note: setupRulesEnabled ? '准备/换型规则启用时，本次仅支持贪心算法。' : undefined,
            }}
            options={
              setupRulesEnabled
                ? [{ value: 'greedy', label: '贪心算法（按交期优先排产）' }]
                : [
                    { value: 'greedy', label: '贪心算法（按交期优先排产）' },
                    { value: 'critical_path', label: '关键路径法（CPM，优化多工序路线）' },
                  ]
            }
            value={algorithm}
            onChange={(v) => v && setAlgorithm(v as 'greedy' | 'critical_path')}
          />
          {setupRulesEnabled && (
            <View style={styles.inlineWarning}>
              <Ionicons name="information-circle-outline" size={13} color={colors.warning} />
              <Text style={[styles.inlineWarningText, { color: colors.warning }]}>
                准备/换型规则启用中，本次仅支持贪心算法。
              </Text>
            </View>
          )}

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
                      policy.allowBufferRatioOverride ? '可在本次排产临时覆盖' : '仅可使用公司默认'
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
            选择已下达且待排产的工单，系统将自动安排排产时间。
          </Text>

          {/* 选择工单 */}
          <MultiEntityPickerField<WorkOrder>
            label="选择工单（待排产）"
            required
            values={selectedWorkOrders}
            onChange={setSelectedWorkOrders}
            fetchFn={(p) =>
              workOrderService.list({
                ...p,
                status: 'released',
                executionState: 'unscheduled',
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
            title="选择工单"
            placeholder="点击选择待排产工单..."
            disabledExtractor={(wo) => {
              const entryCount = (wo as Record<string, unknown>).scheduleEntryCount as
                | number
                | undefined;
              if (entryCount && entryCount > 0) {
                return `已有 ${entryCount} 条排产记录，需先删除`;
              }
              return null;
            }}
          />
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
              算法: {algorithm === 'greedy' ? '贪心算法' : '关键路径法'} ·{' '}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={[styles.woCode, { color: colors.primary }]}>
                      {entry.workOrderNo}
                    </Text>
                    {isBuffer && (
                      <View
                        style={[styles.bufferBadge, { backgroundColor: `${colors.warning}15` }]}
                      >
                        <Text
                          style={{
                            color: colors.warning,
                            fontSize: FontSize.xs,
                            fontWeight: '600',
                          }}
                        >
                          缓冲
                        </Text>
                      </View>
                    )}
                    {entry.isCritical && (
                      <View
                        style={[styles.criticalBadge, { backgroundColor: `${colors.error}15` }]}
                      >
                        <Text
                          style={{ color: colors.error, fontSize: FontSize.xs, fontWeight: '600' }}
                        >
                          关键
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={[styles.woSub, { color: colors.textMuted }]}>
                  {formatScheduleTime(start)} — {formatScheduleTime(end)}
                </Text>
              </View>
            );
          })}
        </>
      )}
    </FullScreenModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hintText: { fontSize: FontSize.xs, lineHeight: 18 },
  woCode: { fontSize: FontSize.xs, fontWeight: '600' },
  woSub: { fontSize: FontSize.xs, marginTop: 1 },
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
  warningsBox: { padding: Spacing.sm, borderRadius: Radius.md, gap: Spacing.xs },
  warningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  warningText: { fontSize: FontSize.xs, flex: 1 },
  previewItem: { padding: Spacing.sm, borderRadius: Radius.md, gap: 2, ...Shadow.sm },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bufferBadge: { paddingHorizontal: Spacing.xs, paddingVertical: 1, borderRadius: Radius.full },
  criticalBadge: { paddingHorizontal: Spacing.xs, paddingVertical: 1, borderRadius: Radius.full },
  inlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: -Spacing.xs,
  },
  inlineWarningText: { flex: 1, fontSize: FontSize.xs, lineHeight: 16 },
});

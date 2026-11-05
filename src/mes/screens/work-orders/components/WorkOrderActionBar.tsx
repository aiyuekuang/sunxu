import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomActionBar } from '../../../../core/components/BottomActionBar.tsx';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { isBatchReportCandidateOperation } from '../../../screen-support/work-orders/reporting-constraints';
import { WorkOrderMoreActionsSheet } from './WorkOrderMoreActionsSheet.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionButton {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress: () => void;
  variant:
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'icon-error'
    | 'icon-primary'
    | 'icon-custom';
  customColor?: string;
}

/** 权限布尔值，由父组件通过 useModulePermissions 获取后传入 */
interface WorkOrderPerms {
  create: boolean;
  update: boolean;
  delete: boolean;
  submit: boolean;
  release: boolean;
  start: boolean;
  pause: boolean;
  resume: boolean;
  complete: boolean;
  reopen: boolean;
  cancel: boolean;
  close: boolean;
  split: boolean;
  copy: boolean;
  report: boolean;
  batchReport: boolean;
  receiptWarehouseOverride: boolean;
  changeQuantity: boolean;
  appendQuantity: boolean;
  supplement: boolean;
}

interface WorkOrderActionBarProps {
  status: string;
  operations?: Array<{
    status?: string | null;
    canReport?: boolean | null;
    remainingQty?: number | null;
    isOutsourced?: boolean | null;
    qualityBlockReason?: string | null;
    readyState?: string | null;
  }>;
  remainQty: number;
  allowFullSplit: boolean;
  actionLoading: boolean;
  availableActions?: string[];
  perms: WorkOrderPerms;
  isSerializedMaterial?: boolean;
  onDelete: () => void;
  onCancel: () => void;
  onCopy: () => void;
  onCreateSubAssembly: () => void;
  onSplit: () => void;
  onChangeQuantity: () => void;
  onAppendQuantity: () => void;
  onSupplement: () => void;
  onSetReceiptWarehouse: () => void;
  onSubmitApproval: () => void;
  onRelease: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReport: () => void;
  onBatchReport: () => void;
  onComplete: () => void;
  onReopen: () => void;
  onClose: () => void;
}

const PRIMARY_ACTION_PRIORITY = [
  'submitApproval',
  'release',
  'start',
  'reportDirect',
  'batchReport',
  'resume',
  'close',
  'complete',
  'copy',
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkOrderActionBar({
  status,
  operations,
  remainQty,
  allowFullSplit,
  actionLoading,
  availableActions: aa,
  perms,
  isSerializedMaterial = false,
  onDelete,
  onCancel,
  onCopy,
  onCreateSubAssembly,
  onSplit,
  onChangeQuantity,
  onAppendQuantity,
  onSupplement,
  onSetReceiptWarehouse,
  onSubmitApproval,
  onRelease,
  onStart,
  onPause,
  onResume,
  onReport,
  onBatchReport,
  onComplete,
  onReopen,
  onClose,
}: WorkOrderActionBarProps) {
  const { colors } = useTheme();
  const [moreVisible, setMoreVisible] = useState(false);
  const filledBgMap: Record<string, string> = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };

  const isEnabled = (action: string) => aa?.includes(action) ?? false;
  const maxSplitQty = allowFullSplit ? remainQty : remainQty - 1;

  const canDelete = isEnabled('delete');
  const canCancel = isEnabled('cancel');
  const canSplit = isEnabled('split') && maxSplitQty > 0;
  const canRelease = isEnabled('release');
  const canStart = isEnabled('start');
  const canPause = isEnabled('pause');
  const canResume = isEnabled('resume');
  const canComplete = isEnabled('complete');
  const canReopen = isEnabled('reopen');
  const canClose = isEnabled('close');
  const canReportDirect = isEnabled('reportDirect');
  const hasBatchReportCandidate = !operations || operations.some(isBatchReportCandidateOperation);
  const canBatchReport =
    isEnabled('batchReport') && hasBatchReportCandidate && !isSerializedMaterial;
  const canSetReceiptWarehouse = isEnabled('setReceiptWarehouse');
  const canChangeQuantity = isEnabled('changeQuantity');
  const canAppendQuantity = isEnabled('appendQuantity');
  const hasAppendTargetOperation =
    !operations ||
    operations.length === 0 ||
    operations.some(
      (operation) =>
        operation.status !== 'skipped' &&
        (operation.status !== 'completed' || operation.canReport === true),
    );
  const canSupplement =
    isEnabled('supplement') &&
    (['completed', 'closed'].includes(status) ||
      (['in_progress', 'paused'].includes(status) && !hasAppendTargetOperation));
  const canCopy = isEnabled('copy');
  const canCreateSubAssembly = isEnabled('createSubAssembly');
  const canSubmitApproval = isEnabled('submit');
  const isArchivedStatus = ['cancelled', 'closed'].includes(status);

  // Build action buttons — 有权限且当前可执行时才展示
  const actions: ActionButton[] = [];

  const addAction = (perm: boolean, enabled: boolean, btn: ActionButton) => {
    if (!perm || !enabled) return;
    actions.push(btn);
  };

  // 后端仅在可设置的活动/完工状态返回 setReceiptWarehouse；不能把入口
  // 误放进已归档工单分支，否则移动端会看不到需要补设仓的工单动作。
  addAction(perms.receiptWarehouseOverride, canSetReceiptWarehouse, {
    key: 'setReceiptWarehouse',
    icon: 'business-outline',
    label: '设置完工入库仓',
    description: '冻结当前工单的完工入库仓，后续生产入库单统一使用该仓库',
    onPress: onSetReceiptWarehouse,
    variant: 'icon-primary',
  });

  if (isArchivedStatus) {
    addAction(perms.supplement, canSupplement, {
      key: 'supplement',
      icon: 'duplicate-outline',
      label: '补加工单',
      description: '完工或结案后为多做或漏录产出创建关联补加工单',
      onPress: onSupplement,
      variant: 'icon-primary',
    });

    addAction(perms.copy, canCopy, {
      key: 'copy',
      icon: 'copy-outline',
      label: '重新创建',
      description: '基于当前工单配置重新创建一张草稿工单',
      onPress: onCopy,
      variant: 'primary',
    });
  } else {
    addAction(perms.delete, canDelete, {
      key: 'delete',
      icon: 'trash-outline',
      label: '删除',
      description: '删除当前草稿工单，删除后不可恢复',
      onPress: onDelete,
      variant: 'icon-error',
    });

    addAction(perms.cancel, canCancel, {
      key: 'cancel',
      icon: 'close-circle-outline',
      label: '取消',
      description: '取消当前工单并记录原因，后续将无法继续生产',
      onPress: onCancel,
      variant: 'icon-error',
    });

    addAction(perms.copy, canCopy, {
      key: 'copy',
      icon: 'copy-outline',
      label: '复制',
      description: '基于当前配置复制一张新的草稿工单',
      onPress: onCopy,
      variant: 'icon-primary',
    });

    addAction(perms.create, canCreateSubAssembly, {
      key: 'createSubAssembly',
      icon: 'git-branch-outline',
      label: '按需创建子工单',
      description: '按当前冻结 BOM 和供给缺口补建半成品子工单',
      onPress: onCreateSubAssembly,
      variant: 'icon-primary',
    });

    addAction(perms.split, canSplit, {
      key: 'split',
      icon: 'git-branch-outline',
      label: '拆分',
      description: '按剩余数量拆分，生成一张新的子工单',
      onPress: onSplit,
      variant: 'icon-custom',
      customColor: '#722ED1',
    });

    addAction(perms.changeQuantity, canChangeQuantity, {
      key: 'changeQuantity',
      icon: 'create-outline',
      label: '改数量',
      description: '调整草稿或未开工工单的投产数量',
      onPress: onChangeQuantity,
      variant: 'icon-primary',
    });

    addAction(perms.appendQuantity, canAppendQuantity, {
      key: 'appendQuantity',
      icon: 'add-circle-outline',
      label: '追加投产',
      description: '生产中继续增加当前工单投产数量',
      onPress: onAppendQuantity,
      variant: 'icon-primary',
    });

    addAction(perms.supplement, canSupplement, {
      key: 'supplement',
      icon: 'duplicate-outline',
      label: '补加工单',
      description: '完工后或当前单没有可追加工序时创建关联补加工单',
      onPress: onSupplement,
      variant: 'icon-primary',
    });

    addAction(perms.submit, canSubmitApproval, {
      key: 'submitApproval',
      icon: 'paper-plane',
      label: '提交审批',
      description: '将工单送审，审批通过后系统会尝试自动下达，未自动下达可手动下达',
      onPress: onSubmitApproval,
      variant: 'warning',
    });

    addAction(perms.release, canRelease, {
      key: 'release',
      icon: 'send',
      label: '下达',
      description: '下达后生成工序任务，排产确认后工单才会进入待开工列表',
      onPress: onRelease,
      variant: 'primary',
    });

    addAction(perms.start, canStart, {
      key: 'start',
      icon: 'play',
      label: '开工',
      description: '开始执行当前工单，进入生产中状态',
      onPress: onStart,
      variant: 'primary',
    });

    addAction(perms.pause, canPause, {
      key: 'pause',
      icon: 'pause',
      label: '暂停',
      description: '临时暂停当前工单，后续可恢复继续生产',
      onPress: onPause,
      variant: 'icon-primary',
    });

    addAction(perms.report, canReportDirect, {
      key: 'reportDirect',
      icon: 'checkmark',
      label: '报工',
      description: '直接录入本工单产出数量，自动更新完工入库',
      onPress: onReport,
      variant: 'success',
    });

    addAction(perms.batchReport, canBatchReport, {
      key: 'batchReport',
      icon: 'layers',
      label: '批量报工',
      description: '集中录入多道工序的报工数量',
      onPress: onBatchReport,
      variant: 'success',
    });

    addAction(perms.complete, canComplete, {
      key: 'complete',
      icon: 'flag',
      label: '完工',
      description: '结束当前工单，必要时可强制跳过未完成工序',
      onPress: onComplete,
      variant: 'primary',
    });

    addAction(perms.reopen, canReopen, {
      key: 'reopen',
      icon: 'arrow-undo-outline',
      label: '撤销完工',
      description: '仅恢复尚未产生报工、入库等后续业务事实的工单',
      onPress: onReopen,
      variant: 'warning',
    });

    addAction(perms.resume, canResume, {
      key: 'resume',
      icon: 'play-forward',
      label: '恢复',
      description: '从暂停状态恢复，继续执行当前工单',
      onPress: onResume,
      variant: 'primary',
    });

    addAction(perms.close, canClose, {
      key: 'close',
      icon: 'lock-closed',
      label: '结案',
      description: '彻底关闭工单，关闭后不可再操作',
      onPress: onClose,
      variant: 'primary',
    });
  }

  if (!actionLoading && actions.length === 0) {
    return null;
  }

  const primaryAction =
    PRIMARY_ACTION_PRIORITY.map((key) => actions.find((action) => action.key === key)).find(
      (action): action is ActionButton => Boolean(action),
    ) ?? null;
  const secondaryAction =
    primaryAction && ['reportDirect', 'batchReport', 'resume'].includes(primaryAction.key)
      ? (actions.find((action) => action.key === 'complete') ?? null)
      : null;
  const mainActionKeys = new Set(
    [primaryAction?.key, secondaryAction?.key].filter((value): value is string => Boolean(value)),
  );
  const overflowActions = actions.filter((action) => !mainActionKeys.has(action.key));
  const mainActions = [primaryAction, secondaryAction].filter((action): action is ActionButton =>
    Boolean(action),
  );
  const hasOverflowActions = overflowActions.length > 0;
  const showFallbackMoreButton = hasOverflowActions && mainActions.length === 0;

  const getActionColor = (action: ActionButton) => {
    if (action.variant === 'icon-error') return colors.error;
    if (action.variant === 'icon-custom') return action.customColor ?? colors.primary;
    if (action.variant === 'icon-primary') return colors.primary;
    return filledBgMap[action.variant] ?? colors.primary;
  };

  return (
    <BottomActionBar style={styles.actionBar}>
      {actionLoading ? (
        <Ionicons name="hourglass-outline" size={24} color={colors.textSecondary} />
      ) : (
        <>
          {showFallbackMoreButton && (
            <View style={styles.fallbackMoreRow}>
              <TouchableOpacity
                style={[
                  styles.fallbackMoreBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setMoreVisible(true)}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel="更多操作"
              >
                <Ionicons
                  name="ellipsis-horizontal-circle-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={[styles.fallbackMoreText, { color: colors.textSecondary }]}>
                  更多操作
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {mainActions.length > 0 && (
            <View style={styles.mainRow}>
              {hasOverflowActions && (
                <TouchableOpacity
                  style={[
                    styles.inlineMoreBtn,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setMoreVisible(true)}
                  hitSlop={HIT_SLOP}
                  accessibilityRole="button"
                  accessibilityLabel="更多操作"
                >
                  <Ionicons
                    name="ellipsis-horizontal-circle-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}

              {mainActions.map((action, index) => {
                const actionColor = getActionColor(action);
                const isPrimary = index === 0;
                const isSingle = mainActions.length === 1 && !hasOverflowActions;
                return (
                  <TouchableOpacity
                    key={action.key}
                    style={[
                      styles.mainBtn,
                      isPrimary ? styles.mainBtnPrimary : styles.mainBtnSecondary,
                      isSingle ? styles.mainBtnSingle : styles.mainBtnPair,
                      isPrimary
                        ? [styles.mainBtnFilled, { backgroundColor: actionColor }]
                        : [
                            styles.mainBtnOutline,
                            {
                              backgroundColor: `${actionColor}10`,
                              borderColor: `${actionColor}24`,
                            },
                          ],
                    ]}
                    onPress={action.onPress}
                    hitSlop={HIT_SLOP}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                  >
                    <Ionicons
                      name={action.icon}
                      size={16}
                      color={isPrimary ? colors.textOnPrimary : actionColor}
                    />
                    <Text
                      style={[
                        styles.mainBtnText,
                        { color: isPrimary ? colors.textOnPrimary : actionColor },
                      ]}
                      numberOfLines={1}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <WorkOrderMoreActionsSheet
            visible={moreVisible}
            actions={overflowActions.map((action) => ({
              key: action.key,
              icon: action.icon,
              label: action.label,
              description: action.description,
              color: getActionColor(action),
              onPress: action.onPress,
            }))}
            onClose={() => setMoreVisible(false)}
          />
        </>
      )}
    </BottomActionBar>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  actionBar: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  fallbackMoreRow: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackMoreBtn: {
    minHeight: MIN_TOUCH_TARGET,
    minWidth: 128,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  fallbackMoreText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  inlineMoreBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainRow: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  mainBtn: {
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mainBtnFilled: {
    ...Shadow.sm,
  },
  mainBtnOutline: {
    borderWidth: 1,
  },
  mainBtnPrimary: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  mainBtnSecondary: {
    minWidth: 100,
    maxWidth: 132,
  },
  mainBtnSingle: {
    minWidth: 172,
    maxWidth: 220,
  },
  mainBtnPair: {
    maxWidth: '100%',
  },
  mainBtnText: {
    flexShrink: 1,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});

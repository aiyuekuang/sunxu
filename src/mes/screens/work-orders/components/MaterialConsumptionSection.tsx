import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  type MaterialReadiness,
  type MaterialReq,
  materialIssueService,
  type ProductionSupplyBizType,
  type ProductionSupplyDetail,
  type ProductionSupplyOrder,
  type ProductionSupplyStatus,
  productionSupplyService,
} from '../../../host/services';
import {
  type PlanStatus,
  type ProductionPlan,
  productionPlanService,
} from '../../../host/services';
import { workOrderService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { confirmAlert } from '../../../../core/components/ConfirmAlert.ts';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { EntityPickerModal } from '../../../../core/components/EntityPickerModal.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { ProgressBar } from '../../../../core/components/ProgressBar.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { CustomFieldValueSection } from '../../../components/custom-fields/CustomFieldValueSection.tsx';
import { isMrpEligiblePlanStatus } from '../../../constants/mrp';
import { P } from '../../../host/authorization';
import {
  ISSUE_MODE_CONFIG,
  MATERIAL_READY_STATUS_CONFIG,
  MATERIAL_REQ_QUANTITY_MODE_CONFIG,
  PLAN_STATUS_CONFIG,
  PRODUCTION_SUPPLY_BIZ_TYPE_CONFIG,
  PRODUCTION_SUPPLY_STATUS_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useAnyPermission, usePermission } from '../../../host/hooks/usePermission';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import type { RootStackParamList } from '../../../host/navigation';
import { getMaterialReqOwnerLabel } from '../../../screen-support/material-issue/utils/materialReqOwner';
import { formatShortDateTime, parseDate, today } from '../../../../core/utils/date';
import { formatNumber, roundNumber } from '../../../../core/utils/format';
import { buildMaterialIdentitySublabel } from '../../../utils/material-identity';
import { formatQtyWithUnit, formatUnitLabel, type UnitLabelMap } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

type ReadinessItem = NonNullable<MaterialReadiness['items']>[number];
type SupplyBizType = ProductionSupplyBizType;

interface MaterialReqRow extends MaterialReq {
  readiness?: ReadinessItem;
  replenishableQty: number;
  returnableQty: number;
  netIssuedQty: number;
}

interface ExecuteItemDraft {
  itemId: string;
  materialName: string;
  sourceWarehouseName: string;
  lineSideWarehouseName: string;
  plannedQty: number;
  actualQty: number;
  remainingQty: number;
  unit: string;
  batchNo: string;
  inputQty: string;
}

interface MaterialConsumptionSectionProps {
  workOrderId: string;
  workOrderStatus: string;
  materialId?: string | null;
  customerId?: string | null;
  planId?: string | null;
  planStatus?: string | null;
  hasBom: boolean;
  canViewSupply: boolean;
  canCreateSupply: boolean;
  canExecuteSupply: boolean;
  canCancelSupply: boolean;
  canReverseSupply: boolean;
  canUpdateWorkOrder: boolean;
  onViewPlan: (planId: string) => void;
  onCreatePlan: () => void;
  onViewPlanList: () => void;
  onUpdated: () => Promise<void> | void;
}

const LINKABLE_PLAN_STATUSES: PlanStatus[] = [
  'draft',
  'confirmed',
  'scheduled',
  'released',
  'in_progress',
];

const supplyBizTypeLabel = (bizType: SupplyBizType) =>
  PRODUCTION_SUPPLY_BIZ_TYPE_CONFIG[bizType].label;

const supplyStatusLabel = (status: ProductionSupplyStatus) =>
  PRODUCTION_SUPPLY_STATUS_CONFIG[status].label;

const TERMINAL_WORK_ORDER_STATUSES = ['completed', 'closed', 'cancelled'];
const INLINE_SUPPLY_PAGE_SIZE = 20;

const qty = (value?: number | string | null) => Number(value ?? 0);

function formatOptionalNumber(value?: number | string | null): string | null {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return null;
  return numberValue.toLocaleString('zh-CN', {
    maximumFractionDigits: 6,
  });
}

function buildMaterialReqCalculationSummary(
  req: MaterialReq,
  unitLabelMap: UnitLabelMap,
): string | null {
  const mode = req.quantityMode ?? 'fixed';
  const modeLabel = MATERIAL_REQ_QUANTITY_MODE_CONFIG[mode] ?? mode;
  const demandQty = formatOptionalNumber(req.demandQty);
  const demandUnit = formatUnitLabel(req.demandUnit ?? req.material?.unit, unitLabelMap);
  const demandText = demandQty ? `显示需求 ${demandQty} ${demandUnit}`.trim() : null;

  return demandText ? `${modeLabel} · ${demandText}` : modeLabel;
}

function getPlanStatusLabel(status?: string | null): string {
  return status ? (PLAN_STATUS_CONFIG[status]?.label ?? '未知状态') : '未知状态';
}

function parseQtyValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function MaterialConsumptionSection({
  workOrderId,
  workOrderStatus,
  materialId,
  customerId,
  planId,
  planStatus,
  hasBom,
  canViewSupply,
  canCreateSupply,
  canExecuteSupply,
  canCancelSupply,
  canReverseSupply,
  canUpdateWorkOrder,
  onViewPlan,
  onCreatePlan,
  onViewPlanList,
  onUpdated,
}: MaterialConsumptionSectionProps) {
  const { colors } = useTheme();
  const canViewMaterialReqs = useAnyPermission(P.MATERIAL_REQ_LIST, P.MATERIAL_REQ_VIEW);
  const canCheckMaterialReadiness = usePermission(P.MATERIAL_REQ_VIEW);
  const canAccessMrp = useAnyPermission(P.MRP_LIST, P.MRP_CALCULATE);
  const canViewPlan = usePermission(P.PLAN_VIEW);
  const canListPlan = usePermission(P.PLAN_LIST);
  const canCreatePlan = usePermission(P.PLAN_CREATE);
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [reqs, setReqs] = useState<MaterialReq[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [readiness, setReadiness] = useState<MaterialReadiness | null>(null);
  const [checking, setChecking] = useState(false);
  const [linkPlanVisible, setLinkPlanVisible] = useState(false);
  const [linking, setLinking] = useState(false);
  const [supplyOrders, setSupplyOrders] = useState<ProductionSupplyOrder[]>([]);
  const [supplyLoading, setSupplyLoading] = useState(false);
  const [supplyPage, setSupplyPage] = useState(1);
  const [supplyTotal, setSupplyTotal] = useState(0);
  const [createSupplyContext, setCreateSupplyContext] = useState<{
    bizType: SupplyBizType;
    row: MaterialReqRow;
  } | null>(null);
  const [createQty, setCreateQty] = useState('');
  const [createBatchNo, setCreateBatchNo] = useState('');
  const [createRemarks, setCreateRemarks] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [executeOrder, setExecuteOrder] = useState<ProductionSupplyOrder | null>(null);
  const [executeDetail, setExecuteDetail] = useState<ProductionSupplyDetail | null>(null);
  const [executeDrafts, setExecuteDrafts] = useState<ExecuteItemDraft[]>([]);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeSubmitting, setExecuteSubmitting] = useState(false);
  const [reverseSupplyOrder, setReverseSupplyOrder] = useState<ProductionSupplyOrder | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  useEffect(() => {
    if (!createSupplyContext) {
      setCreateQty('');
      setCreateBatchNo('');
      setCreateRemarks('');
      return;
    }
    const maxQty =
      createSupplyContext.bizType === 'replenish'
        ? createSupplyContext.row.replenishableQty
        : createSupplyContext.row.returnableQty;
    setCreateQty(maxQty > 0 ? String(roundNumber(maxQty, 4)) : '');
    setCreateBatchNo('');
    setCreateRemarks('');
  }, [createSupplyContext]);

  const loadReqs = useCallback(
    async ({
      showLoading = false,
      silentError = false,
    }: {
      showLoading?: boolean;
      silentError?: boolean;
    } = {}) => {
      if (!canViewMaterialReqs) {
        setReqs([]);
        return [];
      }
      if (showLoading) setLoading(true);
      try {
        const list = await materialIssueService.getMaterialReqs(workOrderId);
        setReqs(list);
        return list;
      } catch (e: unknown) {
        if (!silentError) {
          toast.error(e instanceof Error ? e.message : '加载物料需求失败');
        }
        return [];
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [canViewMaterialReqs, workOrderId],
  );

  const loadReadiness = useCallback(
    async ({
      showLoading = false,
      silentError = false,
    }: {
      showLoading?: boolean;
      silentError?: boolean;
    } = {}) => {
      if (!canCheckMaterialReadiness) {
        setReadiness(null);
        return null;
      }
      if (showLoading) setChecking(true);
      try {
        const result = await materialIssueService.checkReadiness(workOrderId);
        setReadiness(result);
        return result;
      } catch (e: unknown) {
        if (!silentError) {
          toast.error(e instanceof Error ? e.message : '齐套检查失败');
        }
        return null;
      } finally {
        if (showLoading) setChecking(false);
      }
    },
    [canCheckMaterialReadiness, workOrderId],
  );

  const loadSupplyOrders = useCallback(
    async ({
      showLoading = false,
      silentError = false,
      page = 1,
      append = false,
    }: {
      showLoading?: boolean;
      silentError?: boolean;
      page?: number;
      append?: boolean;
    } = {}) => {
      if (!canViewSupply) {
        setSupplyOrders([]);
        setSupplyPage(1);
        setSupplyTotal(0);
        return [];
      }
      if (showLoading) setSupplyLoading(true);
      try {
        const result = await productionSupplyService.list({
          workOrderId,
          page,
          pageSize: INLINE_SUPPLY_PAGE_SIZE,
        });
        setSupplyOrders((current) => (append ? [...current, ...result.list] : result.list));
        setSupplyPage(page);
        setSupplyTotal(result.total);
        return result.list;
      } catch (e: unknown) {
        if (!silentError) {
          toast.error(e instanceof Error ? e.message : '加载供料单失败');
        }
        return [];
      } finally {
        if (showLoading) setSupplyLoading(false);
      }
    },
    [canViewSupply, workOrderId],
  );

  const refreshMaterialContext = useCallback(
    async ({
      showLoading = false,
      silentError = false,
    }: {
      showLoading?: boolean;
      silentError?: boolean;
    } = {}) => {
      await Promise.all([
        loadReqs({ showLoading, silentError }),
        loadReadiness({ showLoading, silentError }),
        loadSupplyOrders({ showLoading, silentError }),
      ]);
    },
    [loadReadiness, loadReqs, loadSupplyOrders],
  );

  useEffect(() => {
    if (!hasBom) {
      setSupplyOrders([]);
      setSupplyPage(1);
      setSupplyTotal(0);
      return;
    }
    void refreshMaterialContext({ showLoading: true, silentError: true });
  }, [hasBom, refreshMaterialContext]);

  const refreshAfterMutation = async (successMessage: string) => {
    toast.success(successMessage);
    await Promise.resolve(onUpdated());
    await refreshMaterialContext({ silentError: true });
  };

  const handleCheckReadiness = async () => {
    await refreshMaterialContext({ showLoading: true });
  };

  const handleLoadMoreSupplyOrders = async () => {
    if (supplyLoading || supplyOrders.length >= supplyTotal) {
      return;
    }
    await loadSupplyOrders({
      showLoading: true,
      silentError: false,
      page: supplyPage + 1,
      append: true,
    });
  };

  const handleLinkPlan = async (plan: ProductionPlan | undefined) => {
    if (!plan || !canUpdateWorkOrder || !canListPlan) return;
    setLinking(true);
    try {
      await workOrderService.update({ id: workOrderId, planId: plan.id });
      toast.success(`已关联生产计划 ${plan.planNo}`);
      await onUpdated();
      await refreshMaterialContext({ silentError: true });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '关联生产计划失败');
    } finally {
      setLinking(false);
    }
  };

  const openExecuteModal = async (order: ProductionSupplyOrder) => {
    setExecuteOrder(order);
    setExecuteDetail(null);
    setExecuteDrafts([]);
    setExecuteLoading(true);
    try {
      const detail = await productionSupplyService.detail(order.id);
      const drafts = (detail.items ?? []).map((item) => ({
        itemId: item.id,
        materialName: item.material?.name ?? item.materialId,
        sourceWarehouseName: item.sourceWarehouse?.name ?? '-',
        lineSideWarehouseName: item.lineSideWarehouse?.name ?? '-',
        plannedQty: qty(item.plannedQty),
        actualQty: qty(item.actualQty),
        remainingQty: roundNumber(Math.max(0, qty(item.plannedQty) - qty(item.actualQty)), 4),
        unit: item.material?.unit ?? '',
        batchNo: item.batchNo ?? '',
        inputQty: String(roundNumber(Math.max(0, qty(item.plannedQty) - qty(item.actualQty)), 4)),
      }));
      setExecuteDetail(detail);
      setExecuteDrafts(drafts);
    } catch (e: unknown) {
      setExecuteOrder(null);
      toast.error(e instanceof Error ? e.message : '加载供料单详情失败');
    } finally {
      setExecuteLoading(false);
    }
  };

  const closeExecuteModal = () => {
    setExecuteOrder(null);
    setExecuteDetail(null);
    setExecuteDrafts([]);
  };

  const handleCancelSupply = (order: ProductionSupplyOrder) => {
    confirmAlert(
      '取消供料单',
      '取消后未执行部分的补料预留会释放，是否继续？',
      async () => {
        try {
          await productionSupplyService.cancel(order.id);
          await refreshAfterMutation('供料单已取消');
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : '取消供料单失败');
        }
      },
      '确认取消',
      true,
      undefined,
      false,
      '先不取消',
    );
  };

  const handleReverseSupply = async () => {
    if (!reverseSupplyOrder) return;
    const reason = reverseReason.trim();
    if (!reason) {
      toast.info('请输入冲正原因');
      return;
    }
    try {
      await productionSupplyService.reverse({
        id: reverseSupplyOrder.id,
        businessDate: today(),
        reason,
      });
      setReverseSupplyOrder(null);
      setReverseReason('');
      await refreshAfterMutation('供料单已冲正，库存流水已生成反向事实');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '冲正供料单失败');
    }
  };

  const canRunMrp = canAccessMrp && !!planId && isMrpEligiblePlanStatus(planStatus);
  const canEditPlanRelation = workOrderStatus === 'draft' || workOrderStatus === 'released';
  const canLinkPlan = canUpdateWorkOrder && canListPlan && canEditPlanRelation;
  const canOperateSupply =
    canCreateSupply && !TERMINAL_WORK_ORDER_STATUSES.includes(workOrderStatus);
  const linkPlanDisabledReason = linking
    ? '正在关联生产计划，请稍候'
    : !materialId
      ? '当前工单缺少生产物料，无法关联生产计划'
      : undefined;
  const shortageCount = readiness?.items.filter((i) => !i.sufficient).length ?? 0;
  const shortageHint = !planId
    ? canEditPlanRelation
      ? '当前工单未关联生产计划，需先补关联后再处理物料缺口。'
      : '当前工单状态不支持补关联计划，请到生产计划侧处理缺料。'
    : canRunMrp
      ? '缺料已定位到关联计划，可从计划侧继续处理。'
      : `关联计划当前为「${getPlanStatusLabel(planStatus)}」，需先在计划侧满足 MRP 条件。`;

  const fetchLinkablePlans = async (params: {
    page: number;
    pageSize: number;
    keyword?: string;
  }) => {
    if (!canListPlan) return { list: [], total: 0 };
    const result = await productionPlanService.list({
      ...params,
      materialId: materialId ?? undefined,
      statuses: LINKABLE_PLAN_STATUSES,
    });

    const sortedList = [...result.list].sort((left, right) => {
      const leftCustomerRank =
        customerId && (left.customerId === customerId || left.customer?.id === customerId) ? 0 : 1;
      const rightCustomerRank =
        customerId && (right.customerId === customerId || right.customer?.id === customerId)
          ? 0
          : 1;
      if (leftCustomerRank !== rightCustomerRank) return leftCustomerRank - rightCustomerRank;

      const leftStart = parseDate(left.planStartDate)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
      const rightStart = parseDate(right.planStartDate)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
      if (leftStart !== rightStart) return leftStart - rightStart;

      return Number(right.priority ?? 0) - Number(left.priority ?? 0);
    });

    return { ...result, list: sortedList };
  };

  const readinessMap = useMemo(
    () => new Map((readiness?.items ?? []).map((item) => [item.materialReqId, item])),
    [readiness],
  );

  const mergedReqs = useMemo<MaterialReqRow[]>(
    () =>
      reqs.map((req) => {
        const readinessItem = readinessMap.get(req.id);
        const netRequired = roundNumber(
          Math.max(
            0,
            qty(readinessItem?.netRequired) ||
              qty(req.requiredQty) -
                qty(req.issuedQty) +
                qty((req as { returnedQty?: number }).returnedQty),
          ),
          4,
        );
        const lineSideAvailable = qty(readinessItem?.lineSideAvailable);
        const pendingSupplyQty = qty(readinessItem?.pendingSupplyQty);
        const pendingReturnQty = qty(readinessItem?.pendingReturnQty);
        const netIssuedQty = roundNumber(Math.max(0, qty(req.requiredQty) - netRequired), 4);
        return {
          ...req,
          readiness: readinessItem,
          netIssuedQty,
          replenishableQty:
            req.issueMode === 'staged'
              ? roundNumber(Math.max(0, netRequired - lineSideAvailable - pendingSupplyQty), 4)
              : 0,
          returnableQty:
            req.issueMode === 'staged'
              ? roundNumber(Math.max(0, lineSideAvailable - pendingReturnQty), 4)
              : 0,
        };
      }),
    [reqs, readinessMap],
  );

  const displayReqs = expanded ? mergedReqs : mergedReqs.slice(0, 3);
  const hasMore = mergedReqs.length > 3;

  const currentCreateMax =
    createSupplyContext?.bizType === 'replenish'
      ? createSupplyContext.row.replenishableQty
      : (createSupplyContext?.row.returnableQty ?? 0);

  if (!hasBom || (!canViewMaterialReqs && !canCheckMaterialReadiness && !canViewSupply)) {
    return null;
  }

  const handleSubmitCreateSupply = async () => {
    if (!createSupplyContext) return;
    const plannedQty = parseQtyValue(createQty);
    if (plannedQty <= 0) {
      toast.error('请输入大于 0 的数量');
      return;
    }
    if (plannedQty > currentCreateMax) {
      toast.error(
        `数量不能超过当前允许值 ${formatNumber(currentCreateMax, {
          fallback: '0',
          maximumFractionDigits: 4,
        })}`,
      );
      return;
    }

    setCreateSubmitting(true);
    try {
      await productionSupplyService.create({
        bizType: createSupplyContext.bizType,
        workOrderId,
        items: [
          {
            materialReqId: createSupplyContext.row.id,
            plannedQty,
            batchNo: createBatchNo.trim() || undefined,
          },
        ],
        remarks: createRemarks.trim() || undefined,
      });
      setCreateSupplyContext(null);
      await refreshAfterMutation(`${supplyBizTypeLabel(createSupplyContext.bizType)}供料单已创建`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '创建供料单失败');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleSubmitExecuteSupply = async () => {
    if (!executeDetail) return;
    const items = executeDrafts
      .map((item) => ({
        itemId: item.itemId,
        actualQty: parseQtyValue(item.inputQty),
        batchNo: item.batchNo.trim() || undefined,
        remainingQty: item.remainingQty,
      }))
      .filter((item) => item.actualQty > 0);

    if (items.length === 0) {
      toast.error('请至少填写一条执行数量');
      return;
    }

    const invalid = items.find((item) => item.actualQty > item.remainingQty);
    if (invalid) {
      toast.error('执行数量不能超过剩余数量');
      return;
    }

    setExecuteSubmitting(true);
    try {
      await productionSupplyService.execute({
        id: executeDetail.id,
        items: items.map(({ itemId, actualQty, batchNo }) => ({
          itemId,
          actualQty,
          batchNo,
        })),
      });
      closeExecuteModal();
      await refreshAfterMutation('供料单已执行');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '执行供料单失败');
    } finally {
      setExecuteSubmitting(false);
    }
  };

  return (
    <DetailCard
      title="物料消耗"
      noPadding
      right={
        canCheckMaterialReadiness && mergedReqs.length > 0 ? (
          <TouchableOpacity
            onPress={() => void handleCheckReadiness()}
            disabled={checking || supplyLoading || loading}
            style={[styles.checkBtn, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
            <Text style={[styles.checkBtnText, { color: colors.primary }]}>
              {checking || supplyLoading || loading ? '刷新中...' : '投入物料齐套检查'}
            </Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      {readiness && (
        <View
          style={[
            styles.readinessBanner,
            {
              backgroundColor: readiness.ready ? colors.successLight : colors.warningLight,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.readinessRow}>
            <Ionicons
              name={readiness.ready ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={readiness.ready ? colors.success : colors.warning}
            />
            <Text
              style={[
                styles.readinessText,
                { color: readiness.ready ? colors.success : colors.warning },
              ]}
            >
              {readiness.ready
                ? '生产投入物料齐套'
                : readiness.message || `${shortageCount} 种生产投入物料不足`}
            </Text>
          </View>
          {readiness.ready && (
            <Text style={[styles.readinessHint, { color: colors.textSecondary }]}>
              按本工单 BOM
              投入物料及指定仓库可领用库存判断；本工单要生产的产出物料库存不参与齐套判断。
            </Text>
          )}
          {!readiness.ready && (
            <>
              <Text style={[styles.readinessHint, { color: colors.textSecondary }]}>
                {shortageHint}
              </Text>
              <View style={styles.actionRow}>
                {canRunMrp && !!planId && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
                    ]}
                    onPress={() => navigation.navigate('Mrp', { planId: planId ?? undefined })}
                  >
                    <Ionicons name="calculator-outline" size={14} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>运行 MRP</Text>
                  </TouchableOpacity>
                )}

                {!!planId && canViewPlan && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                    onPress={() => onViewPlan(planId)}
                  >
                    <Ionicons name="document-text-outline" size={14} color={colors.text} />
                    <Text style={[styles.actionBtnText, { color: colors.text }]}>查看计划</Text>
                  </TouchableOpacity>
                )}

                {!!planId && !canViewPlan && canListPlan && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                    onPress={onViewPlanList}
                  >
                    <Ionicons name="arrow-forward-circle-outline" size={14} color={colors.text} />
                    <Text style={[styles.actionBtnText, { color: colors.text }]}>去生产计划</Text>
                  </TouchableOpacity>
                )}

                {!planId && canLinkPlan && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {
                        borderColor: colors.primary,
                        backgroundColor: linkPlanDisabledReason
                          ? colors.surfaceSecondary
                          : `${colors.primary}12`,
                        opacity: linkPlanDisabledReason ? 0.75 : 1,
                      },
                    ]}
                    onPress={() => setLinkPlanVisible(true)}
                    disabled={Boolean(linkPlanDisabledReason)}
                    accessibilityState={{ disabled: Boolean(linkPlanDisabledReason) }}
                    accessibilityHint={linkPlanDisabledReason}
                  >
                    <Ionicons
                      name="link-outline"
                      size={14}
                      color={linkPlanDisabledReason ? colors.textMuted : colors.primary}
                    />
                    <Text
                      style={[
                        styles.actionBtnText,
                        {
                          color: linkPlanDisabledReason ? colors.textMuted : colors.primary,
                        },
                      ]}
                    >
                      {linking
                        ? '关联中...'
                        : linkPlanDisabledReason
                          ? '关联计划（不可用）'
                          : '关联计划'}
                    </Text>
                  </TouchableOpacity>
                )}

                {!planId && canEditPlanRelation && canCreatePlan && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                    onPress={onCreatePlan}
                  >
                    <Ionicons name="add-circle-outline" size={14} color={colors.text} />
                    <Text style={[styles.actionBtnText, { color: colors.text }]}>新增计划</Text>
                  </TouchableOpacity>
                )}

                {!planId && canEditPlanRelation && !canLinkPlan && canListPlan && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                    onPress={onViewPlanList}
                  >
                    <Ionicons name="arrow-forward-circle-outline" size={14} color={colors.text} />
                    <Text style={[styles.actionBtnText, { color: colors.text }]}>去生产计划</Text>
                  </TouchableOpacity>
                )}

                {!planId && !canEditPlanRelation && canListPlan && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                    onPress={onViewPlanList}
                  >
                    <Ionicons name="arrow-forward-circle-outline" size={14} color={colors.text} />
                    <Text style={[styles.actionBtnText, { color: colors.text }]}>去生产计划</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      )}

      {loading && <InlineLoading />}
      {!loading && mergedReqs.length === 0 && (
        <EmptyState compact icon="cube-outline" title="暂无物料需求" />
      )}
      {!loading && mergedReqs.length > 0 && (
        <View style={styles.list}>
          {displayReqs.map((req) => {
            const sufficient = qty(req.netIssuedQty) >= qty(req.requiredQty);
            const readyStatus = req.readiness?.readyStatus;
            const readyText = readyStatus
              ? (MATERIAL_READY_STATUS_CONFIG[readyStatus]?.label ?? '未知状态')
              : '未检查';
            const readyColor = readyStatus
              ? (MATERIAL_READY_STATUS_CONFIG[readyStatus]?.color ?? colors.textSecondary)
              : colors.textSecondary;
            const calculationSummary = buildMaterialReqCalculationSummary(req, unitLabelMap);

            return (
              <View key={req.id} style={[styles.row, { borderBottomColor: colors.border }]}>
                <View style={styles.rowHeader}>
                  <View style={styles.rowTitleWrap}>
                    <Text style={[styles.matName, { color: colors.text }]} numberOfLines={1}>
                      {req.material?.name ?? '-'}
                    </Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {req.material
                        ? buildMaterialIdentitySublabel(req.material, unitLabelMap)
                        : '未编码'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: `${readyColor}14`, borderColor: `${readyColor}30` },
                    ]}
                  >
                    <Text style={[styles.statusPillText, { color: readyColor }]}>{readyText}</Text>
                  </View>
                </View>

                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  来源仓：{req.warehouse?.name ?? '-'}
                </Text>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  库存货主：{getMaterialReqOwnerLabel(req)}
                </Text>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  供料策略：{ISSUE_MODE_CONFIG[req.issueMode ?? 'direct']?.label ?? '直接供料'}
                </Text>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  线边仓：{req.lineSideWarehouse?.name ?? '-'}
                </Text>
                {calculationSummary ? (
                  <Text style={[styles.metaText, { color: colors.primary }]}>
                    计算：{calculationSummary}
                  </Text>
                ) : null}

                <View style={styles.metricWrap}>
                  <MetricPill
                    label="需求"
                    value={formatQtyWithUnit(req.requiredQty, req.material?.unit, unitLabelMap)}
                  />
                  <MetricPill
                    label="净已领"
                    value={formatQtyWithUnit(req.netIssuedQty, req.material?.unit, unitLabelMap)}
                  />
                  <MetricPill
                    label="主口径可用"
                    value={req.readiness ? String(qty(req.readiness.sourceAvailable)) : '—'}
                  />
                  <MetricPill
                    label="线边可用"
                    value={
                      req.issueMode === 'staged' && req.readiness
                        ? String(qty(req.readiness.lineSideAvailable))
                        : '—'
                    }
                  />
                  <MetricPill
                    label="待执行补料"
                    value={
                      req.issueMode === 'staged' && req.readiness
                        ? String(qty(req.readiness.pendingSupplyQty))
                        : '—'
                    }
                  />
                  <MetricPill
                    label="待执行退回"
                    value={
                      req.issueMode === 'staged' && req.readiness
                        ? String(qty(req.readiness.pendingReturnQty))
                        : '—'
                    }
                  />
                </View>

                <ProgressBar
                  current={qty(req.netIssuedQty)}
                  target={qty(req.requiredQty)}
                  height={3}
                  activeColor={sufficient ? colors.success : colors.warning}
                />

                {req.readiness?.nextActionHint ? (
                  <Text style={[styles.mutedText, { color: colors.textSecondary }]}>
                    下一步：{req.readiness.nextActionHint}
                  </Text>
                ) : null}

                {req.issueMode === 'staged' && canOperateSupply ? (
                  <View style={styles.actionRow}>
                    {req.replenishableQty > 0 ? (
                      <ActionChip
                        icon="swap-vertical-outline"
                        label="补料"
                        onPress={() => setCreateSupplyContext({ bizType: 'replenish', row: req })}
                      />
                    ) : null}
                    {req.returnableQty > 0 ? (
                      <ActionChip
                        icon="return-up-back-outline"
                        label="退回"
                        onPress={() => setCreateSupplyContext({ bizType: 'return', row: req })}
                      />
                    ) : null}
                    {req.replenishableQty <= 0 && req.returnableQty <= 0 ? (
                      <Text style={[styles.mutedText, { color: colors.textSecondary }]}>
                        当前无需补退
                      </Text>
                    ) : null}
                  </View>
                ) : req.issueMode === 'staged' && canCreateSupply ? (
                  <Text style={[styles.mutedText, { color: colors.textSecondary }]}>
                    工单已收尾，不能再创建补退单
                  </Text>
                ) : req.issueMode === 'staged' ? (
                  <Text style={[styles.mutedText, { color: colors.textSecondary }]}>
                    无补退单创建权限
                  </Text>
                ) : null}
              </View>
            );
          })}

          {hasMore && (
            <TouchableOpacity style={styles.moreBtn} onPress={() => setExpanded((v) => !v)}>
              <Text style={[styles.moreText, { color: colors.primary }]}>
                {expanded ? '收起' : `查看全部 ${mergedReqs.length} 项`}
              </Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {canViewSupply && (
        <View style={[styles.supplySection, { borderTopColor: colors.border }]}>
          <View style={styles.supplyHeader}>
            <Text style={[styles.supplyTitle, { color: colors.text }]}>线边补退料单</Text>
            <Text style={[styles.supplyHint, { color: colors.textSecondary }]}>
              未完成补退单会阻断工单收尾
            </Text>
          </View>

          {supplyLoading && <InlineLoading />}
          {!supplyLoading && supplyOrders.length === 0 && (
            <EmptyState compact icon="albums-outline" title="当前工单暂无线边补退料单" />
          )}
          {!supplyLoading && supplyOrders.length > 0 && (
            <View style={styles.orderList}>
              {supplyOrders.map((order) => {
                const statusColor =
                  order.status === 'completed'
                    ? colors.success
                    : order.status === 'partial'
                      ? colors.warning
                      : order.status === 'submitted'
                        ? colors.primary
                        : order.status === 'reversed'
                          ? colors.textMuted
                          : colors.textSecondary;
                const canExecute =
                  canExecuteSupply && ['submitted', 'partial'].includes(order.status);
                const canCancel =
                  canCancelSupply && !['completed', 'cancelled'].includes(order.status);
                const canReverse =
                  canReverseSupply && (order.availableActions ?? []).includes('reverse');

                return (
                  <View
                    key={order.id}
                    style={[
                      styles.orderCard,
                      { borderColor: colors.border, backgroundColor: colors.surface },
                    ]}
                  >
                    <View style={styles.orderHeader}>
                      <View style={styles.flex1}>
                        <Text style={[styles.orderNo, { color: colors.text }]}>
                          {order.supplyNo}
                        </Text>
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                          {supplyBizTypeLabel(order.bizType)} ·{' '}
                          {order.operation
                            ? `${order.operation.sequence}. ${order.operation.operationName}`
                            : '整单通用'}{' '}
                          · {formatShortDateTime(order.createdAt)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: `${statusColor}14`, borderColor: `${statusColor}30` },
                        ]}
                      >
                        <Text style={[styles.statusPillText, { color: statusColor }]}>
                          {supplyStatusLabel(order.status)}
                        </Text>
                      </View>
                    </View>

                    {order.remarks ? (
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        备注：{order.remarks}
                      </Text>
                    ) : null}

                    {(canExecute || canCancel || canReverse) && (
                      <View style={styles.actionRow}>
                        {canExecute ? (
                          <ActionChip
                            icon="play-circle-outline"
                            label="执行"
                            onPress={() => void openExecuteModal(order)}
                          />
                        ) : null}
                        {canCancel ? (
                          <ActionChip
                            icon="close-circle-outline"
                            label="取消"
                            onPress={() => handleCancelSupply(order)}
                            danger
                          />
                        ) : null}
                        {canReverse ? (
                          <ActionChip
                            icon="arrow-undo-outline"
                            label="冲正"
                            onPress={() => {
                              setReverseReason('');
                              setReverseSupplyOrder(order);
                            }}
                            danger
                          />
                        ) : null}
                      </View>
                    )}
                  </View>
                );
              })}
              {supplyOrders.length < supplyTotal && (
                <TouchableOpacity
                  style={styles.moreBtn}
                  onPress={() => void handleLoadMoreSupplyOrders()}
                >
                  <Text style={[styles.moreText, { color: colors.primary }]}>
                    {`加载更多补退单（${supplyOrders.length}/${supplyTotal}）`}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      <EntityPickerModal<ProductionPlan>
        visible={linkPlanVisible}
        title="关联生产计划"
        fetchFn={fetchLinkablePlans}
        keyExtractor={(plan) => plan.id}
        labelExtractor={(plan) => `${plan.planNo} · ${plan.material?.name ?? '未命名计划'}`}
        sublabelExtractor={(plan) =>
          [
            plan.customer?.name ?? '无客户',
            plan.planStartDate ?? '系统排程计算',
            `优先级 ${plan.priority ?? '-'}`,
          ].join(' · ')
        }
        renderExtra={(plan) => (
          <View
            style={[
              styles.planStatusPill,
              { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` },
            ]}
          >
            <Text style={[styles.planStatusText, { color: colors.primary }]}>
              {getPlanStatusLabel(plan.status)}
            </Text>
          </View>
        )}
        onClose={() => setLinkPlanVisible(false)}
        onConfirm={(items) => {
          void handleLinkPlan(items[0]);
        }}
      />

      <FullScreenModal
        visible={!!createSupplyContext}
        onClose={() => setCreateSupplyContext(null)}
        title={
          createSupplyContext
            ? `${supplyBizTypeLabel(createSupplyContext.bizType)}供料单`
            : '供料单'
        }
        subtitle="当前入口按单条物料需求创建补料 / 退回单，执行后会同步刷新齐套和补退单状态。"
        confirmText="提交"
        onConfirm={() => void handleSubmitCreateSupply()}
        loading={createSubmitting}
        avoidKeyboard
      >
        {createSupplyContext ? (
          <>
            <View style={[styles.modalInfoCard, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {createSupplyContext.row.material?.name ?? '-'}
              </Text>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                来源仓：{createSupplyContext.row.warehouse?.name ?? '-'}
              </Text>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                库存货主：{getMaterialReqOwnerLabel(createSupplyContext.row)}
              </Text>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                线边仓：{createSupplyContext.row.lineSideWarehouse?.name ?? '-'}
              </Text>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                当前最多可{supplyBizTypeLabel(createSupplyContext.bizType)}{' '}
                {formatQtyWithUnit(
                  currentCreateMax,
                  createSupplyContext.row.material?.unit,
                  unitLabelMap,
                )}
              </Text>
            </View>

            <QuickNumInput
              label="计划数量"
              value={createQty}
              onChangeText={setCreateQty}
              min={0}
              max={currentCreateMax}
              precision={4}
              unit={formatUnitLabel(createSupplyContext.row.material?.unit, unitLabelMap)}
              hint={`最多 ${formatNumber(currentCreateMax, {
                fallback: '0',
                maximumFractionDigits: 4,
              })}`}
            />
            <ScanInput
              label="投料批号"
              value={createBatchNo}
              onChangeText={setCreateBatchNo}
              placeholder="选填，可扫码录入"
            />
            <FormField
              label="备注"
              value={createRemarks}
              onChangeText={setCreateRemarks}
              placeholder="可选"
              multiline
              numberOfLines={4}
            />
          </>
        ) : null}
      </FullScreenModal>

      <FullScreenModal
        visible={!!executeOrder}
        onClose={closeExecuteModal}
        title={executeOrder ? `执行 ${executeOrder.supplyNo}` : '执行供料单'}
        subtitle="只允许执行当前未完成数量，执行完成后会更新工单齐套结果。"
        confirmText="执行"
        onConfirm={() => void handleSubmitExecuteSupply()}
        loading={executeSubmitting}
        avoidKeyboard
      >
        {executeLoading || !executeDetail ? (
          <InlineLoading />
        ) : executeDrafts.length === 0 ? (
          <>
            <CustomFieldValueSection objectType="production_supply" objectId={executeDetail.id} />
            <EmptyState compact icon="checkmark-done-outline" title="当前供料单已无可执行数量" />
          </>
        ) : (
          <>
            <CustomFieldValueSection objectType="production_supply" objectId={executeDetail.id} />
            {executeDrafts.map((item, index) => (
              <View
                key={item.itemId}
                style={[styles.modalInfoCard, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.modalTitle, { color: colors.text }]}>{item.materialName}</Text>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  来源仓：{item.sourceWarehouseName}，线边仓：{item.lineSideWarehouseName}
                </Text>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  计划 {formatNumber(item.plannedQty, { fallback: '0', maximumFractionDigits: 4 })}
                  ，已执行{' '}
                  {formatNumber(item.actualQty, {
                    fallback: '0',
                    maximumFractionDigits: 4,
                  })}
                  ，剩余{' '}
                  {formatNumber(item.remainingQty, { fallback: '0', maximumFractionDigits: 4 })}
                </Text>

                <QuickNumInput
                  label="本次执行数量"
                  value={item.inputQty}
                  onChangeText={(text) =>
                    setExecuteDrafts((prev) =>
                      prev.map((draft, draftIndex) =>
                        draftIndex === index ? { ...draft, inputQty: text } : draft,
                      ),
                    )
                  }
                  min={0}
                  max={item.remainingQty}
                  precision={4}
                  unit={formatUnitLabel(item.unit, unitLabelMap)}
                />
                <ScanInput
                  label="投料批号"
                  value={item.batchNo}
                  onChangeText={(text) =>
                    setExecuteDrafts((prev) =>
                      prev.map((draft, draftIndex) =>
                        draftIndex === index ? { ...draft, batchNo: text } : draft,
                      ),
                    )
                  }
                  placeholder="选填，可扫码录入"
                />
              </View>
            ))}
          </>
        )}
      </FullScreenModal>

      <FullScreenModal
        visible={!!reverseSupplyOrder}
        onClose={() => setReverseSupplyOrder(null)}
        title={reverseSupplyOrder ? `冲正 ${reverseSupplyOrder.supplyNo}` : '冲正供料单'}
        subtitle="系统会校验库存可回退、来源仓可重新预留；原单和原库存流水会保留。"
        confirmText="确认冲正"
        onConfirm={() => void handleReverseSupply()}
        avoidKeyboard
      >
        <FormField
          label="冲正原因"
          required
          value={reverseReason}
          onChangeText={setReverseReason}
          placeholder="请输入冲正原因"
          multiline
          numberOfLines={4}
        />
      </FullScreenModal>
    </DetailCard>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.metricPill,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function ActionChip({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  const color = danger ? colors.error : colors.primary;
  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        {
          borderColor: `${color}30`,
          backgroundColor: `${color}12`,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.actionBtnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
  },
  checkBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
  readinessBanner: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  readinessText: { fontSize: FontSize.sm, fontWeight: '600' },
  readinessHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.base },
  row: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  rowTitleWrap: {
    flex: 1,
    gap: 2,
  },
  matName: { fontSize: FontSize.base, fontWeight: '600' },
  metaText: { fontSize: FontSize.xs, lineHeight: 18 },
  statusPill: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  metricWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 2,
  },
  metricPill: {
    minWidth: 92,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  metricLabel: {
    fontSize: FontSize.xs,
  },
  metricValue: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  mutedText: {
    fontSize: FontSize.xs,
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  moreText: { fontSize: FontSize.xs, fontWeight: '500' },
  supplySection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  supplyHeader: {
    gap: 2,
  },
  supplyTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  supplyHint: {
    fontSize: FontSize.xs,
  },
  orderList: {
    gap: Spacing.sm,
  },
  orderCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  orderNo: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  modalInfoCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  modalTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  planStatusPill: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  planStatusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});

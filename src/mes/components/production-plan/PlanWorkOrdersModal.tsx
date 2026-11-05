import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { type WorkOrderDetail, workOrderService } from '../../host/services';
import type { PlanWorkOrderItemDto } from '../../host/services';
import { productionPlanService } from '../../host/services';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../core/components/Badge.tsx';
import { DetailCard, InfoRow } from '../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../core/components/EmptyState.tsx';
import { InlineLoading, LoadingView } from '../../../core/components/LoadingView.tsx';
import { WORK_ORDER_STATUS_CONFIG } from '../../constants/status-configs';
import { FontSize, Radius, Shadow, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import { useUnitDisplay } from '../../host/hooks/useUnitDisplay';
import {
  getDisplayCompletedQty,
  getDisplayScrappedQty,
} from '../../screen-support/work-orders/work-order-metrics';
import { formatDate } from '../../../core/utils/date';
import { formatNumber } from '../../../core/utils/format';
import {
  getMaterialCode,
  getMaterialName,
  getMaterialSpec,
  getMaterialUnit,
} from '../../utils/material-identity';
import { formatQtyWithUnit, formatUnitLabel, type UnitLabelMap } from '../../utils/qty-unit';
import { toast, toastConfig } from '../../../core/toast';

/**
 * 生产计划关联工单列表弹窗
 *
 * 点击工单后在 Modal 内部切换到详情视图（只读预览），
 * 不做路由导航，避免 RN Modal 原生窗口层级遮挡问题。
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanWorkOrdersModalProps {
  visible: boolean;
  planId: string | null;
  planNo?: string;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlanWorkOrdersModal({
  visible,
  planId,
  planNo,
  onClose,
}: PlanWorkOrdersModalProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const insets = useSafeAreaInsets();
  const [workOrders, setWorkOrders] = useState<PlanWorkOrderItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Detail view state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<WorkOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadWorkOrders = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const result = await productionPlanService.getWorkOrders(planId);
      setWorkOrders(result.workOrders || []);
    } catch (error) {
      toast.error((error as Error)?.message ?? '加载工单列表失败');
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    if (visible && planId) {
      loadWorkOrders();
    }
    if (!visible) {
      setSelectedId(null);
      setDetail(null);
    }
  }, [visible, planId, loadWorkOrders]);

  const handleViewWorkOrder = useCallback(async (workOrderId: string) => {
    setSelectedId(workOrderId);
    setDetailLoading(true);
    try {
      const data = await workOrderService.detail(workOrderId);
      setDetail(data as unknown as WorkOrderDetail);
    } catch (error) {
      toast.error((error as Error)?.message ?? '加载工单详情失败');
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleBack = () => {
    setSelectedId(null);
    setDetail(null);
  };

  const handleClose = () => {
    setSelectedId(null);
    setDetail(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={selectedId ? handleBack : handleClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: Platform.OS === 'android' ? insets.top : 0,
          },
        ]}
      >
        {selectedId ? (
          <DetailView
            detail={detail}
            loading={detailLoading}
            unitLabelMap={unitLabelMap}
            onBack={handleBack}
            onClose={handleClose}
          />
        ) : (
          <ListView
            workOrders={workOrders}
            loading={loading}
            planNo={planNo}
            onClose={handleClose}
            onViewWorkOrder={handleViewWorkOrder}
          />
        )}

        <Toast config={toastConfig} topOffset={Math.max(insets.top, Spacing.base) + Spacing.sm} />
      </View>
    </Modal>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({
  workOrders,
  loading,
  planNo,
  onClose,
  onViewWorkOrder,
}: {
  workOrders: PlanWorkOrderItemDto[];
  loading: boolean;
  planNo?: string;
  onClose: () => void;
  onViewWorkOrder: (id: string) => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const getStatusColor = (status: string) => {
    const cfg = WORK_ORDER_STATUS_CONFIG[status];
    return cfg?.color ?? colors.textSecondary;
  };

  return (
    <>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>关联工单列表</Text>
          {planNo && (
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{planNo}</Text>
          )}
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <InlineLoading />
        </View>
      ) : workOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="document-outline"
            title="暂无工单"
            description="该生产计划尚未创建工单"
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: insets.bottom + Spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {workOrders.map((wo) => (
            <TouchableOpacity
              key={wo.id}
              style={[styles.workOrderItem, { backgroundColor: colors.surface }]}
              onPress={() => onViewWorkOrder(wo.id)}
              activeOpacity={0.7}
            >
              <View style={styles.row}>
                <Text style={[styles.workOrderNo, { color: colors.text }]}>{wo.workOrderNo}</Text>
                <View style={styles.headerRight}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(wo.status)}15` },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(wo.status) }]}>
                      {wo.statusLabel}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </View>
              </View>

              <View style={styles.qtyRow}>
                <Text style={[styles.qtyText, { color: colors.textSecondary }]}>
                  投产: {formatNumber(wo.plannedQty, { maximumFractionDigits: 4 })}
                </Text>
                <Text style={[styles.qtyText, { color: colors.textSecondary }]}>
                  良品: {formatNumber(wo.completedQty, { maximumFractionDigits: 4 })}
                </Text>
                {wo.scrappedQty > 0 && (
                  <Text style={[styles.qtyText, { color: colors.error }]}>
                    报废: {formatNumber(wo.scrappedQty, { maximumFractionDigits: 4 })}
                  </Text>
                )}
              </View>

              <View style={styles.progressContainer}>
                <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${wo.progress}%`, backgroundColor: colors.primary },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.textTertiary }]}>
                  {wo.progress}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );
}

// ─── Detail View ──────────────────────────────────────────────────────────────

function DetailView({
  detail,
  loading,
  unitLabelMap,
  onBack,
  onClose,
}: {
  detail: WorkOrderDetail | null;
  loading: boolean;
  unitLabelMap: UnitLabelMap;
  onBack: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (loading) return <LoadingView />;
  if (!detail) return null;

  const progressPct = Math.min(Math.round(detail.overallProgress), 100);
  const displayCompletedQty = getDisplayCompletedQty(detail);
  const displayScrappedQty = getDisplayScrappedQty(detail);
  const operations = detail.operations ?? [];

  return (
    <>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{detail.orderNo}</Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.detailContent,
          { paddingBottom: insets.bottom + Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: colors.surface }, Shadow.sm]}>
          <View style={styles.row}>
            <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
              {detail.material?.name}
            </Text>
            <Text style={[styles.progressPctText, { color: colors.primary }]}>{progressPct}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progressPct}%`,
                  backgroundColor: progressPct >= 100 ? colors.success : colors.primary,
                },
              ]}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.qtyText, { color: colors.textSecondary }]}>
              良品 {formatQtyWithUnit(displayCompletedQty, detail.material?.unit, unitLabelMap)} /
              投产 {formatQtyWithUnit(detail.plannedQty, detail.material?.unit, unitLabelMap)}
            </Text>
            {displayScrappedQty > 0 && (
              <Text style={[styles.qtyText, { color: colors.error }]}>
                报废 {formatNumber(displayScrappedQty)}
              </Text>
            )}
          </View>
        </View>

        {/* Basic Info */}
        <DetailCard title="工单信息">
          <InfoRow
            label="状态"
            right={<ConfigBadge value={detail.status} config={WORK_ORDER_STATUS_CONFIG} />}
          />
          <InfoRow label="物料编码" value={getMaterialCode(detail.material ?? {}) || '-'} />
          <InfoRow label="物料名称" value={getMaterialName(detail.material ?? {}) || '-'} />
          <InfoRow label="规格型号" value={getMaterialSpec(detail.material ?? {}) || '-'} />
          <InfoRow
            label="单位"
            value={formatUnitLabel(getMaterialUnit(detail.material ?? {}), unitLabelMap) || '-'}
          />
          {detail.customer?.name && <InfoRow label="客户" value={detail.customer.name} />}
          {detail.planStartTime && (
            <InfoRow label="计划开始" value={formatDate(detail.planStartTime)} />
          )}
          {detail.planEndTime && (
            <InfoRow label="计划结束" value={formatDate(detail.planEndTime)} />
          )}
          {detail.dueDate && <InfoRow label="交期" value={formatDate(detail.dueDate)} last />}
        </DetailCard>

        {/* Operations */}
        {operations.length > 0 && (
          <DetailCard title={`工序 (${operations.length})`}>
            {operations.map((op, idx) => {
              const opCfg = {
                pending: { label: '待开始', color: colors.textMuted },
                in_progress: { label: '进行中', color: colors.primary },
                completed: { label: '已完成', color: colors.success },
                skipped: { label: '已跳过', color: colors.textTertiary },
              }[op.status] ?? { label: '未知状态', color: colors.textSecondary };

              return (
                <InfoRow
                  key={op.id}
                  label={`${op.sequence}. ${op.operationName}`}
                  right={
                    <View style={styles.opRight}>
                      <Text style={[styles.opQty, { color: colors.textSecondary }]}>
                        良{formatNumber(op.completedQty)} / 投
                        {formatNumber(op.plannedQty ?? detail.plannedQty)}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${opCfg.color}15` }]}>
                        <Text style={[styles.statusText, { color: opCfg.color }]}>
                          {opCfg.label}
                        </Text>
                      </View>
                    </View>
                  }
                  last={idx === operations.length - 1}
                />
              );
            })}
          </DetailCard>
        )}
      </ScrollView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listContainer: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  workOrderItem: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workOrderNo: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  qtyText: {
    fontSize: FontSize.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    minWidth: 36,
    textAlign: 'right',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  // Detail styles
  detailContent: {
    paddingVertical: Spacing.base,
    gap: Spacing.md,
  },
  progressCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 6,
    marginHorizontal: Spacing.sm,
  },
  productName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    flex: 1,
  },
  progressPctText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  opRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  opQty: {
    fontSize: FontSize.xs,
  },
});

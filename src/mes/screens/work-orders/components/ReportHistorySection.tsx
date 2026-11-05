import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { workOrderService } from '../../../host/services';
import type { OperationPayPreviewDto } from '../../../types/models/OperationPayPreviewDto';
import type { ReportLogItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge } from '../../../../core/components/Badge.tsx';
import { confirmAlert } from '../../../../core/components/ConfirmAlert.ts';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { ImagePreviewModal } from '../../../../core/components/ImagePreviewModal.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { P } from '../../../host/authorization';
import { PRODUCTION_SCRAP_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { usePermission } from '../../../host/hooks/usePermission';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import type { WorkOrdersStackParamList } from '../../../host/navigation';
import {
  formatReportScrapRate,
  getReportQualityVariant,
  getReportScrapRate,
} from '../../../screen-support/work-orders/utils/report-quality';
import { formatNumber } from '../../../../core/utils/format';
import { toast } from '../../../../core/toast';
import { ReportPhotosSection } from './ReportPhotosSection.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportHistorySectionProps {
  workOrderId: string;
  /** 触发刷新的计数器（父组件 loadDetail 后递增） */
  refreshKey?: number;
  canRevokeOutput?: boolean;
  canRevokeExecution?: boolean;
  onRevokeReportLog?: (record: ReportLogItem) => void;
}

function formatReportQuantityRole(record: ReportLogItem): string {
  if (record.quantityRole === 'execution') return '加工计数';
  if (record.quantityRole === 'time') return '仅工时';
  return '产出';
}

function formatQty(value?: number | null): string {
  return formatNumber(value, { fallback: '0', maximumFractionDigits: 4 });
}

function isExecutionReportLog(record: ReportLogItem): boolean {
  const outputQty = Number(record.completedQty ?? 0) + Number(record.scrappedQty ?? 0);
  return (
    record.quantityRole === 'execution' ||
    record.quantityRole === 'time' ||
    (outputQty === 0 &&
      (Number(record.executionQty ?? 0) > 0 || Number(record.durationMinutes ?? 0) > 0))
  );
}

function formatPayPreviewText(
  payPreview: OperationPayPreviewDto | null | undefined,
  mask: (amount: string) => string,
): string | null {
  if (!payPreview || payPreview.payMode === 'none') return null;
  if (!payPreview.priceConfigured) {
    return payPreview.message || '未配置工价';
  }
  if (!payPreview.visible) {
    return payPreview.message || '工价已配置';
  }
  const unitPrice =
    payPreview.unitPrice != null ? mask(`¥${Number(payPreview.unitPrice).toFixed(4)}`) : '—';
  const unitName = payPreview.unitName ? `/${payPreview.unitName}` : '';
  const amount =
    payPreview.estimatedAmount != null
      ? `，预计 ${mask(`¥${Number(payPreview.estimatedAmount).toFixed(2)}`)}`
      : '';
  return `${unitPrice}${unitName}${amount}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReportHistorySection({
  workOrderId,
  refreshKey,
  canRevokeOutput = false,
  canRevokeExecution = false,
  onRevokeReportLog,
}: ReportHistorySectionProps) {
  const { colors } = useTheme();
  const { formatUnit: formatOperationUnit } = useUnitDisplay('operation');
  const navigation = useNavigation<NativeStackNavigationProp<WorkOrdersStackParamList>>();
  const canViewProductionScrap = usePermission(P.PRODUCTION_SCRAP_VIEW);
  const {
    visible: amountVisible,
    toggle: toggleAmount,
    mask,
    permitted: canViewPrices,
  } = useAmountDisplay();
  const [records, setRecords] = useState<ReportLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await workOrderService.getReportLogs({
        workOrderId,
        page: 1,
        pageSize: expanded ? 100 : 5,
      });
      setRecords(result.list);
      setTotal(result.total);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '加载报工记录失败');
    } finally {
      setLoading(false);
    }
  }, [workOrderId, expanded]);

  useEffect(() => {
    void refreshKey;
    loadLogs();
  }, [loadLogs, refreshKey]);

  const eyeButton = canViewPrices ? (
    <TouchableOpacity onPress={toggleAmount} hitSlop={8}>
      <Ionicons name={amountVisible ? 'eye' : 'eye-off'} size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  ) : null;

  if (loading) {
    return (
      <DetailCard title="报工流水" right={eyeButton}>
        <InlineLoading />
      </DetailCard>
    );
  }

  if (records.length === 0) return null;

  const displayItems = expanded ? records : records.slice(0, 3);
  const hasMore = total > 3;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${h}:${m}`;
  };

  return (
    <DetailCard title="报工流水" noPadding right={eyeButton}>
      <View style={styles.list}>
        {displayItems.map((record, idx) => {
          const isLast = idx === displayItems.length - 1 && !hasMore;
          const isRevoke = record.type === 'revoke';
          const isExecutionLog = isExecutionReportLog(record);
          const quantityRoleLabel = formatReportQuantityRole(record);
          const payPreviewText = formatPayPreviewText(record.payPreview, mask);
          const scrapRate =
            isRevoke || isExecutionLog
              ? null
              : getReportScrapRate(record.completedQty, record.scrappedQty);
          const productionScrapStatus = record.productionScrapStatus
            ? PRODUCTION_SCRAP_STATUS_CONFIG[record.productionScrapStatus]
            : undefined;
          return (
            <View
              key={record.id}
              style={[
                styles.recordCard,
                { backgroundColor: colors.surfaceSecondary },
                !isLast && styles.recordGap,
              ]}
            >
              {/* Header: operation name + time */}
              <View style={styles.recordHeader}>
                <View style={styles.recordTitleRow}>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: isRevoke ? `${colors.error}18` : `${colors.success}18`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        {
                          color: isRevoke ? colors.error : colors.success,
                        },
                      ]}
                    >
                      {isRevoke ? (isExecutionLog ? '作废' : '冲正') : quantityRoleLabel}
                    </Text>
                  </View>
                  {record.operationName ? (
                    <Text style={[styles.recordOpName, { color: colors.text }]} numberOfLines={1}>
                      {record.operationName}
                    </Text>
                  ) : (
                    <Text style={[styles.recordOpName, { color: colors.text }]} numberOfLines={1}>
                      整单报工
                    </Text>
                  )}
                </View>
                <View style={styles.recordHeaderActions}>
                  {!isRevoke &&
                  onRevokeReportLog &&
                  (isExecutionLog ? canRevokeExecution : canRevokeOutput) ? (
                    <TouchableOpacity
                      onPress={() =>
                        confirmAlert(
                          isExecutionLog ? '确认作废' : '确认冲正',
                          isExecutionLog
                            ? '确定按该条执行流水精确作废吗？'
                            : '确定按该条报工流水精确冲正吗？',
                          () => onRevokeReportLog(record),
                          isExecutionLog ? '作废' : '冲正',
                          true,
                        )
                      }
                      style={[
                        styles.revokeBtn,
                        {
                          backgroundColor: `${colors.warning}12`,
                          borderColor: `${colors.warning}30`,
                        },
                      ]}
                    >
                      <Ionicons name="arrow-undo-outline" size={11} color={colors.warning} />
                      <Text style={[styles.revokeBtnText, { color: colors.warning }]}>
                        {isExecutionLog ? '作废' : '冲正'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  <Text style={[styles.recordTime, { color: colors.textTertiary }]}>
                    {formatTime(record.occurredAt ?? record.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Qty row */}
              <View style={styles.recordQtyRow}>
                {isExecutionLog ? (
                  <>
                    {Number(record.executionQty ?? 0) > 0 && (
                      <View style={styles.qtyItem}>
                        <Text style={[styles.qtyLabel, { color: colors.textTertiary }]}>
                          {isRevoke ? '作废执行量' : '执行量'}
                        </Text>
                        <Text
                          style={[
                            styles.qtyValue,
                            { color: isRevoke ? colors.error : colors.success },
                          ]}
                        >
                          {isRevoke ? '-' : ''}
                          {record.executionQty} {formatOperationUnit(record.executionUnit || '次')}
                        </Text>
                      </View>
                    )}
                    {Number(record.durationMinutes ?? 0) > 0 && (
                      <View style={styles.qtyItem}>
                        <Text style={[styles.qtyLabel, { color: colors.textTertiary }]}>工时</Text>
                        <Text
                          style={[
                            styles.qtyValue,
                            { color: isRevoke ? colors.error : colors.text },
                          ]}
                        >
                          {isRevoke ? '-' : ''}
                          {record.durationMinutes} 分钟
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <View style={styles.qtyItem}>
                      <Text style={[styles.qtyLabel, { color: colors.textTertiary }]}>
                        {isRevoke ? '冲减良品' : '良品'}
                      </Text>
                      <Text
                        style={[
                          styles.qtyValue,
                          { color: isRevoke ? colors.error : colors.success },
                        ]}
                      >
                        {isRevoke ? '-' : ''}
                        {record.completedQty}
                      </Text>
                    </View>
                    {record.scrappedQty > 0 && (
                      <View style={styles.qtyItem}>
                        <Text style={[styles.qtyLabel, { color: colors.textTertiary }]}>报废</Text>
                        <Text style={[styles.qtyValue, { color: colors.error }]}>
                          {isRevoke ? '-' : ''}
                          {record.scrappedQty}
                        </Text>
                      </View>
                    )}
                  </>
                )}
                {payPreviewText && (
                  <View style={styles.qtyItem}>
                    <Text style={[styles.qtyLabel, { color: colors.textTertiary }]}>工价</Text>
                    <Text style={[styles.qtyValue, { color: colors.text }]}>{payPreviewText}</Text>
                  </View>
                )}
                {scrapRate != null && (
                  <Badge
                    label={`报废率 ${formatReportScrapRate(scrapRate)}`}
                    variant={getReportQualityVariant(scrapRate)}
                    size="sm"
                  />
                )}
              </View>

              {/* Meta row: reporter + equipment + batchNo */}
              <View style={styles.recordMetaRow}>
                {record.reporterName && (
                  <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={11} color={colors.textTertiary} />
                    <Text style={[styles.metaValue, { color: colors.textSecondary }]}>
                      {record.reporterName}
                    </Text>
                  </View>
                )}
                {record.equipmentName && (
                  <View style={styles.metaItem}>
                    <Ionicons name="construct-outline" size={11} color={colors.textTertiary} />
                    <Text style={[styles.metaValue, { color: colors.textSecondary }]}>
                      {record.equipmentName}
                    </Text>
                  </View>
                )}
                {record.batchNo && (
                  <View style={styles.metaItem}>
                    <Ionicons name="barcode-outline" size={11} color={colors.textTertiary} />
                    <Text style={[styles.metaValue, { color: colors.textSecondary }]}>
                      {record.batchNo}
                    </Text>
                  </View>
                )}
                {(record.sourceOrderNo || record.sourceDemandLineNo != null) && (
                  <View style={styles.metaItem}>
                    <Ionicons name="document-text-outline" size={11} color={colors.textTertiary} />
                    <Text style={[styles.metaValue, { color: colors.textSecondary }]}>
                      {record.sourceOrderNo || '直接计划'}
                      {record.sourceDemandLineNo != null
                        ? ` · 需求行 ${record.sourceDemandLineNo}`
                        : ''}
                    </Text>
                  </View>
                )}
              </View>

              {record.sourceRemarkSnapshot ? (
                <Text style={[styles.metaValue, { color: colors.textSecondary }]}>
                  来源备注：{record.sourceRemarkSnapshot}
                </Text>
              ) : null}

              {record.productionScrapNo && !isRevoke && !isExecutionLog && (
                <View style={styles.productionScrapRow}>
                  {record.productionScrapId && canViewProductionScrap ? (
                    <TouchableOpacity
                      style={styles.productionScrapLink}
                      onPress={() => {
                        if (!record.productionScrapId) return;
                        navigation.getParent?.()?.navigate('ProductionScrapDetail', {
                          id: record.productionScrapId,
                        });
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={11} color={colors.textTertiary} />
                      <Text style={[styles.metaValue, { color: colors.primary }]}>
                        {record.productionScrapNo}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.metaItem}>
                      <Ionicons name="trash-outline" size={11} color={colors.textTertiary} />
                      <Text style={[styles.metaValue, { color: colors.textSecondary }]}>
                        {record.productionScrapNo}
                      </Text>
                    </View>
                  )}
                  {productionScrapStatus ? (
                    <View
                      style={[styles.scrapStatusTag, { backgroundColor: productionScrapStatus.bg }]}
                    >
                      <Text
                        style={[styles.scrapStatusText, { color: productionScrapStatus.color }]}
                      >
                        {productionScrapStatus.label}
                      </Text>
                    </View>
                  ) : null}
                  {/* 处置净值：报废口径仍是报工原始不良，此处展示处置后口径。
                      让步接收单独注明，已入可用成品库（来源处置单）。 */}
                  {(record.productionScrapResolvedScrapQty != null ||
                    record.productionScrapResolvedNonScrapQty != null ||
                    record.productionScrapPendingQty != null) && (
                    <Text style={[styles.metaValue, { color: colors.textTertiary }]}>
                      {`最终报废 ${formatQty(record.productionScrapResolvedScrapQty)}`}
                      {Number(record.productionScrapResolvedConcessionQty ?? 0) > 0
                        ? ` · 让步接收 ${formatQty(record.productionScrapResolvedConcessionQty)}`
                        : ''}
                      {Math.max(
                        0,
                        Number(record.productionScrapResolvedNonScrapQty ?? 0) -
                          Number(record.productionScrapResolvedConcessionQty ?? 0),
                      ) > 0
                        ? ` · 返工转可用 ${formatQty(
                            Math.max(
                              0,
                              Number(record.productionScrapResolvedNonScrapQty ?? 0) -
                                Number(record.productionScrapResolvedConcessionQty ?? 0),
                            ),
                          )}`
                        : ''}
                      {Number(record.productionScrapPendingQty ?? 0) > 0
                        ? ` · 待处置 ${formatQty(record.productionScrapPendingQty)}`
                        : ''}
                    </Text>
                  )}
                </View>
              )}

              {/* Remark */}
              {record.remark && (
                <Text
                  style={[styles.recordRemark, { color: colors.textTertiary }]}
                  numberOfLines={2}
                >
                  {record.remark}
                </Text>
              )}
              <ReportPhotosSection
                photoUrls={record.photoUrls}
                scrapPhotoUrls={record.scrapPhotoUrls}
                onPreview={setPreviewPhotoUrl}
              />
            </View>
          );
        })}

        {hasMore && (
          <TouchableOpacity style={styles.moreBtn} onPress={() => setExpanded((v) => !v)}>
            <Text style={[styles.moreText, { color: colors.primary }]}>
              {expanded ? '收起' : `查看全部 ${total} 条记录`}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      <ImagePreviewModal
        visible={!!previewPhotoUrl}
        uri={previewPhotoUrl}
        onClose={() => setPreviewPhotoUrl(null)}
      />
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: { padding: Spacing.sm },
  recordCard: {
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 6,
  },
  recordGap: { marginBottom: Spacing.xs },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  recordTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  typeBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  typeBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  recordOpName: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  recordTime: { fontSize: FontSize.xs },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  revokeBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  recordQtyRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingLeft: 2,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  qtyItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  qtyLabel: { fontSize: FontSize.xs },
  qtyValue: { fontSize: FontSize.sm, fontWeight: '600' },
  recordMetaRow: { flexDirection: 'row', gap: Spacing.md, paddingLeft: 2, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  productionScrapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 2,
  },
  productionScrapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaValue: { fontSize: FontSize.xs },
  scrapStatusTag: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  scrapStatusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  recordRemark: { fontSize: FontSize.xs, paddingLeft: 2 },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  moreText: { fontSize: FontSize.xs, fontWeight: '500' },
});

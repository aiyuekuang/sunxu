import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ReportLogItem } from '../../../host/services';
import { workOrderService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge } from '../../../../core/components/Badge.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { confirmAlert } from '../../../../core/components/ConfirmAlert.ts';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { ImagePreviewModal } from '../../../../core/components/ImagePreviewModal.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { PAGE_SIZE } from '../../../constants/enums';
import { REPORT_LOG_TYPE_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import {
  formatReportScrapRate,
  getReportQualityVariant,
  getReportScrapRate,
} from '../../../screen-support/work-orders/utils/report-quality';
import { formatNumber } from '../../../../core/utils/format';
import { ReportPhotosSection } from './ReportPhotosSection.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportLogsSheetProps {
  visible: boolean;
  workOrderId: string;
  operationId: string | null;
  operationName: string;
  onClose: () => void;
  canRevokeOutput?: boolean;
  canRevokeExecution?: boolean;
  onRevokeReportLog?: (record: ReportLogItem) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${h}:${m}`;
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

function formatQuantityRole(record: ReportLogItem): string {
  if (record.quantityRole === 'execution') return '加工计数';
  if (record.quantityRole === 'time') return '仅工时';
  return '报工';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReportLogsSheet({
  visible,
  workOrderId,
  operationId,
  operationName,
  onClose,
  canRevokeOutput = false,
  canRevokeExecution = false,
  onRevokeReportLog,
}: ReportLogsSheetProps) {
  const { colors } = useTheme();
  const { formatUnit: formatOperationUnit } = useUnitDisplay('operation');
  const [logs, setLogs] = useState<ReportLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !operationId) return;
    setLoading(true);
    workOrderService
      .getReportLogs({ workOrderId, operationId, pageSize: PAGE_SIZE.LARGE })
      .then((res) => setLogs(res.list))
      .finally(() => setLoading(false));
  }, [visible, workOrderId, operationId]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`报工流水 · ${operationName}`}
      maxHeightRatio={0.6}
    >
      {loading ? (
        <InlineLoading />
      ) : logs.length === 0 ? (
        <EmptyState compact icon="document-text-outline" title="暂无报工记录" />
      ) : (
        <View style={styles.logList}>
          {logs.map((item, idx) => {
            const logCfg = REPORT_LOG_TYPE_CONFIG[item.type] ?? REPORT_LOG_TYPE_CONFIG.report;
            const typeColor = logCfg.color;
            const isRevoke = item.type === 'revoke';
            const isExecutionLog = isExecutionReportLog(item);
            const typeLabel = isRevoke
              ? isExecutionLog
                ? '作废'
                : logCfg.label
              : formatQuantityRole(item);
            const scrapRate =
              isRevoke || isExecutionLog
                ? null
                : getReportScrapRate(item.completedQty, item.scrappedQty);

            return (
              <View
                key={item.id}
                style={[
                  styles.logItem,
                  { backgroundColor: colors.surfaceSecondary },
                  idx > 0 && { marginTop: Spacing.sm },
                ]}
              >
                <View style={styles.logHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                    <Text style={[styles.typeText, { color: typeColor }]}>{typeLabel}</Text>
                  </View>
                  <View style={styles.logHeaderActions}>
                    {!isRevoke &&
                    onRevokeReportLog &&
                    (isExecutionLog ? canRevokeExecution : canRevokeOutput) ? (
                      <TouchableOpacity
                        style={[
                          styles.revokeBtn,
                          {
                            backgroundColor: `${colors.warning}12`,
                            borderColor: `${colors.warning}30`,
                          },
                        ]}
                        onPress={() =>
                          confirmAlert(
                            isExecutionLog ? '确认作废' : '确认冲正',
                            isExecutionLog
                              ? '确定按该条执行流水精确作废吗？'
                              : '确定按该条报工流水精确冲正吗？',
                            () => onRevokeReportLog(item),
                            isExecutionLog ? '作废' : '冲正',
                            true,
                          )
                        }
                      >
                        <Ionicons name="arrow-undo-outline" size={11} color={colors.warning} />
                        <Text style={[styles.revokeBtnText, { color: colors.warning }]}>
                          {isExecutionLog ? '作废' : '冲正'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                    <Text style={[styles.logTime, { color: colors.textTertiary }]}>
                      {formatTime(item.occurredAt ?? item.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.logBody}>
                  <View style={styles.logRow}>
                    <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.logValue, { color: colors.text }]}>
                      {item.reporterName ?? '未知'}
                    </Text>
                  </View>

                  {(item.sourceOrderNo || item.sourceDemandLineNo != null) && (
                    <View style={styles.logRow}>
                      <Ionicons
                        name="document-text-outline"
                        size={12}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.logValue, { color: colors.textSecondary }]}>
                        来源 {item.sourceOrderNo || '直接计划'}
                        {item.sourceDemandLineNo != null
                          ? ` · 需求行 ${item.sourceDemandLineNo}`
                          : ''}
                      </Text>
                    </View>
                  )}
                  {item.sourceRemarkSnapshot ? (
                    <View style={styles.logRow}>
                      <Ionicons name="chatbubble-outline" size={12} color={colors.textSecondary} />
                      <Text
                        style={[styles.logValue, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        来源备注：{item.sourceRemarkSnapshot}
                      </Text>
                    </View>
                  ) : null}

                  {isExecutionLog ? (
                    <View style={styles.logRow}>
                      <Ionicons name="repeat-outline" size={12} color={colors.success} />
                      <Text style={[styles.logValue, { color: colors.text }]}>
                        {Number(item.executionQty ?? 0) > 0
                          ? `执行量 ${item.executionQty} ${formatOperationUnit(
                              item.executionUnit || '次',
                            )}`
                          : '执行记录'}
                      </Text>
                      {Number(item.durationMinutes ?? 0) > 0 && (
                        <Text style={[styles.logValue, { color: colors.textSecondary }]}>
                          工时 {item.durationMinutes} 分钟
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.logRow}>
                      <Ionicons name="checkmark-circle-outline" size={12} color={colors.success} />
                      <Text style={[styles.logValue, { color: colors.text }]}>
                        良品 {formatNumber(item.completedQty, { maximumFractionDigits: 4 })}
                      </Text>
                      {item.scrappedQty > 0 && (
                        <>
                          <Ionicons
                            name="close-circle-outline"
                            size={12}
                            color={colors.error}
                            style={styles.logRowGap}
                          />
                          <Text style={[styles.logValue, { color: colors.error }]}>
                            报废 {formatNumber(item.scrappedQty, { maximumFractionDigits: 4 })}
                          </Text>
                        </>
                      )}
                      {scrapRate != null && (
                        <View style={styles.rateBadgeWrap}>
                          <Badge
                            label={`报废率 ${formatReportScrapRate(scrapRate)}`}
                            variant={getReportQualityVariant(scrapRate)}
                            size="sm"
                          />
                        </View>
                      )}
                    </View>
                  )}

                  {item.batchNo && (
                    <View style={styles.logRow}>
                      <Ionicons name="layers-outline" size={12} color={colors.textSecondary} />
                      <Text style={[styles.logValue, { color: colors.textSecondary }]}>
                        批号 {item.batchNo}
                      </Text>
                    </View>
                  )}

                  {item.equipmentName && (
                    <View style={styles.logRow}>
                      <Ionicons name="construct-outline" size={12} color={colors.textSecondary} />
                      <Text style={[styles.logValue, { color: colors.textSecondary }]}>
                        {item.equipmentName}
                      </Text>
                    </View>
                  )}

                  {item.remark && (
                    <View style={styles.logRow}>
                      <Ionicons name="chatbubble-outline" size={12} color={colors.textSecondary} />
                      <Text
                        style={[styles.logValue, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {item.remark}
                      </Text>
                    </View>
                  )}
                  <ReportPhotosSection
                    photoUrls={item.photoUrls}
                    scrapPhotoUrls={item.scrapPhotoUrls}
                    onPreview={setPreviewPhotoUrl}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
      <ImagePreviewModal
        visible={!!previewPhotoUrl}
        uri={previewPhotoUrl}
        onClose={() => setPreviewPhotoUrl(null)}
      />
    </BottomSheet>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  logList: {},
  logItem: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
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
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  typeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  logTime: {
    fontSize: FontSize.xs,
  },
  logBody: {
    gap: Spacing.xs,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  logRowGap: {
    marginLeft: Spacing.sm,
  },
  rateBadgeWrap: {
    marginLeft: 'auto',
  },
  logValue: {
    fontSize: FontSize.sm,
  },
});

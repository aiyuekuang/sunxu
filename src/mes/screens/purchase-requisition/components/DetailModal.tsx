import { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { type PurchaseRequisition, purchaseRequisitionService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { confirmAlert } from '../../../../core/components/ConfirmAlert.ts';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { PR_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useActionRunner } from '../../../host/hooks/useActionRunner';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DetailModalProps {
  /** 采购申请单数据 */
  pr: PurchaseRequisition;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 操作成功后刷新回调 */
  onRefresh: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DetailModal({ pr, onClose, onRefresh }: DetailModalProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const { running: actioning, run } = useActionRunner();

  const doAction = useCallback(
    (action: 'submit' | 'approve' | 'cancel') => {
      const labels: Record<string, string> = { submit: '提交', approve: '批准', cancel: '取消' };
      confirmAlert(
        `确认${labels[action]}?`,
        '',
        () =>
          run(
            () => {
              if (action === 'submit') return purchaseRequisitionService.submit(pr.id);
              if (action === 'approve') return purchaseRequisitionService.approve(pr.id);
              return purchaseRequisitionService.cancel(pr.id);
            },
            `已${labels[action]}`,
            () => {
              onRefresh();
              onClose();
            },
          ),
        '确认',
        action === 'cancel',
      );
    },
    [onClose, onRefresh, pr.id, run],
  );

  const showActions = pr.status === 'draft' || pr.status === 'submitted';

  const renderFooter = useCallback(
    () => (
      <>
        {pr.status === 'draft' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => doAction('submit')}
            disabled={actioning}
          >
            {actioning ? (
              <InlineLoading color={colors.textOnPrimary} />
            ) : (
              <Text style={[styles.actionBtnText, { color: colors.textOnPrimary }]}>提交审核</Text>
            )}
          </TouchableOpacity>
        )}
        {pr.status === 'submitted' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.success }]}
            onPress={() => doAction('approve')}
            disabled={actioning}
          >
            {actioning ? (
              <InlineLoading color={colors.textOnPrimary} />
            ) : (
              <Text style={[styles.actionBtnText, { color: colors.textOnPrimary }]}>批准</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => doAction('cancel')}
          disabled={actioning}
        >
          <Text style={[styles.actionBtnText, { color: colors.textMuted }]}>取消申请</Text>
        </TouchableOpacity>
      </>
    ),
    [pr.status, actioning, colors, doAction],
  );

  return (
    <BottomSheet
      visible
      onClose={onClose}
      title="采购申请详情"
      dynamicHeight
      maxHeightRatio={0.85}
      renderFooter={showActions ? renderFooter : undefined}
    >
      <View style={styles.scrollContent}>
        <View style={styles.prHeader}>
          <Text style={[styles.prNo, { color: colors.text }]}>{pr.prNo}</Text>
          <ConfigBadge value={pr.status} config={PR_STATUS_CONFIG} size="sm" />
        </View>

        {pr.remarks ? (
          <Text style={[styles.remarks, { color: colors.textSecondary }]}>备注: {pr.remarks}</Text>
        ) : null}
        {pr.rejectReason ? (
          <View style={[styles.rejectRow, { backgroundColor: colors.errorLight }]}>
            <Text style={[styles.rejectText, { color: colors.error }]}>
              驳回原因: {pr.rejectReason}
            </Text>
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>物料清单</Text>
        {(pr.items ?? []).map((item) => (
          <View key={item.materialId} style={[styles.itemRow, { borderColor: colors.border }]}>
            <View style={styles.itemContent}>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.material?.name}</Text>
              <Text style={[styles.itemNo, { color: colors.textSecondary }]}>
                {item.material?.code}
              </Text>
            </View>
            <View style={styles.qtyCol}>
              <Text style={[styles.qtyVal, { color: colors.primary }]}>
                {formatQtyWithUnit(item.requiredQty, item.material?.unit, unitLabelMap)}
              </Text>
              <Text style={[styles.stockVal, { color: colors.textMuted }]}>
                库存 {item.currentStock}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: { padding: Spacing.md, gap: Spacing.xs },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  prNo: { flex: 1, fontSize: FontSize.md, fontWeight: '700' },
  remarks: { fontSize: FontSize.sm },
  rejectRow: { borderRadius: Radius.md, padding: Spacing.sm },
  rejectText: { fontSize: FontSize.sm },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '600', marginTop: Spacing.xs },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemContent: { flex: 1 },
  itemName: { fontSize: FontSize.sm, fontWeight: '500' },
  itemNo: { fontSize: FontSize.xs, marginTop: 2 },
  qtyCol: { alignItems: 'flex-end' },
  qtyVal: { fontSize: FontSize.sm, fontWeight: '600' },
  stockVal: { fontSize: FontSize.xs },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
});

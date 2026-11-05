import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { PurchaseOrderIncomingInspectionDto } from '../../../types/models/PurchaseOrderIncomingInspectionDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { INSPECTION_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface PurchaseOrderIncomingInspectionInfoProps {
  /** 采购订单行上的后端来料检验摘要。 */
  inspection: PurchaseOrderIncomingInspectionDto | null | undefined;
  /** 当前账号能否打开单张来料检验详情。 */
  canViewInspection: boolean;
  /** 当前账号能否查看关联来料检验列表。 */
  canListInspections: boolean;
  /** 当前账号能否查看关联采购入库单。 */
  canListReceipts: boolean;
  /** 打开唯一关联的来料检验单。 */
  onOpenInspection: (inspectionId: string) => void;
  /** 打开已按来源采购订单行筛选的来料检验列表。 */
  onOpenInspectionList: () => void;
  /** 打开关联采购入库单列表。 */
  onOpenReceipts: () => void;
}

export function PurchaseOrderIncomingInspectionInfo({
  inspection,
  canViewInspection,
  canListInspections,
  canListReceipts,
  onOpenInspection,
  onOpenInspectionList,
  onOpenReceipts,
}: PurchaseOrderIncomingInspectionInfoProps) {
  const { colors } = useTheme();
  if (!inspection) return null;

  const hasUnreportedReceipts = inspection.unreportedReceiptCount > 0;
  const hasInspections = inspection.inspectionCount > 0;
  const singleInspectionId =
    inspection.inspectionCount === 1 && canViewInspection ? inspection.inspectionId : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.warningSurface }]}>
      <Text style={[styles.label, { color: colors.warning }]}>来料检验</Text>
      {hasUnreportedReceipts ? (
        <View style={styles.row}>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            {inspection.unreportedReceiptCount} 批到货应检未报检
          </Text>
          {canListReceipts ? (
            <TouchableOpacity onPress={onOpenReceipts}>
              <Text style={[styles.link, { color: colors.primary }]}>查看采购入库单</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
      {hasInspections ? (
        <View style={styles.row}>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            已报检 {inspection.inspectionCount} 单 · {formatInspectionStatusCounts(inspection)}
          </Text>
          {singleInspectionId ? (
            <TouchableOpacity onPress={() => onOpenInspection(singleInspectionId)}>
              <Text style={[styles.link, { color: colors.primary }]}>查看来料检验</Text>
            </TouchableOpacity>
          ) : canListInspections ? (
            <TouchableOpacity onPress={onOpenInspectionList}>
              <Text style={[styles.link, { color: colors.primary }]}>查看来料检验</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function formatInspectionStatusCounts(inspection: PurchaseOrderIncomingInspectionDto): string {
  return inspection.inspectionStatusCounts
    .map((item) => `${INSPECTION_STATUS_CONFIG[item.status]?.label ?? '未知状态'} ${item.count} 单`)
    .join(' / ');
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  label: { fontSize: FontSize.xs, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  text: { flex: 1, fontSize: FontSize.xs, lineHeight: FontSize.base },
  link: { fontSize: FontSize.xs, fontWeight: '600', textDecorationLine: 'underline' },
});

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface PurchaseOrderReceiveOutcomeProps {
  /** 后端创建的采购入库单编号。 */
  receiptNo: string;
  /** 当前账号是否可以打开采购入库详情。 */
  canOpenReceipt: boolean;
}

export function PurchaseOrderReceiveOutcome({
  receiptNo,
  canOpenReceipt,
}: PurchaseOrderReceiveOutcomeProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.warningSurface }]}>
      <Ionicons name="shield-checkmark-outline" size={FontSize['2xl']} color={colors.warning} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>收货已登记，待来料检验确认</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          采购入库单 {receiptNo} 已生成。合格入库数量将在来料检验放行后确认。
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {canOpenReceipt
            ? '可进入采购入库单查看门禁状态，并打开关联的来料检验单。'
            : '当前账号无采购入库单查看权限，请由有权限的人员继续处理。'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  content: { flex: 1, gap: Spacing.xs },
  title: { fontSize: FontSize.base, fontWeight: '600' },
  message: { fontSize: FontSize.sm, lineHeight: FontSize.lg },
  hint: { fontSize: FontSize.xs, lineHeight: FontSize.base },
});

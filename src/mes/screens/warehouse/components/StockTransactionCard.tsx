import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { StockTransaction } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { stockTransactionLabel } from '../../../constants/status-configs';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatDateTime } from '../../../../core/utils/date';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StockTransactionCardProps {
  item: StockTransaction;
  onPhotoPress: (url: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const StockTransactionCard = React.memo(function StockTransactionCard({
  item,
  onPhotoPress,
}: StockTransactionCardProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  // 类型中文名统一走 STOCK_TRANSACTION_TYPE_CONFIG；未命中显示原始类型码
  const typeLabel = stockTransactionLabel(item.type);
  const isIn = item.qty > 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.typeRow}>
          <Ionicons
            name={isIn ? 'arrow-down-circle' : 'arrow-up-circle'}
            size={20}
            color={isIn ? colors.success : colors.error}
          />
          <Text style={[styles.type, { color: colors.text }]}>{typeLabel}</Text>
          {item.transactionNo && (
            <Text style={[styles.txNo, { color: colors.textSecondary }]}>{item.transactionNo}</Text>
          )}
        </View>
        <Text style={[styles.qty, { color: isIn ? colors.success : colors.error }]}>
          {isIn ? '+' : ''}
          {formatQtyWithUnit(Number(item.qty), item.material?.unit, unitLabelMap)}
        </Text>
      </View>
      <Text style={[styles.after, { color: colors.textSecondary }]}>
        变动后: {formatQtyWithUnit(Number(item.qtyAfter), item.material?.unit, unitLabelMap)}
      </Text>
      {item.supplier && (
        <Text style={[styles.ref, { color: colors.textSecondary }]}>
          供应商: {item.supplier.name}
        </Text>
      )}
      {item.customer && (
        <Text style={[styles.ref, { color: colors.textSecondary }]}>
          客户: {item.customer.name}
        </Text>
      )}
      {item.referenceNo && (
        <Text style={[styles.ref, { color: colors.textSecondary }]}>单据: {item.referenceNo}</Text>
      )}
      {item.batchNo ? (
        <Text style={[styles.ref, { color: colors.textSecondary }]}>批号：{item.batchNo}</Text>
      ) : null}
      {item.remarks ? (
        <Text style={[styles.ref, { color: colors.textSecondary }]}>备注: {item.remarks}</Text>
      ) : null}
      <Text style={[styles.meta, { color: colors.textSecondary }]}>
        {item.operator?.realName ?? item.operator?.username ?? '-'} ·{' '}
        {formatDateTime(item.createdAt)}
      </Text>
      {item.photoUrls && item.photoUrls.length > 0 && (
        <View style={styles.photoRow}>
          {item.photoUrls.map((url) => (
            <Pressable key={url} onPress={() => onPhotoPress(url)}>
              <Image source={{ uri: url }} style={styles.photoThumb} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: { borderRadius: Radius.md, padding: 10, gap: 3, ...Shadow.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  type: { fontSize: FontSize.sm, fontWeight: '600' },
  txNo: { fontSize: FontSize.xs, marginLeft: Spacing.xs },
  qty: { fontSize: FontSize.base, fontWeight: '700' },
  after: { fontSize: FontSize.xs },
  ref: { fontSize: FontSize.xs },
  meta: { fontSize: FontSize.xs },
  photoRow: { flexDirection: 'row', gap: 6, marginTop: Spacing.xs },
  photoThumb: { width: 48, height: 48, borderRadius: Radius.sm },
});

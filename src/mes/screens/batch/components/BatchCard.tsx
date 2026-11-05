import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { MaterialBatch } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { BATCH_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { daysFromNow, formatDate, today } from '../../../../core/utils/date';
import { buildMaterialIdentitySublabel } from '../../../utils/material-identity';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BatchCardProps {
  item: MaterialBatch;
  onPress: () => void;
  onTrace?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const BatchCard = React.memo(function BatchCard({ item, onPress, onTrace }: BatchCardProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const isExpired = Boolean(item.expiryDate && item.expiryDate < today());
  const isExpiring = Boolean(item.expiryDate && !isExpired && item.expiryDate <= daysFromNow(7));
  const displayStatus = isExpired && item.status === 'available' ? 'expired' : item.status;

  return (
    <ListCard onPress={onPress}>
      <ListCard.Header>
        <ListCard.Code>{item.batchNo}</ListCard.Code>
        <ConfigBadge value={displayStatus} config={BATCH_STATUS_CONFIG} size="sm" />
      </ListCard.Header>
      <ListCard.Title>{item.material?.name ?? '-'}</ListCard.Title>
      {item.material ? (
        <ListCard.MetaText>
          {buildMaterialIdentitySublabel(item.material, unitLabelMap)}
        </ListCard.MetaText>
      ) : null}
      <ListCard.Meta>
        <ListCard.MetaText>
          数量: {formatQtyWithUnit(item.qty, item.material?.unit, unitLabelMap)}
        </ListCard.MetaText>
        <ListCard.MetaText>{item.warehouse?.name ?? '-'}</ListCard.MetaText>
      </ListCard.Meta>
      {item.supplier && (
        <ListCard.Meta>
          <ListCard.MetaText>供应商: {item.supplier.name}</ListCard.MetaText>
        </ListCard.Meta>
      )}
      {item.expiryDate && (
        <ListCard.Meta>
          <ListCard.MetaText color={isExpired || isExpiring ? colors.error : undefined}>
            {isExpired ? '已过期: ' : isExpiring ? '⚠ 即将到期: ' : '有效期至: '}
            {formatDate(item.expiryDate)}
          </ListCard.MetaText>
        </ListCard.Meta>
      )}
      {onTrace && (
        <ListCard.Actions>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onTrace();
            }}
            style={styles.traceBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="git-network-outline" size={14} color={colors.primary} />
            <Text style={[styles.traceBtnText, { color: colors.primary }]}>追溯</Text>
          </TouchableOpacity>
        </ListCard.Actions>
      )}
    </ListCard>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  traceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  traceBtnText: { fontSize: FontSize.sm, fontWeight: '500' },
});

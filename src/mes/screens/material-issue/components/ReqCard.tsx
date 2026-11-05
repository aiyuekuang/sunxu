import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { MaterialReq } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { ProgressBar } from '../../../../core/components/ProgressBar.tsx';
import { MATERIAL_REQ_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { buildMaterialIdentitySublabel } from '../../../utils/material-identity';
import { formatQtyWithUnit } from '../../../utils/qty-unit';
import { getMaterialReqOwnerLabel } from '../utils/materialReqOwner';

export interface ReqCardProps {
  item: MaterialReq;
}

export const ReqCard = React.memo(function ReqCard({ item }: ReqCardProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const substituteSummary =
    item.approvedSubstitutes
      ?.map(
        (substitute) =>
          substitute.substituteMaterial?.name ||
          substitute.substituteMaterial?.code ||
          substitute.substituteMaterialId,
      )
      .filter(Boolean)
      .join('、') ?? '';
  return (
    <ListCard>
      <ListCard.Header>
        <ListCard.Title>{item.material?.name ?? '-'}</ListCard.Title>
        <ConfigBadge value={item.status} config={MATERIAL_REQ_STATUS_CONFIG} size="sm" />
      </ListCard.Header>
      <ListCard.Subtitle>
        {item.material ? buildMaterialIdentitySublabel(item.material, unitLabelMap) || '-' : '-'}
      </ListCard.Subtitle>
      <View style={styles.qtyRow}>
        <View style={styles.progressWrapper}>
          <ProgressBar current={item.issuedQty} target={item.requiredQty} />
        </View>
        <Text style={[styles.qtyText, { color: colors.textSecondary }]}>
          {formatQtyWithUnit(item.issuedQty, item.material?.unit, unitLabelMap)}/
          {formatQtyWithUnit(item.requiredQty, item.material?.unit, unitLabelMap)}
        </Text>
      </View>
      <View style={styles.metaGroup}>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          库存货主：{getMaterialReqOwnerLabel(item)}
        </Text>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          来源仓：{item.warehouse?.name ?? '-'}
        </Text>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          线边仓：{item.lineSideWarehouse?.name ?? '-'}
        </Text>
        {substituteSummary ? (
          <Text style={[styles.metaText, { color: colors.warning }]}>
            已批准替代料：{substituteSummary}
          </Text>
        ) : null}
      </View>
    </ListCard>
  );
});

const styles = StyleSheet.create({
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  progressWrapper: { flex: 1 },
  qtyText: { fontSize: FontSize.xs, minWidth: 80, textAlign: 'right' },
  metaGroup: { gap: 2, marginTop: Spacing.xs },
  metaText: { fontSize: FontSize.xs },
});

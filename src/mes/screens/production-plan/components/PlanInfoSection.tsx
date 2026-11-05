import { StyleSheet } from 'react-native';
import type { ProductionPlanDetailDto } from '../../../types/models/ProductionPlanDetailDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import { FontSize } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatDate, formatDateStr, formatDateTime } from '../../../../core/utils/date';
import { formatNumber } from '../../../../core/utils/format';
import {
  getMaterialCode,
  getMaterialName,
  getMaterialSpec,
  getMaterialUnit,
} from '../../../utils/material-identity';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanInfoSectionProps {
  plan: ProductionPlanDetailDto;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlanInfoSection({ plan }: PlanInfoSectionProps) {
  const { colors } = useTheme();
  const { formatUnit } = useUnitDisplay('material');
  const warnings = plan.productionConfigWarnings ?? [];

  return (
    <DetailCard title="基本信息">
      <InfoRow label="物料编码" value={getMaterialCode(plan.material ?? {}) || '-'} />
      <InfoRow label="物料名称" value={getMaterialName(plan.material ?? {}) || '-'} />
      <InfoRow label="规格型号" value={getMaterialSpec(plan.material ?? {}) || '-'} />
      <InfoRow label="单位" value={formatUnit(getMaterialUnit(plan.material ?? {})) || '-'} />
      {plan.customer && <InfoRow label="关联客户" value={plan.customer.name} />}
      <InfoRow
        label="需求良品数"
        value={formatNumber(plan.requiredQty, { maximumFractionDigits: 4 })}
      />
      <InfoRow
        label="投产数量"
        value={formatNumber(plan.plannedQty, { maximumFractionDigits: 4 })}
      />
      <InfoRow label="补量率" value={`${Number(plan.plannedLossRate ?? 0).toFixed(2)}%`} />
      <InfoRow
        label="已分配投产"
        value={formatNumber(plan.allocatedPlannedQty, { maximumFractionDigits: 4 })}
      />
      <InfoRow
        label="剩余投产"
        value={formatNumber(plan.remainingPlannedQty, { maximumFractionDigits: 4 })}
      />
      <InfoRow
        label="剩余良品需求"
        value={formatNumber(plan.remainingRequiredQty, { maximumFractionDigits: 4 })}
      />
      <InfoRow label="计划开始" value={formatDateStr(plan.planStartDate)} />
      <InfoRow label="计划截止" value={formatDateStr(plan.planEndDate)} />
      {plan.dueDate && <InfoRow label="交货期限" value={formatDateStr(plan.dueDate)} />}
      {plan.actualStartDate && (
        <InfoRow label="实际开始" value={formatDate(plan.actualStartDate)} />
      )}
      {plan.actualEndDate && <InfoRow label="实际完成" value={formatDate(plan.actualEndDate)} />}
      <InfoRow
        label="优先级"
        value={
          plan.priority <= 2 ? '低' : plan.priority <= 6 ? '中' : plan.priority <= 9 ? '高' : '紧急'
        }
      />
      {plan.bomHeader && <InfoRow label="BOM 名称" value={plan.bomHeader.material?.name} />}
      {plan.bomHeader && (
        <InfoRow
          label="BOM 方案 / 版本"
          value={[plan.bomHeader.bomMaster?.name, plan.bomHeader.version]
            .filter(Boolean)
            .join(' / ')}
        />
      )}
      {plan.route && <InfoRow label="工艺路线" value={plan.route.name} />}
      {plan.routeVersionLabel && <InfoRow label="路线版本" value={plan.routeVersionLabel} />}
      {warnings.length > 0 && <InfoRow label="配置提醒" value={warnings.join('；')} />}
      <InfoRow
        label="来源订单"
        right={
          <Text style={[styles.longInfoValue, { color: colors.text }]}>
            {plan.sourceOrderNo || '-'}
          </Text>
        }
      />
      <InfoRow
        label="来源备注"
        right={
          <Text style={[styles.longInfoValue, { color: colors.text }]}>
            {plan.sourceRemarkSnapshot || '-'}
          </Text>
        }
      />
      <InfoRow label="备注" value={plan.description ?? '-'} />
      <InfoRow label="创建时间" value={formatDateTime(plan.createdAt)} last />
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  longInfoValue: {
    flex: 1,
    flexShrink: 1,
    fontSize: FontSize.base,
    fontWeight: '500',
    textAlign: 'right',
  },
});

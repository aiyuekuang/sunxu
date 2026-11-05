import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import type { WorkOrderDetail } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard, InfoRow, StatusTag } from '../../../../core/components/DetailCard.tsx';
import { MATERIAL_REQ_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime, toDateStr } from '../../../../core/utils/date';
import { BUFFER_SOURCE_LABELS, formatBufferRatio } from '../../schedule/buffer-policy';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkOrderInfoSectionProps {
  order: WorkOrderDetail;
  onNavigateMaterial?: (id: string) => void;
  onNavigatePlan?: (id: string) => void;
  onNavigateCustomer?: (id: string) => void;
  onNavigateParentOrder?: (id: string) => void;
}

function joinNonEmpty(parts: Array<string | null | undefined>, separator: string): string {
  return parts.filter((part): part is string => !!part?.trim()).join(separator);
}

function formatRouteLabel(order: WorkOrderDetail): string | null {
  const code = order.routeCodeSnapshot ?? order.route?.code;
  const name = order.routeNameSnapshot ?? order.route?.name;
  const label = joinNonEmpty([code, name], ' - ');
  return label || null;
}

function formatRouteVersion(order: WorkOrderDetail): string | null {
  return order.routeVersionSnapshot ?? order.routeVersion ?? order.route?.version ?? null;
}

function formatRouteEffectiveRange(order: WorkOrderDetail): string | null {
  if (!order.routeEffectiveFromSnapshot && !order.routeEffectiveToSnapshot) return null;
  const from = order.routeEffectiveFromSnapshot
    ? formatDateTime(order.routeEffectiveFromSnapshot)
    : '未记录';
  const to = order.routeEffectiveToSnapshot
    ? formatDateTime(order.routeEffectiveToSnapshot)
    : '长期有效';
  return `${from} ~ ${to}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkOrderInfoSection({
  order,
  onNavigateMaterial,
  onNavigatePlan,
  onNavigateCustomer,
  onNavigateParentOrder,
}: WorkOrderInfoSectionProps) {
  const { colors } = useTheme();
  const priorityLabel =
    order.priority <= 2 ? '低' : order.priority <= 6 ? '中' : order.priority <= 9 ? '高' : '紧急';
  const materialId = order.material?.id ?? null;
  const planId = order.planId ?? null;
  const customerId = order.customer?.id ?? null;
  const parentWorkOrderId = order.parentWorkOrderId ?? null;
  const routeLabel = formatRouteLabel(order);
  const routeVersion = formatRouteVersion(order);
  const routeEffectiveRange = formatRouteEffectiveRange(order);
  const customerMaterialSnapshot = joinNonEmpty(
    [
      order.plan?.saleOrderItem?.customerMaterialCode,
      order.plan?.saleOrderItem?.customerMaterialName,
      order.plan?.saleOrderItem?.customerMaterialSpec,
    ],
    ' / ',
  );

  const infoRows: {
    label: string;
    value: string;
    onPress?: () => void;
    right?: ReactNode;
  }[] = [
    { label: '工单号', value: order.orderNo },
    ...(routeLabel ? [{ label: '工艺路线', value: routeLabel }] : []),
    ...(routeVersion ? [{ label: '路线版本', value: routeVersion }] : []),
    ...(routeEffectiveRange ? [{ label: '路线有效期', value: routeEffectiveRange }] : []),
    {
      label: '产品编号',
      value: order.material?.code ?? '-',
      ...(materialId && onNavigateMaterial
        ? { onPress: () => onNavigateMaterial(materialId) }
        : {}),
    },
    { label: '优先级', value: priorityLabel },
    { label: '开单时间', value: formatDateTime(order.createdAt) },
    { label: '负责人', value: order.assignee?.realName ?? '-' },
    { label: '入库仓库', value: order.receiptWarehouse?.name ?? '-' },
    ...(order.plan?.planNo
      ? [
          {
            label: '关联计划',
            value: order.plan.planNo,
            ...(planId && onNavigatePlan ? { onPress: () => onNavigatePlan(planId) } : {}),
          },
        ]
      : []),
    ...(order.plan?.sourceOrderNo ? [{ label: '来源订单', value: order.plan.sourceOrderNo }] : []),
    ...(order.sourceRemark
      ? [
          {
            label: '来源备注',
            value: order.sourceRemark,
            // 归集（合并）计划的来源备注是各需求行“单号/行号：备注”的拼接摘要，信息行
            // 默认两行截断会丢掉后半段要求，这里整行铺开显示完整文本。
            right: (
              <Text style={[styles.sourceRemarkValue, { color: colors.text }]}>
                {order.sourceRemark}
              </Text>
            ),
          },
        ]
      : []),
    ...(customerMaterialSnapshot ? [{ label: '客户物料', value: customerMaterialSnapshot }] : []),
    ...(order.customer
      ? [
          {
            label: '关联客户',
            value: order.customer.name,
            ...(customerId && onNavigateCustomer
              ? { onPress: () => onNavigateCustomer(customerId) }
              : {}),
          },
        ]
      : []),
    ...(order.dueDate ? [{ label: '交货期限', value: toDateStr(order.dueDate) }] : []),
    ...(order.workOrderType === 'split' ? [{ label: '工单类型', value: '拆分工单' }] : []),
    ...(order.parentWorkOrderId
      ? [
          {
            label: '来源工单',
            value: order.parentWorkOrder?.orderNo ?? order.parentWorkOrderId,
            ...(parentWorkOrderId && onNavigateParentOrder
              ? { onPress: () => onNavigateParentOrder(parentWorkOrderId) }
              : {}),
          },
        ]
      : []),
    ...(order.planStartTime
      ? [{ label: '计划开始', value: formatDateTime(order.planStartTime) }]
      : []),
    ...(order.planEndTime ? [{ label: '计划完成', value: formatDateTime(order.planEndTime) }] : []),
    ...(order.scheduleBufferMinutes != null
      ? [{ label: '排产缓冲', value: `${order.scheduleBufferMinutes}分` }]
      : []),
    ...(order.scheduleBufferRatio != null
      ? [{ label: '缓冲比例', value: formatBufferRatio(order.scheduleBufferRatio) ?? '-' }]
      : []),
    ...(order.scheduleBufferSource
      ? [
          {
            label: '缓冲来源',
            value: BUFFER_SOURCE_LABELS[order.scheduleBufferSource] ?? order.scheduleBufferSource,
          },
        ]
      : []),
    ...(order.actualStartTime
      ? [{ label: '实际开始', value: formatDateTime(order.actualStartTime) }]
      : []),
    ...(order.actualEndTime
      ? [{ label: '实际完成', value: formatDateTime(order.actualEndTime) }]
      : []),
    ...(order.closedAt ? [{ label: '结案时间', value: formatDateTime(order.closedAt) }] : []),
    ...(order.closer ? [{ label: '结案人', value: order.closer.realName ?? '-' }] : []),
    ...(order.status === 'paused' && order.pauseReason
      ? [{ label: '暂停原因', value: order.pauseReason }]
      : []),
    ...(order.description ? [{ label: '备注', value: order.description }] : []),
  ];

  const reqCfg = MATERIAL_REQ_STATUS_CONFIG[order.materialReqStatus];

  return (
    <DetailCard title="工单信息">
      {infoRows.map((row, idx) => (
        <InfoRow
          key={row.label}
          label={row.label}
          value={row.value}
          right={row.right}
          onPress={row.onPress}
          last={idx === infoRows.length - 1 && !reqCfg}
        />
      ))}
      {reqCfg && (
        <InfoRow
          label="领料状态"
          right={<StatusTag label={reqCfg.label} color={reqCfg.color} bg={reqCfg.bg ?? ''} />}
          last
        />
      )}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  sourceRemarkValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: FontSize.base,
  },
});

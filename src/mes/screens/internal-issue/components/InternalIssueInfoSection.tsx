import type { InternalIssueOrder } from '../../../host/services';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import {
  INTERNAL_ISSUE_STATUS_CONFIG,
  INTERNAL_ISSUE_TYPE_CONFIG,
} from '../../../constants/status-configs';
import { formatDateTime } from '../../../../core/utils/date';

interface InternalIssueInfoSectionProps {
  order: InternalIssueOrder;
}

function getUserName(user?: { realName?: string | null; username?: string | null } | null) {
  return user?.realName || user?.username || '-';
}

export function InternalIssueInfoSection({ order }: InternalIssueInfoSectionProps) {
  return (
    <DetailCard title="领用信息">
      <InfoRow label="领用单号" value={order.issueNo} />
      <InfoRow
        label="领用类型"
        value={INTERNAL_ISSUE_TYPE_CONFIG[order.issueType]?.label ?? order.issueType}
      />
      <InfoRow
        label="状态"
        value={INTERNAL_ISSUE_STATUS_CONFIG[order.status]?.label ?? '未知状态'}
      />
      <InfoRow label="领用人" value={getUserName(order.requester)} />
      <InfoRow label="部门" value={order.department?.name ?? '-'} />
      <InfoRow label="设备" value={order.equipment?.name ?? '-'} />
      <InfoRow label="故障单" value={order.fault?.faultNo ?? '-'} />
      <InfoRow label="保养单" value={order.maintenance?.maintenanceNo ?? '-'} />
      <InfoRow label="工单" value={order.workOrder?.orderNo ?? '-'} />
      <InfoRow label="创建人" value={getUserName(order.creator)} />
      <InfoRow label="创建时间" value={formatDateTime(order.createdAt)} />
      {order.completedAt ? (
        <InfoRow label="确认时间" value={formatDateTime(order.completedAt)} />
      ) : null}
      <InfoRow label="备注" value={order.remarks ?? '-'} last />
    </DetailCard>
  );
}

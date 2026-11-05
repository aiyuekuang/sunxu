import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { ApprovalStepDetail } from '../../host/services';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { DetailCard } from '../../../core/components/DetailCard.tsx';
import { APPROVAL_HISTORY_STATUS_CONFIG } from '../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import type { ApprovalState } from '../../host/hooks/useApprovalStatus';
import { useTheme } from '../../../core/theme/useTheme';
import { formatDateTime } from '../../../core/utils/date';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApprovalTimelineProps {
  /** useApprovalStatus 返回的状态对象 */
  approval: ApprovalState;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ApprovalTimeline({ approval }: ApprovalTimelineProps) {
  if (approval.loading || !approval.isConfigured || approval.steps.length === 0) return null;

  const title = approval.status === 'none' ? '审批流程（待提交）' : '审批流程';

  return (
    <DetailCard title={title} noPadding>
      <View style={styles.timeline}>
        {approval.steps.map((step, idx) => (
          <StepRow key={step.step} step={step} isLast={idx === approval.steps.length - 1} />
        ))}
      </View>
    </DetailCard>
  );
}

// ─── StepRow ──────────────────────────────────────────────────────────────────

interface StepRowProps {
  step: ApprovalStepDetail;
  isLast: boolean;
}

/** 图标是视图关注点，保留在组件本地；文案与颜色统一取归口 APPROVAL_HISTORY_STATUS_CONFIG */
const ICON_BY_STATUS: Record<string, string> = {
  approved: 'checkmark',
  rejected: 'close',
  pending: 'time-outline',
  waiting: 'ellipsis-horizontal',
};

function StepRow({ step, isLast }: StepRowProps) {
  const { colors } = useTheme();

  const cfg = APPROVAL_HISTORY_STATUS_CONFIG[step.status];
  const record = step.record;
  const statusColor = cfg?.color ?? colors.textMuted;
  const dotBg = cfg?.bg ?? colors.surfaceSecondary;

  return (
    <View style={styles.stepRow}>
      {/* 左侧：圆点 + 连线 */}
      <View style={styles.stepLeft}>
        <View style={[styles.stepDot, { backgroundColor: dotBg }]}>
          <Ionicons
            name={
              (ICON_BY_STATUS[step.status] ??
                'ellipsis-horizontal') as keyof typeof Ionicons.glyphMap
            }
            size={14}
            color={statusColor}
          />
        </View>
        {!isLast && <View style={[styles.stepLine, { backgroundColor: colors.border }]} />}
      </View>

      {/* 右侧：步骤信息 */}
      <View style={[styles.stepContent, !isLast && styles.stepContentSpacing]}>
        <View style={styles.stepHeader}>
          <Text style={[styles.stepLabel, { color: colors.text }]}>
            第{step.step}步 · {step.label}
          </Text>
          <Text style={[styles.stepStatus, { color: statusColor }]}>
            {cfg?.label ?? String(step.status)}
          </Text>
        </View>

        {step.assigneeName && (
          <Text style={[styles.stepAssignee, { color: colors.textSecondary }]}>
            {record ? '审批人' : '待审批'}：{step.assigneeName}
          </Text>
        )}

        {record?.createdAt && (
          <Text style={[styles.stepTime, { color: colors.textMuted }]}>
            {formatDateTime(record.createdAt)}
          </Text>
        )}

        {record?.comment && (
          <View style={[styles.commentBubble, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.commentText, { color: colors.textSecondary }]}>
              "{record.comment}"
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  timeline: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  stepRow: { flexDirection: 'row' },
  stepLeft: { alignItems: 'center', width: 28 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: { width: 2, flex: 1, marginVertical: 2 },
  stepContent: { flex: 1, marginLeft: Spacing.sm },
  stepContentSpacing: { paddingBottom: Spacing.md },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: { fontSize: FontSize.base, fontWeight: '500' },
  stepStatus: { fontSize: FontSize.sm, fontWeight: '500' },
  stepAssignee: { fontSize: FontSize.sm, marginTop: 2 },
  stepTime: { fontSize: FontSize.xs, marginTop: 2 },
  commentBubble: {
    marginTop: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  commentText: { fontSize: FontSize.sm, fontStyle: 'italic' },
});

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { type ApprovalRecord, approvalService } from '../../host/services';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';

interface ApprovalHistoryProps {
  entityType: string;
  entityId: string;
}

export function ApprovalHistory({ entityType, entityId }: ApprovalHistoryProps) {
  const { colors } = useTheme();
  const [records, setRecords] = useState<ApprovalRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await approvalService.getHistory(entityType, entityId);
        setRecords(data);
      } catch {
        // 审批历史加载失败不阻断页面，由全局错误处理展示
      }
    };
    load();
  }, [entityType, entityId]);

  if (records.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>审批记录</Text>
      {records.map((record, idx) => (
        <View
          key={record.id}
          style={[
            styles.recordRow,
            idx < records.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.stepBadge,
              {
                backgroundColor:
                  record.action === 'approved' ? colors.successLight : colors.errorLight,
              },
            ]}
          >
            <Ionicons
              name={record.action === 'approved' ? 'checkmark' : 'close'}
              size={14}
              color={record.action === 'approved' ? colors.success : colors.error}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.recordHeader}>
              <Text style={[styles.approverName, { color: colors.text }]}>
                {record.approverName ?? '未知'}
              </Text>
              <Text style={[styles.recordTime, { color: colors.textMuted }]}>
                {new Date(record.createdAt).toLocaleString('zh-CN')}
              </Text>
            </View>
            <Text
              style={[
                styles.actionLabel,
                { color: record.action === 'approved' ? colors.success : colors.error },
              ]}
            >
              第{record.step}步 — {record.action === 'approved' ? '通过' : '驳回'}
            </Text>
            {record.comment && (
              <Text style={[styles.comment, { color: colors.textSecondary }]}>
                "{record.comment}"
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  title: { fontSize: FontSize.base, fontWeight: '600' },
  recordRow: { flexDirection: 'row', paddingVertical: Spacing.sm, gap: Spacing.sm },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  approverName: { fontSize: FontSize.base, fontWeight: '500' },
  recordTime: { fontSize: FontSize.xs },
  actionLabel: { fontSize: FontSize.sm, marginTop: 2 },
  comment: { fontSize: FontSize.sm, marginTop: 2, fontStyle: 'italic' },
});

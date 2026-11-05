import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ImagePreviewModal } from '../../../../core/components/ImagePreviewModal.tsx';
import {
  BATCH_STATUS_LABELS,
  DISPOSAL_STATUS_CONFIG,
  DISPOSAL_TYPE_CONFIG,
  INSPECTION_STATUS_CONFIG,
  INSPECTION_TYPE_CONFIG,
  PACKAGE_TYPE_LABELS,
  PACKAGE_UNIT_STATUS_CONFIG,
  PRODUCTION_SCRAP_STATUS_CONFIG,
  REPORT_LOG_TYPE_CONFIG,
  SALE_DELIVERY_STATUS_CONFIG,
  TRACE_EVENT_TYPE_CONFIG,
  WORK_ORDER_OP_STATUS,
  WORK_ORDER_STATUS_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';
import type { TraceTimelineEvent } from './trace-timeline.ts';

interface TraceTimelineProps {
  events: TraceTimelineEvent[];
}

function getStatusLabel(event: TraceTimelineEvent): string | undefined {
  if (!event.status) return undefined;

  switch (event.type) {
    case 'batch':
      return BATCH_STATUS_LABELS[event.status] ?? '未知状态';
    case 'work_order':
      return WORK_ORDER_STATUS_CONFIG[event.status]?.label ?? '未知状态';
    case 'operation':
      return WORK_ORDER_OP_STATUS[event.status]?.label ?? '未知状态';
    case 'report_log':
      return REPORT_LOG_TYPE_CONFIG[event.status]?.label ?? '未知类型';
    case 'quality_inspection':
      return INSPECTION_STATUS_CONFIG[event.status]?.label ?? '未知状态';
    case 'disposal_order':
      return DISPOSAL_STATUS_CONFIG[event.status]?.label ?? '未知状态';
    case 'production_scrap':
      return PRODUCTION_SCRAP_STATUS_CONFIG[event.status]?.label ?? '未知状态';
    case 'package_unit':
      return PACKAGE_UNIT_STATUS_CONFIG[event.status]?.label ?? '未知状态';
    case 'sale_delivery':
      return SALE_DELIVERY_STATUS_CONFIG[event.status]?.label ?? '未知状态';
    // These graph nodes store a transaction/issue type in `status`, which is
    // already described in Chinese by the node subtitle.
    case 'stock_transaction':
    case 'material_issue':
      return undefined;
    default:
      return '未知状态';
  }
}

function getSubtitle(event: TraceTimelineEvent): string | undefined {
  if (!event.subtitle) return undefined;

  switch (event.type) {
    case 'quality_inspection':
      return INSPECTION_TYPE_CONFIG[event.subtitle]?.label ?? '未知检验类型';
    case 'disposal_order':
      return event.subtitle === '待判定处置'
        ? event.subtitle
        : (DISPOSAL_TYPE_CONFIG[event.subtitle]?.label ?? '未知处置类型');
    case 'package_unit':
      return PACKAGE_TYPE_LABELS[event.subtitle] ?? '未知包装类型';
    default:
      return event.subtitle;
  }
}

function getEventContext(event: TraceTimelineEvent): string[] {
  return [
    ...(event.context?.man ?? []).map((item) => `人：${item.label}`),
    ...(event.context?.machine ?? []).map((item) => `设备：${item.label}`),
    ...(event.context?.material ?? []).map((item) => `${item.role}：${item.label}`),
    ...(event.context?.method ?? []).map((item) => `${item.role}：${item.label}`),
    ...(event.context?.environment ?? []).map(
      (item) =>
        `环境：${item.dataType} ${item.min ?? '—'}~${item.max ?? '—'}${item.unit ?? ''}（${item.count}次）`,
    ),
    ...(event.context?.measurement ?? []).map(
      (item) =>
        `检验：${item.label}${item.measuredValue ? `=${item.measuredValue}${item.unit ?? ''}` : ''}${item.passed === false ? ' 不合格' : ''}`,
    ),
  ];
}

export const TraceTimeline = React.memo(function TraceTimeline({ events }: TraceTimelineProps) {
  const { colors } = useTheme();
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  return (
    <>
      <View style={styles.container}>
        {events.map((event, index) => {
          const context = getEventContext(event);
          const statusLabel = getStatusLabel(event);
          const subtitle = getSubtitle(event);
          const isLast = index === events.length - 1;
          return (
            <View key={event.id} style={styles.row}>
              <View style={styles.rail}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        event.scope === 'serial' ? colors.primary : colors.textTertiary,
                    },
                  ]}
                />
                {!isLast ? (
                  <View style={[styles.line, { backgroundColor: colors.border }]} />
                ) : null}
              </View>
              <View
                style={[
                  styles.eventCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.heading}>
                  <Text style={[styles.eventTitle, { color: colors.text }]}>
                    {event.title || TRACE_EVENT_TYPE_CONFIG[event.type] || '追溯记录'}
                  </Text>
                  <Text
                    style={[
                      styles.scope,
                      {
                        color: event.scope === 'serial' ? colors.primary : colors.textSecondary,
                      },
                    ]}
                  >
                    {event.scope === 'serial' ? '单件记录' : '批号级记录'}
                  </Text>
                </View>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {event.occurredAt ? formatDateTime(event.occurredAt) : '时间未记录'}
                </Text>
                {statusLabel ? (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    状态：{statusLabel}
                  </Text>
                ) : null}
                {subtitle ? (
                  <Text style={[styles.meta, { color: colors.text }]}>{subtitle}</Text>
                ) : null}
                {event.remarks?.map((remark, remarkIndex) => (
                  <Text
                    key={`${event.id}:remark:${remarkIndex}`}
                    style={[styles.meta, { color: colors.text }]}
                    accessibilityLabel={`备注：${remark}`}
                  >
                    <Text style={{ color: colors.textSecondary }}>备注：</Text>
                    {remark}
                  </Text>
                ))}
                {event.photoUrls?.length ? (
                  <View style={styles.photos}>
                    {event.photoUrls.map((url, photoIndex) => (
                      <TouchableOpacity
                        key={`${event.id}:photo:${url}:${photoIndex}`}
                        accessibilityRole="button"
                        accessibilityLabel={`查看追溯照片 ${photoIndex + 1}`}
                        style={styles.photoButton}
                        onPress={() => setPreviewPhotoUrl(url)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: url }}
                          style={[styles.photo, { borderColor: colors.border }]}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
                {event.relationships?.length ? (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    追溯关系：{event.relationships.join('；')}
                  </Text>
                ) : null}
                {event.quantity !== undefined ? (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    数量：{event.quantity} {event.unit ?? ''}
                  </Text>
                ) : null}
                {context.length ? (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    {context.join(' · ')}
                  </Text>
                ) : null}
                {event.missingContext?.length ? (
                  <Text style={[styles.meta, { color: colors.warning }]}>
                    缺少记录：{event.missingContext.join('、')}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
      <ImagePreviewModal
        visible={!!previewPhotoUrl}
        uri={previewPhotoUrl}
        onClose={() => setPreviewPhotoUrl(null)}
      />
    </>
  );
});

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: Spacing.sm },
  rail: { width: 14, alignItems: 'center', position: 'relative' },
  dot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    width: 2,
    top: Spacing.md + 8,
    bottom: -Spacing.sm,
  },
  eventCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  eventTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: '700' },
  scope: { fontSize: FontSize.xs, fontWeight: '600' },
  date: { fontSize: FontSize.xs },
  meta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  photoButton: {
    width: 64,
    height: 64,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
  },
});

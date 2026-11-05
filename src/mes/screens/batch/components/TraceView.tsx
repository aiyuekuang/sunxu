import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { batchService, type TraceDirection, type TraceGraph } from '../../../host/services';
import { productSerialService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { StatusTabs, type TabItem } from '../../../../core/components/StatusTabs.tsx';
import { BATCH_STATUS_LABELS, SERIAL_STATUS_LABELS } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';
import { TraceTimeline } from './TraceTimeline.tsx';
import {
  buildBatchTimelineResult,
  buildSerialTimelineResult,
  type TraceTimelineResult,
} from './trace-timeline.ts';

type TraceIdentifierType = 'batch' | 'serial';

const IDENTIFIER_TYPE_TABS: TabItem<TraceIdentifierType>[] = [
  { key: 'batch', label: '批号' },
  { key: 'serial', label: '成品序列号' },
];

interface TraceViewProps {
  /** 从批号列表点击追溯时传入的批号 */
  initialBatchNo?: string | null;
  /** 从批号列表点击追溯时传入的批次ID，确保按当前货主和行记录定位 */
  initialBatchId?: string | null;
}

export function TraceView({ initialBatchNo, initialBatchId }: TraceViewProps) {
  const { colors } = useTheme();
  const [identifierType, setIdentifierType] = useState<TraceIdentifierType>('batch');
  const [identifier, setIdentifier] = useState(initialBatchNo ?? '');
  const [batchDirection, setBatchDirection] = useState<TraceDirection>('both');
  const [result, setResult] = useState<TraceTimelineResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchRequestId = useRef(0);

  const invalidateSearch = useCallback(() => {
    searchRequestId.current += 1;
    setLoading(false);
  }, []);

  const handleSearch = useCallback(
    async (
      rawIdentifier: string,
      type: TraceIdentifierType = 'batch',
      direction: TraceDirection = 'both',
      batchId?: string | null,
    ) => {
      const requestId = ++searchRequestId.current;
      const normalizedIdentifier = rawIdentifier.trim();
      if (!normalizedIdentifier) {
        setError(type === 'batch' ? '请输入批号' : '请输入成品序列号');
        setResult(null);
        return;
      }

      setIdentifier(normalizedIdentifier);
      setLoading(true);
      setError('');
      setResult(null);
      try {
        if (type === 'batch') {
          const batch = batchId
            ? await batchService.detail(batchId)
            : await batchService.findByBatchNo(normalizedIdentifier);
          const graph = await batchService.traceGraph(batch.id, direction);
          if (requestId !== searchRequestId.current) return;
          setResult(buildBatchTimelineResult(normalizedIdentifier, batch, graph));
          return;
        }

        const serial = await productSerialService.trace(normalizedIdentifier);
        if (requestId !== searchRequestId.current) return;
        let graph: TraceGraph | undefined;
        let graphWarning: string | undefined;
        if (serial.batchId) {
          try {
            graph = await batchService.traceGraph(serial.batchId, 'backward');
          } catch {
            graphWarning = '同批号物料谱系暂时无法加载；单件流转记录仍可查看';
          }
        }
        if (requestId !== searchRequestId.current) return;
        setResult(buildSerialTimelineResult(serial, graph, graphWarning));
      } catch (cause) {
        if (requestId !== searchRequestId.current) return;
        setError(cause instanceof Error ? cause.message : '追溯查询失败，请稍后重试');
      } finally {
        if (requestId === searchRequestId.current) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (initialBatchNo) {
      invalidateSearch();
      setIdentifierType('batch');
      setIdentifier(initialBatchNo);
      setBatchDirection('both');
      void handleSearch(initialBatchNo, 'batch', 'both', initialBatchId);
    }
  }, [handleSearch, initialBatchId, initialBatchNo, invalidateSearch]);

  const handleIdentifierTypeChange = (type: TraceIdentifierType) => {
    if (type === identifierType) return;
    invalidateSearch();
    setIdentifierType(type);
    setResult(null);
    setError('');
  };

  const subject = result?.subject;
  const summary = result?.summary;

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: colors.text }]}>追溯查询</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        输入批号查看全链路，或输入成品序列号查看单件流转记录。
      </Text>

      <StatusTabs
        tabs={IDENTIFIER_TYPE_TABS}
        activeKey={identifierType}
        onChange={handleIdentifierTypeChange}
      />

      {identifierType === 'batch' ? (
        <ChipSelectField
          label="追溯方向"
          appearance="outline"
          options={[
            { label: '正向追溯', value: 'forward' },
            { label: '反向追溯', value: 'backward' },
            { label: '双向追溯', value: 'both' },
          ]}
          value={batchDirection}
          onChange={(value) => {
            if (value !== 'forward' && value !== 'backward' && value !== 'both') {
              return;
            }
            invalidateSearch();
            setBatchDirection(value);
            setResult(null);
            setError('');
          }}
        />
      ) : null}

      <ScanInput
        label={identifierType === 'batch' ? '批号' : '成品序列号'}
        value={identifier}
        onChangeText={(value) => {
          invalidateSearch();
          setIdentifier(value);
          setResult(null);
          setError('');
        }}
        placeholder={identifierType === 'batch' ? '扫码或输入批号' : '扫码或输入成品序列号'}
        onScanResult={(code) => {
          setIdentifier(code);
          void handleSearch(code, identifierType, batchDirection);
        }}
      />

      <TouchableOpacity
        accessibilityRole="button"
        style={[
          styles.searchButton,
          { backgroundColor: colors.primary, opacity: loading ? 0.65 : 1 },
        ]}
        onPress={() => void handleSearch(identifier, identifierType, batchDirection)}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Ionicons name="search-outline" size={18} color={colors.textOnPrimary} />
        <Text style={[styles.searchButtonText, { color: colors.textOnPrimary }]}>
          {loading ? '查询中…' : '查看追溯时间线'}
        </Text>
      </TouchableOpacity>

      {loading ? <InlineLoading /> : null}
      {error ? (
        <View style={[styles.notice, { backgroundColor: `${colors.error}12` }]}>
          <Text style={[styles.noticeText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : null}

      {result && subject ? (
        <View style={styles.resultBlock}>
          <View style={[styles.subjectCard, { backgroundColor: colors.surface }]}>
            <View style={styles.subjectHeading}>
              <View style={[styles.subjectIcon, { backgroundColor: `${colors.primary}12` }]}>
                <Ionicons
                  name={result.identifierType === 'serial' ? 'barcode-outline' : 'layers-outline'}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.subjectIdentity}>
                <Text style={[styles.subjectIdentifier, { color: colors.text }]}>
                  {subject.identifier}
                </Text>
                <Text style={[styles.subjectMaterial, { color: colors.textSecondary }]}>
                  {[subject.materialName, subject.materialCode].filter(Boolean).join(' / ') ||
                    '物料信息未记录'}
                </Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: `${colors.primary}14` }]}>
                <Text style={[styles.statusText, { color: colors.primary }]}>
                  {(result.identifierType === 'serial'
                    ? SERIAL_STATUS_LABELS
                    : BATCH_STATUS_LABELS)[subject.status ?? ''] ??
                    subject.status ??
                    '状态未知'}
                </Text>
              </View>
            </View>
            <View style={[styles.subjectDivider, { backgroundColor: colors.border }]} />
            <View style={styles.subjectFacts}>
              {subject.materialSpec ? <Fact label="规格" value={subject.materialSpec} /> : null}
              {result.identifierType === 'batch' && subject.quantity != null ? (
                <Fact label="当前数量" value={`${subject.quantity} ${subject.unit ?? ''}`} />
              ) : null}
              {subject.workOrderNo ? <Fact label="来源工单" value={subject.workOrderNo} /> : null}
              {subject.sourceOrderNo || subject.demandLineNo != null ? (
                <Fact
                  label="需求来源"
                  value={[
                    subject.sourceOrderNo,
                    subject.demandLineNo != null ? `需求行 ${subject.demandLineNo}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                />
              ) : null}
              {subject.batchNo ? <Fact label="关联批号" value={subject.batchNo} /> : null}
              {subject.warehouseName ? (
                <Fact label="当前仓库" value={subject.warehouseName} />
              ) : null}
            </View>
            {summary ? (
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                批号 {summary.batchCount} · 工单 {summary.workOrderCount} · 质检{' '}
                {summary.qualityCount} · 客户 {summary.customerCount}
              </Text>
            ) : null}
          </View>

          {result.warnings.map((warning) => (
            <View key={warning} style={[styles.notice, { backgroundColor: `${colors.warning}18` }]}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
              <Text style={[styles.noticeText, { color: colors.text }]}>{warning}</Text>
            </View>
          ))}

          <View style={styles.timelineHeading}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>追溯时间线</Text>
            <Text style={[styles.eventCount, { color: colors.textSecondary }]}>
              {result.events.length} 条 · 由早到晚
            </Text>
          </View>
          {result.events.length ? (
            <TraceTimeline events={result.events} />
          ) : (
            <EmptyState
              icon="time-outline"
              title="暂无追溯事件"
              description="当前对象尚无可展示的流转记录"
              compact
            />
          )}
          {result.events.some((event) => event.occurredAt) ? (
            <Text style={[styles.updatedAt, { color: colors.textTertiary }]}>
              时间按业务记录时间排序 · 最新记录{' '}
              {formatDateTime(
                [...result.events].reverse().find((event) => event.occurredAt)?.occurredAt,
              )}
            </Text>
          ) : null}
        </View>
      ) : null}

      {!result && !loading && !error ? (
        <EmptyState
          icon="git-network-outline"
          title="开始查询追溯"
          description="支持扫码或手动输入批号、成品序列号"
          compact
        />
      ) : null}
    </ScrollView>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.fact}>
      <Text style={[styles.factLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.factValue, { color: colors.text }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.md, paddingBottom: Spacing['2xl'], gap: Spacing.sm },
  title: { fontSize: FontSize.lg, fontWeight: '700' },
  description: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  searchButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  searchButtonText: { fontSize: FontSize.sm, fontWeight: '700' },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  noticeText: { flex: 1, fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  resultBlock: { gap: Spacing.md, marginTop: Spacing.xs },
  subjectCard: { padding: Spacing.md, borderRadius: Radius.md, gap: Spacing.sm },
  subjectHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  subjectIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectIdentity: { flex: 1, minWidth: 0, gap: 2 },
  subjectIdentifier: { fontSize: FontSize.base, fontWeight: '700' },
  subjectMaterial: { fontSize: FontSize.xs },
  statusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  subjectDivider: { height: StyleSheet.hairlineWidth },
  subjectFacts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  fact: { minWidth: '42%', flexGrow: 1, gap: 2 },
  factLabel: { fontSize: FontSize.xs },
  factValue: { fontSize: FontSize.sm, fontWeight: '500' },
  summaryText: { fontSize: FontSize.xs },
  timelineHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700' },
  eventCount: { fontSize: FontSize.xs },
  updatedAt: { fontSize: FontSize.xs, textAlign: 'right' },
});

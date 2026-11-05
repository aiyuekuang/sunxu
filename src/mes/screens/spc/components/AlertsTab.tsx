import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { type SpcAlert, type SpcAlertListParams, type SpcAlertStatus, spcService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge } from '../../../../core/components/Badge.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { InlineLoading, LoadingView } from '../../../../core/components/LoadingView.tsx';
import { StatusTabs } from '../../../../core/components/StatusTabs.tsx';
import { P } from '../../../host/authorization';
import {
  SPC_ALERT_SEVERITY_CONFIG,
  SPC_ALERT_STATUS_CONFIG,
  SPC_ALERT_TYPE_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useListData } from '../../../../core/hooks/useListData';
import { usePermission } from '../../../host/hooks/usePermission';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatShortDateTime } from '../../../../core/utils/date';
import { toast } from '../../../../core/toast';

interface AlertsTabProps {
  insets: EdgeInsets;
  initialAlertId?: string;
}

type AlertTabKey = 'open' | 'all' | SpcAlertStatus;
type AlertAction = 'handle' | 'close' | 'cancel' | 'escalate';

const TABS = [
  { key: 'open' as AlertTabKey, label: '待处理' },
  { key: 'processing' as AlertTabKey, label: '处理中' },
  { key: 'all' as AlertTabKey, label: '全部' },
  { key: 'closed' as AlertTabKey, label: '已关闭' },
];

function canOperate(alert: SpcAlert) {
  return alert.status === 'open' || alert.status === 'processing';
}

function userName(user: SpcAlert['assignee']) {
  return user?.realName || user?.username || '-';
}

function actionTitle(action?: AlertAction) {
  switch (action) {
    case 'handle':
      return '处理 SPC 异常';
    case 'close':
      return '关闭 SPC 异常';
    case 'cancel':
      return '取消 SPC 异常';
    case 'escalate':
      return '升级 CAPA';
    default:
      return 'SPC 异常';
  }
}

export function AlertsTab({ insets, initialAlertId }: AlertsTabProps) {
  const { colors } = useTheme();
  const canHandle = usePermission(P.SPC_ALERTS_HANDLE);
  const canClose = usePermission(P.SPC_ALERTS_CLOSE);
  const canEscalate = usePermission(P.SPC_ALERTS_ESCALATE);
  const [activeTab, setActiveTab] = useState<AlertTabKey>(() => (initialAlertId ? 'all' : 'open'));
  const [directAlertId, setDirectAlertId] = useState<string | undefined>(initialAlertId);
  const [activeAction, setActiveAction] = useState<{ type: AlertAction; record: SpcAlert } | null>(
    null,
  );
  const [handleResult, setHandleResult] = useState('');
  const [closeEvidence, setCloseEvidence] = useState('');
  const [remarks, setRemarks] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialAlertId) return;
    setDirectAlertId(initialAlertId);
    setActiveTab('all');
  }, [initialAlertId]);

  const handleTabChange = useCallback((key: AlertTabKey) => {
    setDirectAlertId(undefined);
    setActiveTab(key);
  }, []);

  const { list, loading, refreshing, onRefresh, onEndReached, loadData } = useListData<
    SpcAlert,
    SpcAlertListParams
  >({
    fetchFn: (params) => spcService.alerts(params),
    params: directAlertId
      ? { id: directAlertId }
      : activeTab === 'all'
        ? {}
        : { status: activeTab as SpcAlertStatus },
    focusDeps: [activeTab, directAlertId],
  });

  const openAction = useCallback((type: AlertAction, record: SpcAlert) => {
    setHandleResult(record.handleResult ?? '');
    setCloseEvidence(record.closeEvidence ?? '');
    setRemarks('');
    setDueDate('');
    setActiveAction({ type, record });
  }, []);

  const closeAction = useCallback(() => {
    setActiveAction(null);
    setHandleResult('');
    setCloseEvidence('');
    setRemarks('');
    setDueDate('');
  }, []);

  const submitAction = async () => {
    if (!activeAction) return;
    const id = activeAction.record.id;
    const trimmedResult = handleResult.trim();
    if ((activeAction.type === 'handle' || activeAction.type === 'close') && !trimmedResult) {
      toast.info(activeAction.type === 'handle' ? '请输入处理说明' : '请输入处理结论');
      return;
    }

    setSaving(true);
    try {
      if (activeAction.type === 'handle') {
        await spcService.handleAlert({
          id,
          handleResult: trimmedResult,
          remarks: remarks.trim() || undefined,
        });
        toast.success('SPC 异常已进入处理中');
      }
      if (activeAction.type === 'close') {
        await spcService.closeAlert({
          id,
          handleResult: trimmedResult,
          closeEvidence: closeEvidence.trim() || undefined,
          remarks: remarks.trim() || undefined,
        });
        toast.success('SPC 异常已关闭');
      }
      if (activeAction.type === 'cancel') {
        await spcService.cancelAlert({ id, reason: remarks.trim() || undefined });
        toast.success('SPC 异常已取消');
      }
      if (activeAction.type === 'escalate') {
        await spcService.escalateAlert({
          id,
          dueDate: dueDate.trim() || undefined,
          remarks: remarks.trim() || undefined,
        });
        toast.success('已升级为 CAPA');
      }
      closeAction();
      loadData(true);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: SpcAlert }) => {
      const statusCfg = SPC_ALERT_STATUS_CONFIG[item.status];
      const severityCfg = SPC_ALERT_SEVERITY_CONFIG[item.severity];
      const actionAllowed = canOperate(item);
      return (
        <ListCard>
          <ListCard.Header>
            <ListCard.Code>{item.alertNo}</ListCard.Code>
            <View style={styles.badgeRow}>
              <Badge
                label={
                  item.alertTypeLabel ?? SPC_ALERT_TYPE_CONFIG[item.alertType] ?? item.alertType
                }
                variant="warning"
                size="sm"
              />
              <Badge
                label={item.severityLabel ?? severityCfg?.label ?? item.severity}
                color={severityCfg?.color}
                bg={severityCfg?.bg}
                size="sm"
              />
              <Badge
                label={item.statusLabel ?? statusCfg?.label ?? item.status}
                color={statusCfg?.color}
                bg={statusCfg?.bg}
                size="sm"
              />
            </View>
          </ListCard.Header>
          <ListCard.Title numberOfLines={1}>
            {item.material?.name ?? '未关联物料'} · {item.characteristicName}
          </ListCard.Title>
          <ListCard.Subtitle>{item.triggerMessage}</ListCard.Subtitle>
          <ListCard.Meta>
            <ListCard.MetaText>{`负责人: ${userName(item.assignee)}`}</ListCard.MetaText>
            {item.measuredValue != null && (
              <ListCard.MetaText>{`测量值: ${Number(item.measuredValue).toFixed(4)}`}</ListCard.MetaText>
            )}
            <ListCard.MetaText>{formatShortDateTime(item.createdAt)}</ListCard.MetaText>
          </ListCard.Meta>
          {actionAllowed && (canHandle || canClose || canEscalate) ? (
            <ListCard.Actions>
              {canHandle && (
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.border }]}
                  onPress={(event) => {
                    event.stopPropagation();
                    openAction('handle', item);
                  }}
                >
                  <Badge label="处理" variant="primary" size="sm" />
                </TouchableOpacity>
              )}
              {canClose && (
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.border }]}
                  onPress={(event) => {
                    event.stopPropagation();
                    openAction('close', item);
                  }}
                >
                  <Badge label="关闭" variant="success" size="sm" />
                </TouchableOpacity>
              )}
              {canEscalate && !item.capaId && (
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.border }]}
                  onPress={(event) => {
                    event.stopPropagation();
                    openAction('escalate', item);
                  }}
                >
                  <Badge label="CAPA" variant="warning" size="sm" />
                </TouchableOpacity>
              )}
              {canHandle && (
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.border }]}
                  onPress={(event) => {
                    event.stopPropagation();
                    openAction('cancel', item);
                  }}
                >
                  <Badge label="取消" variant="default" size="sm" />
                </TouchableOpacity>
              )}
            </ListCard.Actions>
          ) : null}
        </ListCard>
      );
    },
    [canClose, canEscalate, canHandle, colors.border, openAction],
  );

  if (loading && !list.length) {
    return <LoadingView />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusTabs tabs={TABS} activeKey={activeTab} onChange={handleTabChange} />
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing['3xl'] },
          !list.length && styles.emptyContent,
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="alert-circle-outline"
            title="暂无 SPC 异常"
            description="超规格或超控制限的采样记录会自动进入这里。"
          />
        }
        ListFooterComponent={
          loading && list.length ? <InlineLoading style={styles.footer} /> : null
        }
      />

      <FullScreenModal
        visible={!!activeAction}
        title={actionTitle(activeAction?.type)}
        onClose={closeAction}
        confirmText="提交"
        onConfirm={submitAction}
        loading={saving}
        avoidKeyboard
      >
        {activeAction?.record ? (
          <View style={[styles.summaryCard, { backgroundColor: colors.surfaceSecondary }]}>
            <TextLine label="异常单" value={activeAction.record.alertNo} />
            <TextLine label="触发原因" value={activeAction.record.triggerMessage} />
          </View>
        ) : null}
        {(activeAction?.type === 'handle' || activeAction?.type === 'close') && (
          <FormField
            label={activeAction?.type === 'handle' ? '处理说明' : '处理结论'}
            required
            value={handleResult}
            onChangeText={setHandleResult}
            multiline
            numberOfLines={4}
            placeholder="说明已确认的原因、临时控制或处理结果"
          />
        )}
        {activeAction?.type === 'close' && (
          <FormField
            label="关闭证据"
            value={closeEvidence}
            onChangeText={setCloseEvidence}
            multiline
            numberOfLines={3}
            placeholder="填写复测、现场确认或附件说明"
          />
        )}
        {activeAction?.type === 'escalate' && (
          <FormField
            label="计划完成日期"
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
          />
        )}
        <FormField
          label={activeAction?.type === 'cancel' ? '取消原因' : '备注'}
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={3}
        />
      </FullScreenModal>
    </View>
  );
}

function TextLine({ label, value }: { label: string; value?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.textLine}>
      <Text style={[styles.textLineLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.textLineValue, { color: colors.text }]}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: Spacing.md, gap: Spacing.sm },
  emptyContent: { flexGrow: 1 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: Spacing.xs },
  actionBtn: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.full },
  footer: { paddingVertical: Spacing.md },
  summaryCard: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  textLine: { gap: 2 },
  textLineLabel: { fontSize: FontSize.xs },
  textLineValue: { fontSize: FontSize.sm, lineHeight: 19 },
});

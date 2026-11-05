import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  type AgingRow,
  financeService,
  type ProfitabilityTrialItem,
  type ProfitabilityTrialSummary,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { LoadingView } from '../../../../core/components/LoadingView.tsx';
import { P } from '../../../host/authorization';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { usePermission } from '../../../host/hooks/usePermission';
import { useTheme } from '../../../../core/theme/useTheme';
import type { RootStackParamList } from '../../../host/navigation';
import { monthStart, today } from '../../../../core/utils/date';
import { formatCompactNumber } from '../../../../core/utils/format';
import { toast } from '../../../../core/toast';
import { ReportMetricCard, type ReportMetricTone } from './ReportMetricCard.tsx';
import { ReportPolicyDisclosure } from './ReportPolicyDisclosure.tsx';

interface FinanceMetricCard {
  key: string;
  label: string;
  value: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: ReportMetricTone;
  onPress: () => void;
}

interface FinanceIssueRow {
  key: string;
  title: string;
  subtitle: string;
  value: string;
  color: string;
  onPress?: () => void;
}

interface FinanceOverviewData {
  receivableTotal: number;
  receivableOverdue: number;
  payableTotal: number;
  profitSummary: ProfitabilityTrialSummary | null;
  overduePartners: AgingRow[];
  missingMaterials: ProfitabilityTrialItem[];
}

const FINANCE_POLICY_ITEMS = [
  '应收与应付指标取实时往来数据。',
  '本月试算毛利按本月第一天至今天的经营数据估算。',
];

function getOverdueAmount(row: AgingRow): number {
  return row.days1to30 + row.days31to60 + row.days61to90 + row.over90;
}

function formatCompactCurrency(value: number, mask: (amount: string) => string): string {
  const abs = Math.abs(value);
  const prefix = value < 0 ? '-¥' : '¥';
  return mask(`${prefix}${formatCompactNumber(abs, { maximumFractionDigits: 1 })}`);
}

export function FinanceTab() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { mask } = useAmountDisplay();
  const canViewFinanceInvoices = usePermission(P.FINANCE_INVOICE_LIST);

  const [data, setData] = useState<FinanceOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [receivableAging, payableAging, profitability] = await Promise.all([
        financeService.agingReport({ type: 'receivable' }),
        financeService.agingReport({ type: 'payable' }),
        financeService.profitabilityTrial({
          page: 1,
          pageSize: 100,
          orderBy: 'salesAmount',
          orderDir: 'DESC',
          dateFrom: monthStart(),
          dateTo: today(),
        }),
      ]);

      const overduePartners = [...receivableAging]
        .filter((item) => getOverdueAmount(item) > 0)
        .sort((a, b) => getOverdueAmount(b) - getOverdueAmount(a))
        .slice(0, 3);

      const missingMaterials = (profitability.list ?? [])
        .filter((item) => !item.hasCostBasis)
        .sort((a, b) => b.salesAmount - a.salesAmount)
        .slice(0, 3);

      setData({
        receivableTotal: receivableAging.reduce((sum, item) => sum + item.total, 0),
        receivableOverdue: receivableAging.reduce((sum, item) => sum + getOverdueAmount(item), 0),
        payableTotal: payableAging.reduce((sum, item) => sum + item.total, 0),
        profitSummary: profitability.summary ?? null,
        overduePartners,
        missingMaterials,
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '财务概览加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const metricCards = useMemo<FinanceMetricCard[]>(() => {
    if (!data) return [];
    const profit = data.profitSummary?.estimatedGrossProfit ?? 0;
    return [
      {
        key: 'receivable-total',
        label: '应收未结',
        value: formatCompactCurrency(data.receivableTotal, mask),
        hint: '实时往来',
        icon: 'receipt-outline',
        tone: 'primary',
        onPress: () =>
          navigation.navigate('Finance', {
            screen: 'PartnerSummary',
            params: { type: 'receivable' },
          }),
      },
      {
        key: 'receivable-overdue',
        label: '逾期应收',
        value: formatCompactCurrency(data.receivableOverdue, mask),
        hint: '优先催收',
        icon: 'warning-outline',
        tone: 'error',
        onPress: () =>
          navigation.navigate('Finance', {
            screen: 'AgingReport',
            params: { type: 'receivable' },
          }),
      },
      {
        key: 'payable-total',
        label: '应付未结',
        value: formatCompactCurrency(data.payableTotal, mask),
        hint: '实时往来',
        icon: 'wallet-outline',
        tone: 'warning',
        onPress: () =>
          navigation.navigate('Finance', {
            screen: 'PartnerSummary',
            params: { type: 'payable' },
          }),
      },
      {
        key: 'profit-summary',
        label: '本月试算毛利',
        value: formatCompactCurrency(profit, mask),
        hint: '经营结果',
        icon: 'analytics-outline',
        tone: profit >= 0 ? 'success' : 'error',
        onPress: () =>
          navigation.navigate('Finance', {
            screen: 'ProfitabilityTrial',
          }),
      },
    ];
  }, [data, mask, navigation]);

  const overdueRows = useMemo<FinanceIssueRow[]>(() => {
    if (!data) return [];
    return data.overduePartners.map((item) => ({
      key: item.partnerId,
      title: item.partnerName,
      subtitle: `${item.partnerCode} · 逾期应收`,
      value: formatCompactCurrency(getOverdueAmount(item), mask),
      color: colors.error,
      onPress: canViewFinanceInvoices
        ? () =>
            navigation.navigate('Finance', {
              screen: 'InvoiceList',
              params: {
                type: 'receivable',
                partnerId: item.partnerId,
                partner: {
                  id: item.partnerId,
                  name: item.partnerName,
                  code: item.partnerCode,
                },
              },
            })
        : undefined,
    }));
  }, [canViewFinanceInvoices, colors.error, data, mask, navigation]);

  const missingRows = useMemo<FinanceIssueRow[]>(() => {
    if (!data) return [];
    return data.missingMaterials.map((item) => ({
      key: item.materialId,
      title: item.materialName ?? item.materialCode ?? '未命名物料',
      subtitle: `${item.materialCode ?? '-'} · 缺成本依据`,
      value: formatCompactCurrency(item.salesAmount, mask),
      color: colors.warning,
      onPress: () =>
        navigation.navigate('Finance', {
          screen: 'ProfitabilityTrial',
        }),
    }));
  }, [colors.warning, data, mask, navigation]);

  const quickActions = useMemo(
    () => [
      {
        key: 'aging-report',
        label: '账龄分析',
        description: '看逾期结构，再继续下钻往来单位和单据。',
        icon: 'time-outline',
        color: colors.error,
        onPress: () =>
          navigation.navigate('Finance', {
            screen: 'AgingReport',
            params: { type: 'receivable' },
          }),
      },
      {
        key: 'profitability-trial',
        label: '利润试算',
        description: '看本月经营结果和缺成本物料，再回单据核实。',
        icon: 'bar-chart-outline',
        color: colors.warning,
        onPress: () =>
          navigation.navigate('Finance', {
            screen: 'ProfitabilityTrial',
          }),
      },
    ],
    [colors.error, colors.warning, navigation],
  );

  if (loading) {
    return <LoadingView />;
  }

  if (!data) {
    return (
      <EmptyState
        compact
        icon="wallet-outline"
        title="财务概览加载失败"
        action={{ label: '重试', onPress: () => loadData() }}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
    >
      <View style={styles.headingRow}>
        <Text style={[styles.headingTitle, { color: colors.text }]}>财务概览</Text>
        <ReportPolicyDisclosure items={FINANCE_POLICY_ITEMS} />
      </View>

      <View style={styles.metricGrid}>
        {metricCards.map((card) => (
          <ReportMetricCard
            key={card.key}
            label={card.label}
            value={card.value}
            hint={card.hint}
            icon={card.icon}
            tone={card.tone}
            onPress={card.onPress}
          />
        ))}
      </View>

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>需要优先处理</Text>
        <View
          style={[
            styles.issueCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.issueHeader}>
            <Text style={[styles.issueTitle, { color: colors.text }]}>逾期往来单位</Text>
            <TouchableOpacity
              style={styles.issueLinkButton}
              activeOpacity={0.7}
              hitSlop={HIT_SLOP}
              accessibilityRole="button"
              accessibilityLabel="查看应收账龄"
              onPress={() =>
                navigation.navigate('Finance', {
                  screen: 'AgingReport',
                  params: { type: 'receivable' },
                })
              }
            >
              <Text style={[styles.issueLink, { color: colors.primary }]}>查看账龄</Text>
            </TouchableOpacity>
          </View>
          {overdueRows.length > 0 ? (
            overdueRows.map((row, index) => (
              <TouchableOpacity
                key={row.key}
                style={[
                  styles.issueRow,
                  index < overdueRows.length - 1 && {
                    borderBottomColor: colors.border,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                ]}
                activeOpacity={row.onPress ? 0.7 : 1}
                disabled={!row.onPress}
                onPress={row.onPress}
                accessibilityRole={row.onPress ? 'button' : undefined}
                accessibilityLabel={`${row.title} ${row.value}`}
                accessibilityHint={row.onPress ? row.subtitle : undefined}
              >
                <View style={styles.issueTextWrap}>
                  <Text style={[styles.issueRowTitle, { color: colors.text }]}>{row.title}</Text>
                  <Text style={[styles.issueRowSubtitle, { color: colors.textSecondary }]}>
                    {row.subtitle}
                  </Text>
                </View>
                <View style={styles.issueValueWrap}>
                  <Text style={[styles.issueValue, { color: row.color }]}>{row.value}</Text>
                  {row.onPress ? (
                    <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} />
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              当前没有逾期往来单位。
            </Text>
          )}
        </View>

        <View
          style={[
            styles.issueCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.issueHeader}>
            <Text style={[styles.issueTitle, { color: colors.text }]}>缺成本物料</Text>
            <TouchableOpacity
              style={styles.issueLinkButton}
              activeOpacity={0.7}
              hitSlop={HIT_SLOP}
              accessibilityRole="button"
              accessibilityLabel="查看盈利试算"
              onPress={() =>
                navigation.navigate('Finance', {
                  screen: 'ProfitabilityTrial',
                })
              }
            >
              <Text style={[styles.issueLink, { color: colors.primary }]}>查看试算</Text>
            </TouchableOpacity>
          </View>
          {missingRows.length > 0 ? (
            missingRows.map((row, index) => (
              <TouchableOpacity
                key={row.key}
                style={[
                  styles.issueRow,
                  index < missingRows.length - 1 && {
                    borderBottomColor: colors.border,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                ]}
                activeOpacity={0.7}
                onPress={row.onPress}
                accessibilityRole="button"
                accessibilityLabel={`${row.title} ${row.value}`}
                accessibilityHint={row.subtitle}
              >
                <View style={styles.issueTextWrap}>
                  <Text style={[styles.issueRowTitle, { color: colors.text }]}>{row.title}</Text>
                  <Text style={[styles.issueRowSubtitle, { color: colors.textSecondary }]}>
                    {row.subtitle}
                  </Text>
                </View>
                <View style={styles.issueValueWrap}>
                  <Text style={[styles.issueValue, { color: row.color }]}>{row.value}</Text>
                  <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              当前没有缺成本物料。
            </Text>
          )}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>分析入口</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={[
                styles.actionCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityHint={action.description}
            >
              <Ionicons
                name={action.icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={action.color}
              />
              <Text style={[styles.actionTitle, { color: colors.text }]}>{action.label}</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                {action.description}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color={colors.textSecondary}
                style={styles.drillIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headingTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  drillIcon: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  sectionBlock: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  issueCard: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadow.sm,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  issueTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  issueLink: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  issueLinkButton: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  issueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  issueTextWrap: {
    flex: 1,
    gap: Spacing.xs,
  },
  issueRowTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  issueRowSubtitle: {
    fontSize: FontSize.xs,
  },
  issueValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  issueValue: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: FontSize.sm,
    paddingVertical: Spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionCard: {
    width: '47%',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  actionTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  actionDesc: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs + Spacing.sm,
  },
});

import {
  AppText,
  ActionButton,
  ActionMenu,
  Avatar,
  Badge,
  BottomActionBar,
  CenteredModal,
  ChoiceSheet,
  CheckboxField,
  ControlSize,
  DateNavigator,
  DetailCard,
  DetailActionBar,
  DetailScreenContainer,
  Divider,
  ErrorBoundary,
  EntityFilterChip,
  FAB,
  FilterBar,
  FullScreenModal,
  FormField,
  FormPage,
  FormSection,
  InfoRow,
  InlineLoading,
  IconActionButton,
  ListCard,
  ListScreenContainer,
  MetricCard,
  PickerField,
  PhotoPicker,
  ProfileIdentity,
  SearchBar,
  ScalePressable,
  SectionCard,
  SettingsRow,
  Spacing,
  StatusTabs,
  Skeleton,
  SwipeableRow,
  SunxuProvider,
  ToastHost,
  type EntityFilterValue,
  type EntityPickerFetchFn,
  type PickerOption,
  type AdvancedFilterConfig,
  type TabItem,
  useTheme,
} from 'sunxu';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import dayjs from 'dayjs';
import { VisualExamples } from './VisualExamples';
import { SunxuQueryProvider } from 'sunxu/query';
import { TabQueryCacheExample } from './TabQueryCacheExample';
import { queryClient } from './queryClient';
import Toast from 'react-native-toast-message';

type ScreenKey = 'list' | 'form' | 'detail' | 'components' | 'visuals';
type CustomerStatus = 'all' | 'active' | 'paused';
type ComponentStatus = 'all' | 'waiting' | 'done';
type TimelineFilterDemo = 'all' | 'calls' | 'followups' | 'others';
type CustomerOpportunityDemo = 'customers' | 'opportunities';

const screenTabs: { key: ScreenKey; label: string }[] = [
  { key: 'list', label: '列表' },
  { key: 'form', label: '表单' },
  { key: 'components', label: '组件' },
  { key: 'visuals', label: '地图图表' },
];

const customerTabs: TabItem<CustomerStatus>[] = [
  { key: 'all', label: '全部', count: 24 },
  { key: 'active', label: '合作中', count: 18 },
  { key: 'paused', label: '已暂停', count: 6 },
];

const customers = [
  { code: 'CUS-2026-0184', name: '青禾精密制造', contact: '林经理 · 138 0000 1840', status: '合作中' },
  { code: 'CUS-2026-0167', name: '澄海工业设备', contact: '陈女士 · 138 0000 1670', status: '合作中' },
  { code: 'CUS-2026-0122', name: '原点科技', contact: '周先生 · 138 0000 1220', status: '待确认' },
];

function CatalogErrorExample({ failed }: { failed: boolean }) {
  if (failed) throw new Error('Sunxu 错误边界演示');
  return <AppText>页面内容正常；点击上方按钮查看共享错误兜底。</AppText>;
}

const componentTabs: TabItem<ComponentStatus>[] = [
  { key: 'all', label: '全部', count: 24, accessibilityHint: '显示所有客户跟进记录' },
  { key: 'waiting', label: '待跟进', count: 6 },
  { key: 'done', label: '已完成', count: 18 },
];

const timelineFilterTabs: TabItem<TimelineFilterDemo>[] = [
  { key: 'all', label: '全部' },
  { key: 'calls', label: '通话' },
  { key: 'followups', label: '跟进' },
  { key: 'others', label: '其他' },
];

const disabledTimelineFilterTabs = timelineFilterTabs.map((tab) =>
  tab.key === 'followups' ? { ...tab, disabled: true } : tab,
);

const customerOpportunityTabs: TabItem<CustomerOpportunityDemo>[] = [
  { key: 'customers', label: '客户' },
  { key: 'opportunities', label: '商机' },
];

const pickerOptions: PickerOption[] = [
  { label: '林经理', value: 'lin' },
  { label: '陈女士', value: 'chen' },
  { label: '周先生', value: 'zhou' },
  { label: '赵工', value: 'zhao' },
  { label: '王主管', value: 'wang' },
  { label: '李顾问', value: 'li' },
  { label: '孙经理', value: 'sun' },
  { label: '吴专员', value: 'wu' },
];

const demoAdvancedFilters: AdvancedFilterConfig[] = [
  {
    key: 'status',
    label: '状态',
    options: [
      { label: '进行中', value: 'active' },
      { label: '已暂停', value: 'paused' },
    ],
  },
  {
    key: 'region',
    label: '地区',
    options: [
      { label: '华东', value: 'east' },
      { label: '华南', value: 'south' },
      { label: '华北', value: 'north' },
    ],
  },
  {
    key: 'source',
    label: '来源',
    options: [
      { label: '线上', value: 'online' },
      { label: '线下', value: 'offline' },
      { label: '推荐', value: 'referral' },
    ],
  },
  {
    key: 'level',
    label: '客户等级',
    options: [
      { label: 'A 级', value: 'a' },
      { label: 'B 级', value: 'b' },
      { label: 'C 级', value: 'c' },
    ],
  },
  {
    key: 'owner',
    label: '负责人',
    options: [
      { label: '林经理', value: 'lin' },
      { label: '陈女士', value: 'chen' },
      { label: '周先生', value: 'zhou' },
    ],
  },
  {
    key: 'scale',
    label: '团队规模',
    options: [
      { label: '1–20 人', value: 'small' },
      { label: '21–100 人', value: 'medium' },
      { label: '100 人以上', value: 'large' },
    ],
  },
  {
    key: 'activity',
    label: '近期活动',
    options: [
      { label: '有跟进', value: 'followed' },
      { label: '无跟进', value: 'unfollowed' },
    ],
  },
  {
    type: 'date_range',
    key: 'created',
    label: '创建日期',
    startKey: 'createdFrom',
    endKey: 'createdTo',
  },
];

type DemoEntity = { id: string; name: string; categoryId: string; detail: string };

const demoEntities: DemoEntity[] = [
  { id: 'customer-1', name: '青禾精密制造', categoryId: 'customer', detail: '上海 · 合作中' },
  { id: 'customer-2', name: '澄海工业设备', categoryId: 'customer', detail: '苏州 · 合作中' },
  { id: 'partner-1', name: '北辰供应服务', categoryId: 'partner', detail: '杭州 · 服务商' },
  { id: 'partner-2', name: '安达物流', categoryId: 'partner', detail: '宁波 · 服务商' },
];

const fetchDemoEntities: EntityPickerFetchFn<DemoEntity> = async ({ keyword, categoryId }) => {
  const filtered = demoEntities.filter((item) => {
    const categoryMatches = !categoryId || item.categoryId === categoryId;
    const keywordMatches = !keyword || item.name.includes(keyword);
    return categoryMatches && keywordMatches;
  });
  return { list: filtered, total: filtered.length };
};

const fetchDemoCategories = async () => [
  { id: 'customer', name: '客户' },
  { id: 'partner', name: '合作方' },
];

function ExampleTabs({ current, onChange }: { current: ScreenKey; onChange: (key: ScreenKey) => void }) {
  const { colors } = useTheme();

  return (
    <BottomActionBar style={styles.exampleTabs}>
      {screenTabs.map((tab) => (
        <Pressable
          key={tab.key}
          style={styles.exampleTab}
          onPress={() => onChange(tab.key)}
          accessibilityRole="tab"
          accessibilityLabel={`${tab.label}页面示例`}
          accessibilityState={{ selected: current === tab.key }}
        >
          <AppText
            style={[
              styles.exampleTabText,
              current === tab.key && { color: colors.primary, fontWeight: '700' },
            ]}
          >
            {tab.label}
          </AppText>
        </Pressable>
      ))}
    </BottomActionBar>
  );
}

function ComponentExamples({
  current,
  onChange,
  isDark,
  onToggleTheme,
}: {
  current: ScreenKey;
  onChange: (key: ScreenKey) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}) {
  const today = dayjs().format('YYYY-MM-DD');
  const { colors } = useTheme();
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState<ComponentStatus>('all');
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilterDemo>('all');
  const [disabledTimelineFilter, setDisabledTimelineFilter] = useState<TimelineFilterDemo>('all');
  const [customerOpportunity, setCustomerOpportunity] = useState<CustomerOpportunityDemo>('customers');
  const [search, setSearch] = useState('');
  const [quickPeriod, setQuickPeriod] = useState('today');
  const [advancedFilterValues, setAdvancedFilterValues] = useState<
    Record<string, string | undefined>
  >({});
  const [pickerValue, setPickerValue] = useState('lin');
  const [entityValue, setEntityValue] = useState<EntityFilterValue | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [fillModalVisible, setFillModalVisible] = useState(false);
  const [centeredModalVisible, setCenteredModalVisible] = useState(false);
  const [immersiveModalVisible, setImmersiveModalVisible] = useState(false);
  const [keyboardModalVisible, setKeyboardModalVisible] = useState(false);
  const [choiceSheetVisible, setChoiceSheetVisible] = useState(false);
  const [choiceValue, setChoiceValue] = useState('active');
  const [feedback, setFeedback] = useState('');
  const [listCardExpanded, setListCardExpanded] = useState(false);
  const [listCardSelected, setListCardSelected] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [swipeActionLoading, setSwipeActionLoading] = useState(false);
  const [iconActionLoading, setIconActionLoading] = useState(false);
  const [errorExampleActive, setErrorExampleActive] = useState(false);

  const resetExamples = () => {
    setDate(today);
    setStatus('all');
    setTimelineFilter('all');
    setDisabledTimelineFilter('all');
    setCustomerOpportunity('customers');
    setSearch('');
    setAdvancedFilterValues({});
    setPickerValue('lin');
    setEntityValue(null);
    setPhotos([]);
    setFillModalVisible(false);
    setCenteredModalVisible(false);
    setImmersiveModalVisible(false);
    setKeyboardModalVisible(false);
    setChoiceSheetVisible(false);
    setChoiceValue('active');
    setSwipeActionLoading(false);
    setCheckboxValue(false);
    setErrorExampleActive(false);
    setFeedback('示例状态已重置');
  };

  return (
    <DetailScreenContainer
      title="组件示例"
      onBack={() => onChange('list')}
      headerActions={[
        {
          id: 'toggle-theme',
          label: isDark ? '切换浅色主题' : '切换深色主题',
          icon: 'contrast-outline',
          onPress: onToggleTheme,
        },
        { id: 'reset-examples', label: '重置示例', icon: 'refresh-outline', onPress: resetExamples },
      ]}
      footer={<ExampleTabs current={current} onChange={onChange} />}
    >
      <View style={styles.componentDemo}>
        <View style={styles.componentSection} testID="demo-shared-actions">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>Sunxu · 通用操作与摘要</AppText>
          <SectionCard
            title="共享业务卡片"
            subtitle="状态和操作结果仍由宿主页面负责"
            headerRight={
              <ActionMenu
                title="客户操作"
                actions={[
                  { id: 'edit', label: '编辑资料', icon: 'pencil-outline', onPress: () => setFeedback('已触发编辑') },
                  { id: 'archive', label: '归档客户', icon: 'archive-outline', destructive: true, onPress: () => setFeedback('已触发归档') },
                ]}
              />
            }
          >
            <View style={styles.controlButtonRow}>
              <ActionButton icon="play" onPress={() => setFeedback('开始操作已触发')}>开始拜访</ActionButton>
              <IconActionButton
                icon="map-marker-outline"
                size={ControlSize.iconButton}
                tone="primary"
                variant="tinted"
                loading={iconActionLoading}
                accessibilityLabel={iconActionLoading ? '正在加载路线示例' : '查看路线示例'}
                testID="catalog-icon-action-compact"
                onPress={() => {
                  setIconActionLoading(true);
                  setTimeout(() => setIconActionLoading(false), 900);
                  setFeedback('正在加载路线示例');
                }}
              />
              <IconActionButton
                icon="phone"
                tone="primary"
                variant="filled"
                accessibilityLabel="拨打示例客户"
                onPress={() => setFeedback('已触发拨打示例')}
              />
            </View>
            <ActionButton
              variant="text"
              icon="account-outline"
              trailingIcon="chevron-right"
              style={{ alignSelf: 'stretch' }}
              contentStyle={{ justifyContent: 'space-between', width: '100%' }}
              labelStyle={{ flex: 1, textAlign: 'left' }}
              onPress={() => setFeedback('已打开关联客户示例')}
            >
              查看关联客户
            </ActionButton>
            <ListCard
              onPress={() => setListCardExpanded((expanded) => !expanded)}
              expanded={listCardExpanded}
              accessibilityLabel="客户通话记录示例"
              accessibilityHint="点击展开或收起补充信息"
            >
              <AppText style={{ color: colors.text }}>客户通话记录</AppText>
              {listCardExpanded ? (
                <AppText style={{ color: colors.textSecondary }}>已展开通话时间、结果和跟进信息。</AppText>
              ) : null}
            </ListCard>
            <ListCard
              onPress={() => setListCardSelected((selected) => !selected)}
              selected={listCardSelected}
              accessibilityLabel="选择候选实体示例"
            >
              <AppText style={{ color: colors.text }}>候选实体选择示例</AppText>
            </ListCard>
            <SwipeableRow
              rightActions={[
                {
                  label: swipeActionLoading ? '处理中' : '编辑',
                  icon: 'create-outline',
                  color: colors.primary,
                  disabled: swipeActionLoading,
                  loading: swipeActionLoading,
                  onPress: () => {
                    setSwipeActionLoading(true);
                    setTimeout(() => setSwipeActionLoading(false), 900);
                    setFeedback('已触发编辑示例');
                  },
                },
              ]}
              onPress={() => setFeedback('已打开客户详情示例')}
              accessibilityLabel="打开客户详情示例"
              accessibilityHint="向左滑动查看更多操作"
            >
              <ListCard>
                <AppText style={{ color: colors.text }}>点击卡片查看详情</AppText>
              </ListCard>
            </SwipeableRow>
            <View style={styles.errorExample}>
              <ActionButton
                variant="outlined"
                onPress={() => setErrorExampleActive((active) => !active)}
              >
                {errorExampleActive ? '恢复错误边界示例' : '查看错误兜底'}
              </ActionButton>
              <ErrorBoundary key={String(errorExampleActive)} onError={() => undefined}>
                <CatalogErrorExample failed={errorExampleActive} />
              </ErrorBoundary>
            </View>
            <View style={styles.skeletonExample}>
              <AppText style={{ color: colors.textSecondary }}>Skeleton · 尊重系统减少动态效果</AppText>
              <Skeleton width="68%" height={14} />
              <Skeleton width="42%" height={14} />
            </View>
            <View style={styles.controlButtonRow}>
              <AppText style={{ color: colors.textSecondary }}>浮动主操作</AppText>
              <FAB
                icon="call"
                accessibilityLabel="打开拨号盘示例"
                onPress={() => setFeedback('已打开拨号盘示例')}
                style={{ position: 'relative', right: 0, bottom: 0 }}
              />
            </View>
            <Divider />
            <View style={styles.metricRow}>
              <MetricCard label="待跟进" value={6} style={styles.metric} />
              <MetricCard label="已完成" value={18} accentColor={colors.success} style={styles.metric} />
            </View>
            <ScalePressable
              accessibilityRole="button"
              accessibilityLabel="打开轻按反馈示例"
              onPress={() => setFeedback('轻按反馈已触发')}
              style={[styles.scaleExample, { backgroundColor: colors.surfaceSecondary }]}
            >
              <AppText style={{ color: colors.text }}>轻按反馈 · 尊重系统减弱动态设置</AppText>
            </ScalePressable>
            <View style={styles.controlButtonRow}>
              <ActionButton variant="outlined" onPress={() => setChoiceSheetVisible(true)}>选择状态</ActionButton>
              <ActionButton variant="secondary" onPress={() => Toast.show({ type: 'success', text1: '示例提示', text2: 'Toast 由 Sunxu host 提供' })}>显示提示</ActionButton>
            </View>
          </SectionCard>
          <SectionCard title="表单选择与设置行">
            <CheckboxField
              label="记住账号密码"
              value={checkboxValue}
              onValueChange={setCheckboxValue}
            />
            <SettingsRow
              icon="account-outline"
              label="负责人"
              value="林经理 · 138 0000 1840"
              onPress={() => setFeedback('已打开负责人选择示例')}
            />
            <SettingsRow
              icon="information-outline"
              label="当前版本"
              value="1.0.0"
            />
            <SettingsRow
              icon="shield-check-outline"
              label="通话记录权限"
              description="仅用于同步本机拨出记录"
              accessory={<Badge label="已开启" variant="success" size="sm" />}
              onPress={() => setFeedback('已打开权限状态示例')}
              accessibilityLabel="通话记录权限，已开启"
            />
          </SectionCard>
          <SectionCard>
            <AppText style={{ color: colors.textSecondary }}>
              当前任务和筛选条件已说明内容时，容器负责分组即可，不重复添加标题。
            </AppText>
          </SectionCard>
          {feedback ? <AppText testID="demo-shared-action-feedback" style={{ color: colors.textSecondary }}>{feedback}</AppText> : null}
          <ChoiceSheet
            visible={choiceSheetVisible}
            title="选择客户状态"
            value={choiceValue}
            options={[
              { key: 'active', label: '合作中', count: 18 },
              { key: 'waiting', label: '待跟进', count: 6 },
              { key: 'paused', label: '已暂停', disabled: true },
            ]}
            onClose={() => setChoiceSheetVisible(false)}
            onConfirm={setChoiceValue}
          />
        </View>

        <View style={styles.componentSection} testID="demo-profile-identity">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>Avatar · ProfileIdentity</AppText>
          <ProfileIdentity
            displayName="林晓"
            metadata={<AppText style={{ color: colors.textSecondary }}>坐席 08 · 分机 208</AppText>}
            onAvatarPress={() => setFeedback('头像更换回调已触发；照片选择和上传由宿主处理')}
            avatarAccessibilityLabel="更换林晓的头像"
            avatarAccessibilityHint="打开宿主提供的头像选择流程"
            testID="profile-identity-sample"
          />
          <Divider />
          <View style={styles.avatarStateRow}>
            <View style={styles.avatarStateItem}>
              <Avatar name="林晓" size={48} testID="avatar-fallback-sample" />
              <AppText style={{ color: colors.textSecondary }}>姓名回退</AppText>
            </View>
            <View style={styles.avatarStateItem}>
              <Avatar
                name="周宁"
                size={48}
                onPress={() => setFeedback('头像更换回调已触发')}
                accessibilityLabel="更换周宁的头像"
                testID="avatar-action-sample"
              />
              <AppText style={{ color: colors.textSecondary }}>可更换</AppText>
            </View>
            <View style={styles.avatarStateItem}>
              <Avatar
                name="陈工"
                size={48}
                onPress={() => setFeedback('上传中的头像不可重复操作')}
                isLoading
                testID="avatar-loading-sample"
              />
              <AppText style={{ color: colors.textSecondary }}>上传中</AppText>
            </View>
          </View>
        </View>

        <View style={styles.componentSection} testID="demo-inline-loading">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>InlineLoading · 主题加载态</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <InlineLoading size={12} />
            <InlineLoading size={16} />
            <InlineLoading size="large" />
          </View>
        </View>

        <View style={styles.componentSection} testID="demo-date-navigator">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>DateNavigator · 按天切换</AppText>
          <DateNavigator value={date} todayValue={today} onChange={setDate} label="跟进日期" />
        </View>

        <View style={styles.componentSection} testID="demo-search-status-tabs">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>SearchBar · StatusTabs</AppText>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="搜索客户或联系人"
            variant="surface"
            accessibilityLabel="搜索客户或联系人"
            rightAccessory={
              <Pressable
                onPress={() => setFeedback('已打开筛选')}
                accessibilityRole="button"
                accessibilityLabel="打开筛选"
                style={styles.accessoryButton}
              >
                <AppText style={[styles.accessoryText, { color: colors.primary }]}>筛选</AppText>
              </Pressable>
            }
          />
          <StatusTabs
            tabs={componentTabs}
            activeKey={status}
            onChange={setStatus}
            variant="segment"
            countBadge
            density="compact"
          />
        </View>

        <View style={styles.componentSection} testID="demo-filter-bar-fixed-footer">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>FilterBar · 高级筛选</AppText>
          <FilterBar
            quickFilters={[
              {
                key: 'period',
                label: '快捷时间',
                includeAllOption: false,
                options: [
                  { label: '今天', value: 'today' },
                  { label: '近 3 天', value: 'last3days' },
                  { label: '本周', value: 'thisWeek' },
                ],
              },
            ]}
            advancedFilters={demoAdvancedFilters}
            values={{ ...advancedFilterValues, period: quickPeriod }}
            onChange={(values) => {
              setAdvancedFilterValues(values);
              if (values.period) setQuickPeriod(values.period);
            }}
          />
        </View>

        <View style={styles.componentSection} testID="demo-status-tabs-pill">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>StatusTabs · Pill 筛选</AppText>
          <StatusTabs
            tabs={timelineFilterTabs}
            activeKey={timelineFilter}
            onChange={setTimelineFilter}
            variant="pill"
          />
        </View>

        <View style={styles.componentSection} testID="demo-status-tabs-underline">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>StatusTabs · Underline 导航</AppText>
          <StatusTabs
            tabs={customerOpportunityTabs}
            activeKey={customerOpportunity}
            onChange={setCustomerOpportunity}
            variant="underline"
          />
        </View>

        <View style={styles.componentSection} testID="demo-status-tabs-disabled">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>StatusTabs · 禁用态</AppText>
          <StatusTabs
            tabs={disabledTimelineFilterTabs}
            activeKey={disabledTimelineFilter}
            onChange={setDisabledTimelineFilter}
            variant="pill"
          />
        </View>

        <TabQueryCacheExample />

        <View style={styles.componentSection} testID="demo-picker-field">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>PickerField · 搜索选择</AppText>
          <PickerField
            label="跟进负责人"
            value={pickerValue}
            options={pickerOptions}
            onChange={setPickerValue}
            searchable
            clearable
          />
        </View>

        <View style={styles.componentSection} testID="demo-entity-filter">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>EntityFilterChip · 分类侧栏</AppText>
          <EntityFilterChip<DemoEntity>
            label="客户"
            title="选择客户或合作方"
            value={entityValue}
            onChange={setEntityValue}
            fetchFn={fetchDemoEntities}
            keyExtractor={(item) => item.id}
            labelExtractor={(item) => item.name}
            sublabelExtractor={(item) => item.detail}
            categoryFetchFn={fetchDemoCategories}
            categoryLayout="sidebar"
            searchPlaceholder="搜索名称"
          />
        </View>

        <View style={styles.componentSection} testID="demo-photo-picker">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>PhotoPicker · 多选与封面</AppText>
          <PhotoPicker
            photos={photos}
            onPhotosChange={setPhotos}
            maxCount={4}
            allowsMultipleSelection
            showCoverControls
            label="客户现场照片"
          />
          <AppText style={styles.componentHint}>
            相机和相册授权由宿主 App 提供；此 Expo Web 示例仅展示控件布局。
          </AppText>
        </View>

        <View style={styles.componentSection} testID="demo-full-screen-modal">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>FullScreenModal · 固定操作区 / 键盘避让 / immersive</AppText>
          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.demoButton, { backgroundColor: colors.primary }]}
              onPress={() => setKeyboardModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="打开键盘避让弹窗示例"
            >
              <AppText style={[styles.demoButtonText, { color: colors.textOnPrimary }]}>键盘避让表单</AppText>
            </Pressable>
            <Pressable
              style={[styles.demoButton, { backgroundColor: colors.primary }]}
              onPress={() => setFillModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="打开固定操作栏示例"
            >
              <AppText style={[styles.demoButtonText, { color: colors.textOnPrimary }]}>固定操作栏示例</AppText>
            </Pressable>
            <Pressable
              style={[styles.demoButton, { backgroundColor: colors.primary }]}
              onPress={() => setImmersiveModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="打开沉浸弹窗示例"
            >
              <AppText style={[styles.demoButtonText, { color: colors.textOnPrimary }]}>打开沉浸弹窗</AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.componentSection} testID="demo-centered-modal">
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>CenteredModal · 居中更新提示</AppText>
          <AppText style={styles.componentHint}>
            短时说明或确认内容使用居中弹窗；较长表单继续使用 FullScreenModal。
          </AppText>
          <ActionButton onPress={() => setCenteredModalVisible(true)}>
            打开居中弹窗
          </ActionButton>
        </View>

        {feedback ? <AppText testID="demo-feedback">{feedback}</AppText> : null}
      </View>

      <FullScreenModal
        visible={keyboardModalVisible}
        onClose={() => setKeyboardModalVisible(false)}
        title="键盘避让表单"
        avoidKeyboard
        confirmText="保存"
        onConfirm={() => setKeyboardModalVisible(false)}
      >
        <FormField label="客户名称" placeholder="请输入客户名称" testID="keyboard-modal-name" />
        <FormField label="联系人" placeholder="请输入联系人" testID="keyboard-modal-contact" />
        <FormField label="联系电话" placeholder="请输入联系电话" keyboardType="phone-pad" testID="keyboard-modal-phone" />
        <FormField label="备注" placeholder="请输入备注" testID="keyboard-modal-notes" />
      </FullScreenModal>

      <FullScreenModal
        visible={fillModalVisible}
        onClose={() => setFillModalVisible(false)}
        closeDisabled
        closeAccessibilityLabel="编辑客户信息时关闭弹窗"
        title="编辑客户信息"
        bodyMode="fill"
        footer={(
          <View testID="modal-fixed-footer" style={styles.modalFooterActions}>
            <ActionButton
              variant="secondary"
              style={styles.modalFooterButton}
              accessibilityLabel="取消编辑客户信息"
              onPress={() => setFillModalVisible(false)}
            >
              取消
            </ActionButton>
            <ActionButton
              style={styles.modalFooterButton}
              accessibilityLabel="保存客户信息"
              onPress={() => setFillModalVisible(false)}
            >
              保存
            </ActionButton>
          </View>
        )}
      >
        <ScrollView
          testID="modal-scroll-body"
          style={styles.fillModalScroll}
          contentContainerStyle={styles.fillModalContent}
          keyboardShouldPersistTaps="handled"
        >
          <FormField label="客户名称" value="青禾精密制造" />
          <FormField label="联系人" value="林经理" />
          <FormField label="联系电话" value="138 0000 1840" />
          <FormField label="客户编码" value="CUS-2026-0184" editable={false} />
          <FormField label="联系地址" value="苏州市工业园区" />
          <FormField label="跟进目标" value="确认下季度需求" />
          <FormField label="客户类型" value="制造业" />
          <FormField label="客户来源" value="行业推荐" />
          <FormField label="服务区域" value="苏州" />
          <FormField label="备注" value="客户信息示例" multiline numberOfLines={3} />
        </ScrollView>
      </FullScreenModal>

      <FullScreenModal
        visible={immersiveModalVisible}
        onClose={() => setImmersiveModalVisible(false)}
        title="沉浸内容"
        bodyMode="fill"
        immersive
      >
        <View style={[styles.immersiveContent, { backgroundColor: colors.background }]}>
          <AppText style={[styles.immersiveTitle, { color: colors.text }]}>沉浸内容区域</AppText>
          <Pressable
            onPress={() => setImmersiveModalVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="关闭沉浸弹窗"
            style={[styles.demoButton, { backgroundColor: colors.primary }]}
          >
            <AppText style={[styles.demoButtonText, { color: colors.textOnPrimary }]}>关闭</AppText>
          </Pressable>
        </View>
      </FullScreenModal>

      <CenteredModal
        visible={centeredModalVisible}
        onClose={() => setCenteredModalVisible(false)}
        title="发现新版本"
        subtitle="v1.0.329 → v1.0.330（42.8MB）"
        maxWidth={440}
        footer={(
          <View style={styles.modalFooterActions}>
            <ActionButton
              variant="secondary"
              style={styles.modalFooterButton}
              onPress={() => setCenteredModalVisible(false)}
            >
              稍后更新
            </ActionButton>
            <ActionButton
              style={styles.modalFooterButton}
              onPress={() => {
                setFeedback('更新操作已交由宿主 App 处理');
                setCenteredModalVisible(false);
              }}
            >
              立即更新
            </ActionButton>
          </View>
        )}
      >
        <View style={{ gap: Spacing.sm }}>
          <AppText style={{ color: colors.text, fontWeight: '600' }}>更新内容</AppText>
          <AppText style={{ color: colors.textSecondary, lineHeight: 22 }}>
            优化座席工作流程与客户管理体验，并改善部分页面的使用流畅度。
          </AppText>
        </View>
      </CenteredModal>
    </DetailScreenContainer>
  );
}

function Catalog({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  const [screen, setScreen] = useState<ScreenKey>('list');
  const [customerStatus, setCustomerStatus] = useState<CustomerStatus>('all');
  const [keyword, setKeyword] = useState('');
  const [detailActionFeedback, setDetailActionFeedback] = useState('');

  if (screen === 'form') {
    return (
      <FormPage
        title="新建客户"
        onBack={() => setScreen('list')}
        onSubmit={() => setScreen('detail')}
        footer={<ExampleTabs current={screen} onChange={setScreen} />}
      >
        <FormSection title="客户信息" testID="catalog-form-customer">
          <FormField
            testID="catalog-form-customer-name"
            label="客户名称"
            placeholder="请输入客户名称"
            required
          />
          <FormField
            testID="catalog-form-contact"
            label="联系人"
            placeholder="请输入联系人"
            error="请填写联系人"
          />
          <FormField
            testID="catalog-form-phone"
            label="联系电话"
            placeholder="请输入联系电话"
            keyboardType="phone-pad"
          />
          <FormField
            testID="catalog-form-notes"
            label="备注"
            placeholder="补充客户信息"
            multiline
            numberOfLines={3}
          />
        </FormSection>
        <FormSection title="系统填写" testID="catalog-form-readonly">
          <FormField
            testID="catalog-form-customer-code"
            label="客户编号"
            value="CUS-2026-0184"
            editable={false}
          />
        </FormSection>
      </FormPage>
    );
  }

  if (screen === 'detail') {
    return (
      <DetailScreenContainer
        title="客户详情"
        onBack={() => setScreen('list')}
        footer={
          <DetailActionBar
            maxVisibleActions={3}
            actions={[
              { id: 'call', label: '拨打客户', icon: 'call-outline', onPress: () => setDetailActionFeedback('已触发拨打客户') },
              { id: 'edit', label: '编辑资料', icon: 'create-outline', onPress: () => setDetailActionFeedback('已触发编辑资料') },
              { id: 'visit', label: '创建拜访', icon: 'calendar-outline', onPress: () => setDetailActionFeedback('已触发创建拜访') },
              { id: 'share', label: '分享客户', icon: 'share-outline', onPress: () => setDetailActionFeedback('已触发分享客户') },
              { id: 'archive', label: '归档客户', icon: 'archive-outline', tone: 'destructive', onPress: () => setDetailActionFeedback('已触发归档客户') },
            ]}
          />
        }
      >
        {detailActionFeedback ? <AppText testID="detail-action-feedback">{detailActionFeedback}</AppText> : null}
        <DetailCard title="基本信息">
          <InfoRow label="客户名称" value="青禾精密制造" />
          <InfoRow label="客户编码" value="CUS-2026-0184" />
          <InfoRow label="联系人" value="林经理" />
          <InfoRow label="联系电话" value="138 0000 1840" last />
        </DetailCard>
        <DetailCard title="合作状态">
          <View style={styles.statusLine}>
            <AppText>当前状态</AppText>
            <Badge label="合作中" variant="success" />
          </View>
          <InfoRow label="最近更新" value="2026-11-05 09:30" last />
        </DetailCard>
      </DetailScreenContainer>
    );
  }

  if (screen === 'components') {
    return (
      <ComponentExamples
        current={screen}
        onChange={setScreen}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
      />
    );
  }

  if (screen === 'visuals') {
    return <VisualExamples onBack={() => setScreen('list')} footer={<ExampleTabs current={screen} onChange={setScreen} />} />;
  }

  const visibleCustomers = customers.filter((item) => {
    const matchesStatus =
      customerStatus === 'all' ||
      (customerStatus === 'active' ? item.status === '合作中' : item.status !== '合作中');
    return matchesStatus && `${item.name} ${item.code}`.toLowerCase().includes(keyword.toLowerCase());
  });

  return (
    <ListScreenContainer
      title="客户档案"
      headerActions={[
        { id: 'create-customer', label: '新增客户', icon: 'add-outline', onPress: () => setScreen('form') },
      ]}
      toolbar={
        <View style={styles.listToolbar}>
          <SearchBar value={keyword} onChangeText={setKeyword} placeholder="搜索客户名称或编码" />
          <StatusTabs
            tabs={customerTabs}
            activeKey={customerStatus}
            onChange={setCustomerStatus}
            variant="underline"
            density="compact"
            countBadge
          />
        </View>
      }
      footer={<ExampleTabs current={screen} onChange={setScreen} />}
    >
      <ScrollView contentContainerStyle={styles.customerList} showsVerticalScrollIndicator={false}>
        {visibleCustomers.map((customer) => (
          <ListCard key={customer.code} onPress={() => setScreen('detail')}>
            <ListCard.Header>
              <ListCard.Code>{customer.code}</ListCard.Code>
              <Badge label={customer.status} variant={customer.status === '合作中' ? 'success' : 'warning'} />
            </ListCard.Header>
            <ListCard.Title>{customer.name}</ListCard.Title>
            <ListCard.Meta>
              <ListCard.MetaText>{customer.contact}</ListCard.MetaText>
              <ListCard.MetaText>近 30 天 12 笔订单</ListCard.MetaText>
            </ListCard.Meta>
          </ListCard>
        ))}
      </ScrollView>
    </ListScreenContainer>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <SunxuQueryProvider client={queryClient}>
              <SunxuProvider isDark={isDark}>
                <Catalog isDark={isDark} onToggleTheme={() => setIsDark((current) => !current)} />
                <ToastHost />
              </SunxuProvider>
            </SunxuQueryProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listToolbar: { gap: 4 },
  customerList: { padding: 12, gap: 10 },
  exampleTabs: { flexDirection: 'row', justifyContent: 'space-around' },
  exampleTab: { minWidth: 72, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  exampleTabText: { color: '#777', fontWeight: '500' },
  statusLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 },
  componentDemo: { padding: 16, gap: 20 },
  componentSection: { gap: 8 },
  componentSectionTitle: { fontSize: 14, fontWeight: '600' },
  avatarStateRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' },
  avatarStateItem: { alignItems: 'center', gap: 6 },
  componentHint: { fontSize: 12, lineHeight: 18 },
  controlButtonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricRow: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1 },
  errorExample: { gap: 8 },
  skeletonExample: { gap: 8 },
  scaleExample: { minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  accessoryButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  accessoryText: { fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  demoButton: { minHeight: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  demoButtonText: { fontWeight: '600' },
  fillModalScroll: { flex: 1 },
  fillModalContent: { padding: 16, gap: 12 },
  modalFooterActions: { flexDirection: 'row', gap: Spacing.sm },
  modalFooterButton: { flex: 1 },
  immersiveContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  immersiveTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

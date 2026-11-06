import {
  AppText,
  Badge,
  BottomActionBar,
  DateNavigator,
  DetailCard,
  DetailActionBar,
  DetailScreenContainer,
  EntityFilterChip,
  Field,
  FullScreenModal,
  FormField,
  FormPage,
  InfoRow,
  ListCard,
  ListScreenContainer,
  PickerField,
  PhotoPicker,
  SearchBar,
  StatusTabs,
  SunxuProvider,
  type EntityFilterValue,
  type EntityPickerFetchFn,
  type PickerOption,
  type TabItem,
  useTheme,
} from 'sunxu';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useState } from 'react';
import dayjs from 'dayjs';
import { VisualExamples } from './VisualExamples';

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

const componentTabs: TabItem<ComponentStatus>[] = [
  { key: 'all', label: '全部', count: 24 },
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
          <AppText style={[styles.exampleTabText, current === tab.key && styles.exampleTabTextActive]}>
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
  const [pickerValue, setPickerValue] = useState('lin');
  const [entityValue, setEntityValue] = useState<EntityFilterValue | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [fillModalVisible, setFillModalVisible] = useState(false);
  const [immersiveModalVisible, setImmersiveModalVisible] = useState(false);
  const [feedback, setFeedback] = useState('');

  const resetExamples = () => {
    setDate(today);
    setStatus('all');
    setTimelineFilter('all');
    setDisabledTimelineFilter('all');
    setCustomerOpportunity('customers');
    setSearch('');
    setPickerValue('lin');
    setEntityValue(null);
    setPhotos([]);
    setFillModalVisible(false);
    setImmersiveModalVisible(false);
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
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>FullScreenModal · fill / immersive</AppText>
          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.demoButton, { backgroundColor: colors.primary }]}
              onPress={() => setFillModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="打开填充弹窗示例"
            >
              <AppText style={[styles.demoButtonText, { color: colors.textOnPrimary }]}>打开填充弹窗</AppText>
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

        {feedback ? <AppText testID="demo-feedback">{feedback}</AppText> : null}
      </View>

      <FullScreenModal
        visible={fillModalVisible}
        onClose={() => setFillModalVisible(false)}
        title="填充内容区"
        bodyMode="fill"
        headerRight={
          <Pressable
            onPress={() => setFillModalVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="完成并关闭填充弹窗"
          >
              <AppText style={[styles.accessoryText, { color: colors.primary }]}>完成</AppText>
          </Pressable>
        }
      >
        <View style={styles.fillModalContent}>
          <AppText style={[styles.componentSectionTitle, { color: colors.text }]}>子内容占满弹窗剩余空间</AppText>
          <AppText style={[styles.componentHint, { color: colors.textSecondary }]}>宿主可以在这里放置地图、媒体或自管滚动区域。</AppText>
        </View>
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
        <FormField label="客户名称" placeholder="请输入客户名称" required />
        <FormField label="联系人" placeholder="请输入联系人" />
        <FormField label="联系电话" placeholder="请输入联系电话" keyboardType="phone-pad" />
        <Field label="备注">
          <TextInput
            style={styles.notes}
            placeholder="补充客户信息"
            accessibilityLabel="备注"
            multiline
          />
        </Field>
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
          <SunxuProvider isDark={isDark}>
            <Catalog isDark={isDark} onToggleTheme={() => setIsDark((current) => !current)} />
            </SunxuProvider>
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
  exampleTabTextActive: { color: '#1677FF', fontWeight: '700' },
  notes: {
    minHeight: 88,
    padding: 12,
    textAlignVertical: 'top',
    borderRadius: 10,
    color: '#1A1A1A',
    backgroundColor: '#F5F6F8',
  },
  statusLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 },
  componentDemo: { padding: 16, gap: 20 },
  componentSection: { gap: 8 },
  componentSectionTitle: { fontSize: 14, fontWeight: '600' },
  componentHint: { fontSize: 12, lineHeight: 18 },
  accessoryButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  accessoryText: { fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  demoButton: { minHeight: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  demoButtonText: { fontWeight: '600' },
  fillModalContent: { flex: 1, padding: 16, gap: 8 },
  immersiveContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  immersiveTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

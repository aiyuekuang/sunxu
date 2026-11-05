import {
  AppText,
  Badge,
  BottomActionBar,
  DetailCard,
  DetailScreenContainer,
  Field,
  FormField,
  FormPage,
  InfoRow,
  ListCard,
  ListScreenContainer,
  SearchBar,
  StatusTabs,
  SunxuProvider,
  type TabItem,
} from 'sunxu';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useState } from 'react';

type ScreenKey = 'list' | 'form' | 'detail';
type CustomerStatus = 'all' | 'active' | 'paused';

const screenTabs: { key: ScreenKey; label: string }[] = [
  { key: 'list', label: '列表' },
  { key: 'form', label: '表单' },
  { key: 'detail', label: '详情' },
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

function Catalog() {
  const [screen, setScreen] = useState<ScreenKey>('list');
  const [customerStatus, setCustomerStatus] = useState<CustomerStatus>('all');
  const [keyword, setKeyword] = useState('');

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
        footer={<ExampleTabs current={screen} onChange={setScreen} />}
      >
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

  const visibleCustomers = customers.filter((item) => {
    const matchesStatus =
      customerStatus === 'all' ||
      (customerStatus === 'active' ? item.status === '合作中' : item.status !== '合作中');
    return matchesStatus && `${item.name} ${item.code}`.toLowerCase().includes(keyword.toLowerCase());
  });

  return (
    <ListScreenContainer
      title="客户档案"
      headerRight={
        <Pressable
          style={styles.addButton}
          onPress={() => setScreen('form')}
          accessibilityRole="button"
          accessibilityLabel="新增客户"
        >
          <AppText style={styles.addText}>新增</AppText>
        </Pressable>
      }
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
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <KeyboardProvider>
          <SunxuProvider>
            <Catalog />
          </SunxuProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listToolbar: { gap: 4 },
  customerList: { padding: 12, gap: 10 },
  addText: { color: '#1677FF', fontWeight: '600' },
  addButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
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
});

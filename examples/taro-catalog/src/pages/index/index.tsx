import { useState } from 'react';
import { ScrollView, Text, View } from '@tarojs/components';
import {
  AttachmentField, Badge, BottomTabBar, Button, DateTimePicker,
  FilterActionButton, FilterBar, Hint, Icon, IconTile, Input,
  PageContentContainer, SearchInput, SegmentedControl, Select, Sheet, Switch,
  Tabs, Textarea, type AttachmentItem,
} from 'sunxu-taro';

const OPTIONS = [{ value: 'active', label: '进行中' }, { value: 'done', label: '已完成' }];
const INITIAL_FILES: AttachmentItem[] = [{ id: 'sample', name: '示例文档.pdf', kind: 'document', status: 'error', statusText: '上传失败' }];
const GRID_ITEMS = ['文档', '搜索', '完成', '信息', '记录', '更多'];
const LONG_ITEMS = Array.from({ length: 18 }, (_, index) => `候选 ${index + 1}：可滚动的长名称示例`);

export default function CatalogPage() {
  const [keyword, setKeyword] = useState('');
  const [active, setActive] = useState('active');
  const [choice, setChoice] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [date, setDate] = useState('2026-11-17');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState(INITIAL_FILES);
  const [feedback, setFeedback] = useState('');
  const [sheet, setSheet] = useState<'grid' | 'list' | 'footer' | null>(null);
  return <PageContentContainer className="catalog">
    <View className="catalog__section">
      <SearchInput ariaLabel="搜索组件" value={keyword} placeholder="搜索组件" onInput={(event) => setKeyword(event.detail.value)} clearable onClear={() => setKeyword('')} />
      <FilterBar><Select range={['全部', '已选择', '很长的候选选项名称用于检查窄屏截断']} value={choice} onChange={(event) => setChoice(Number(event.detail.value))} variant="filter" title="筛选状态" /><FilterActionButton label="筛选" ariaLabel="打开筛选" onClick={() => setFeedback('筛选动作由宿主处理')} /></FilterBar>
    </View>
    <Tabs className="catalog__tabs" options={OPTIONS} value={active} onChange={setActive} />
    <View className="catalog__section">
      <SegmentedControl options={OPTIONS} value={active} onChange={setActive} density="regular" ariaLabel="状态" />
      <View className="catalog__row"><IconTile><Text aria-hidden="true">S</Text></IconTile><Badge tone="success">已启用</Badge><Badge tone="danger" size="sm">失败</Badge><Switch ariaLabel="启用示例" checked={enabled} onChange={setEnabled} /></View>
      <Input ariaLabel="示例名称" value={keyword} placeholder="示例名称" onInput={(event) => setKeyword(event.detail.value)} />
      <Textarea ariaLabel="示例说明" value={note} placeholder="示例说明" onInput={(event) => setNote(event.detail.value)} />
      <DateTimePicker mode="date" ariaLabel="示例日期" value={date} displayValue={date} onChange={(event) => setDate(event.detail.value)} />
      <Hint label="组件状态" hint="选择、输入和文件动作均由当前宿主控制，不请求业务接口。" />
    </View>
    <View className="catalog__section"><AttachmentField items={files} label="附件" onOpen={(item) => setFeedback(item.name)} onRetry={(item) => setFiles((current) => current.map((file) => file.id === item.id ? { ...file, status: 'ready', statusText: '' } : file))} onRemove={(item) => setFiles((current) => current.filter((file) => file.id !== item.id))} /></View>
    <View className="catalog__actions"><Button className="catalog__action" uiSize="regular" onClick={() => setFeedback('动作完成')}>确认</Button><Button uiSize="regular" appearance="plain" onClick={() => { setKeyword(''); setNote(''); setFiles(INITIAL_FILES); setFeedback(''); }}>重置</Button></View>
    <View className="catalog__section">
      <Button uiSize="regular" onClick={() => setSheet('grid')}>自然高度图标网格</Button>
      <Button uiSize="regular" onClick={() => setSheet('list')}>容器滚动列表</Button>
      <Button uiSize="regular" onClick={() => setSheet('footer')}>标题插槽与固定底栏</Button>
    </View>
    {feedback ? <View role="status"><Text>{feedback}</Text></View> : null}
    <BottomTabBar tabs={OPTIONS.map((item) => ({ key: item.value, label: item.label }))} activeKey={active} onChange={setActive} />
    <Sheet open={sheet === 'grid'} title="选择" onClose={() => setSheet(null)} closePlacement="start" titleAlign="center" className="catalog__sheet-grid">
      <View className="catalog__icon-grid">
        {GRID_ITEMS.map((label, index) => <Button className="catalog__grid-option" key={label} uiSize="row" appearance="plain" onClick={() => { setFeedback(label); setSheet(null); }}>
          <IconTile><Icon name={index === 1 ? 'search' : index === 2 ? 'checkmark' : 'info'} /></IconTile><Text>{label}</Text>
        </Button>)}
      </View>
    </Sheet>
    <Sheet open={sheet === 'list'} title="选择候选" onClose={() => setSheet(null)} bodyMode="scroll" className="catalog__sheet-list">
      {LONG_ITEMS.map((label) => <Button className="catalog__sheet-option" key={label} uiSize="row" appearance="plain" onClick={() => { setFeedback(label); setSheet(null); }}>{label}</Button>)}
    </Sheet>
    <Sheet open={sheet === 'footer'} title="筛选候选" onClose={() => setSheet(null)} closePlacement="start" titleAlign="center" bodyMode="fill" className="catalog__sheet-footer" header={<Tabs options={OPTIONS} value={active} onChange={setActive} />} footer={<View className="catalog__sheet-actions"><Button uiSize="regular" appearance="plain" onClick={() => setChoice(0)}>重置</Button><Button className="catalog__action" uiSize="regular" onClick={() => { setFeedback(`已应用${active === 'active' ? '进行中' : '已完成'}条件`); setSheet(null); }}>应用</Button></View>}>
      <ScrollView className="catalog__sheet-child-scroll" scrollY enableFlex>
        {LONG_ITEMS.map((label, index) => <Button className="catalog__sheet-option" key={label} uiSize="row" appearance="plain" aria-pressed={choice === index} onClick={() => setChoice(index)}>{label}{choice === index ? ' ✓' : ''}</Button>)}
      </ScrollView>
    </Sheet>
  </PageContentContainer>;
}

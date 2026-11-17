import { useState } from 'react';
import { Text, View } from '@tarojs/components';
import {
  AttachmentField, Badge, BottomTabBar, Button, DateTimePicker,
  FilterActionButton, FilterBar, Hint, IconTile, Input,
  PageContentContainer, SearchInput, SegmentedControl, Select, Switch,
  Tabs, Textarea, type AttachmentItem,
} from 'sunxu-taro';

const OPTIONS = [{ value: 'active', label: '进行中' }, { value: 'done', label: '已完成' }];
const INITIAL_FILES: AttachmentItem[] = [{ id: 'sample', name: '示例文档.pdf', kind: 'document', status: 'error', statusText: '上传失败' }];

export default function CatalogPage() {
  const [keyword, setKeyword] = useState('');
  const [active, setActive] = useState('active');
  const [choice, setChoice] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [date, setDate] = useState('2026-11-17');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState(INITIAL_FILES);
  const [feedback, setFeedback] = useState('');
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
    {feedback ? <View role="status"><Text>{feedback}</Text></View> : null}
    <BottomTabBar tabs={OPTIONS.map((item) => ({ key: item.value, label: item.label }))} activeKey={active} onChange={setActive} />
  </PageContentContainer>;
}

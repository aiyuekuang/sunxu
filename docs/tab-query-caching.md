# Tab 查询缓存规范

`StatusTabs` 是受控展示组件，只接收 `tabs`、`activeKey` 和 `onChange`。它不读取网络数据、不判断业务状态，也不管理缓存。需要列表缓存的宿主可单独使用 `sunxu/query`；不使用这一路径的应用不会引入 TanStack Query 依赖。

## 接入边界

- 宿主创建并持有唯一的 `QueryClient`，配置 `staleTime`、`gcTime`、重试和持久化策略。Sunxu 不提供全局默认缓存时长。
- 用 `SunxuQueryProvider` 包住查询页面；它提供 TanStack Query Context，并把 React Native 前后台状态同步给 `focusManager`。Web 继续使用 TanStack Query 自带的焦点机制。
- 宿主实现 `queryFn`、API 参数、权限检查、统计口径和加载/空/错误展示。Sunxu 只生成安全的查询键并封装无限查询。
- `@tanstack/react-query` 是 `sunxu/query` 的可选 peer dependency。普通 UI 消费方不必安装它。

## 查询键必须包含的维度

`createTabQueryFamily` 要求稳定的 `principalId`，并可带 `tenantId`。每个列表键还包含 `resourceKey`、Tab key 和完整的规范化筛选条件。这样用户、公司、页签、日期、搜索和筛选不同的结果不会误命中同一份数据。

查询键中的筛选值必须是可序列化的纯数据，并与请求实际使用的筛选值一致。不要放 access token、函数、SDK 对象或其他秘密。用户退出/切换账号时，宿主必须清空 QueryClient；公司切换时，租户维度隔离结果，宿主也可清理旧租户的缓存。

## 示例

```tsx
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  SunxuQueryProvider,
  createTabQueryFamily,
  invalidateTabQueryFamily,
  useTabInfiniteQuery,
} from 'sunxu/query';

const appQueryClient = new QueryClient(); // 应由宿主应用在模块级创建

function Calls({ userId, companyId, status, filters }) {
  const queryClient = useQueryClient();
  const callsFamily = useMemo(
    () => createTabQueryFamily({
      resourceKey: 'call-records',
      scope: { principalId: userId, tenantId: companyId },
    }),
    [userId, companyId],
  );
  const calls = useTabInfiniteQuery({
    queryFamily: callsFamily,
    tabKey: status,
    filters,
    initialPageParam: 1,
    queryFn: ({ queryKey, pageParam }) =>
      callsApi.list({ status: queryKey[5], ...queryKey[6], page: pageParam }),
    getNextPageParam: (lastPage, pages) =>
      pages.length < lastPage.pageCount ? pages.length + 1 : undefined,
  });

  const handleMutationSuccess = () =>
    invalidateTabQueryFamily(queryClient, callsFamily, {
      discardInactive: true,
    });

  // 用 StatusTabs 控制 status；页面自行展示 calls.isPending、calls.error 和缓存数据。
  // 创建/删除/状态变化成功后调用 handleMutationSuccess。
  return null;
}

function App() {
  return <SunxuQueryProvider client={appQueryClient}><Calls /></SunxuQueryProvider>;
}
```

## 失效时机与展示规则

| 事件 | 建议处理 |
|---|---|
| 切换 Tab 或普通筛选 | 直接观察对应查询键；可复用该键的缓存。不要用上一键的 `placeholderData` 冒充当前结果。 |
| 单条数据更新且不会影响列表归属 | 精确更新对应缓存，或按宿主需要失效当前键。 |
| 新建/删除、通话状态变化、分配变化等会改变 Tab 成员关系 | 调用 `invalidateTabQueryFamily(..., { discardInactive: true })`：移除其他 Tab/筛选的旧快照，再刷新当前活动查询。 |
| 拉取失败但已有缓存 | 保留旧列表，并明确提示“更新失败，当前显示缓存数据”，提供重试入口；不能静默把旧数据伪装成最新数据。 |
| 退出或切换登录用户 | 宿主调用 `queryClient.clear()`，防止下一个用户看到前一账号缓存。 |
| 切换租户/公司 | 查询键带新租户 ID；如需释放旧租户数据，调用 `removeTabQueryFamily` 清理旧 scope。 |

`invalidateTabQueryFamily` 默认只重新请求活动查询；非活动键会标记为过期，之后再次打开时刷新。`discardInactive: true` 适用于业务变化可能造成记录跨 Tab 移动的场景，它先删除非活动快照，再让当前活动查询重新请求。调用方要在业务操作成功后执行失效，不能在提交前或仅在本地点击 Tab 时执行。

Catalog 中的“Tab 查询缓存 · 按页签隔离”示例可交互切换页签、观察精确键缓存，并模拟跨 Tab 数据更新。宿主项目还需按自己的页面与数据状态验证真实 API、权限和错误恢复行为。

# 榫序 Sunxu

Sunxu 是面向 React Native / Expo 项目的通用 UI 组件和页面容器库。它提供主题 token、表单/筛选/选择控件，以及列表、表单和详情页常用骨架；数据请求、路由、授权和业务规则由宿主 App 管理。

## 页面容器

```tsx
import {
  AppText,
  ListCard,
  ListScreenContainer,
  SearchBar,
  SunxuProvider,
} from 'sunxu';

export function ExampleApp() {
  return (
    <SunxuProvider>
      <ListScreenContainer title="客户" toolbar={<SearchBar value="" onChangeText={() => {}} />}>
        <ListCard>
          <ListCard.Title>新项目可直接复用的卡片</ListCard.Title>
          <AppText>请求、权限和路由由宿主项目提供。</AppText>
        </ListCard>
      </ListScreenContainer>
    </SunxuProvider>
  );
}
```

`ListScreenContainer` 将搜索/筛选工具栏放在其控制的结果区紧邻位置；`FormPage` 自动处理键盘滚动，返回行为通过 `onBack` 传入；`DetailScreenContainer` 提供可滚动内容和固定页头/底部操作区；`ScreenContainer` 用于按插槽组合其他页面骨架。

页面操作应直达用户选择的目标；一次点击不能先切 Tab 或进入中间页，再自动打开目标表单/弹层。多步骤任务应显示为由用户逐步操作的明确流程，详见[页面操作与导航直达规范](https://github.com/aiyuekuang/sunxu/blob/main/docs/component-migration.md#页面操作与导航直达)。

`PageHeader` 和 `HeaderIconButton` 提供标准页头及右侧动作。需要按数量收纳时，在 `ListScreenContainer`、`DetailScreenContainer` 或 `FormScreenContainer` 使用 `headerActions`：单个动作以图标直显，多个动作收进右侧“更多操作”下拉菜单；旧的 `headerRight` 自定义插槽继续可用。

弹窗表单使用 `FullScreenModal` 或 `BottomSheet` 的 `confirmText` 内置底栏，或 `footer` 插槽放置确定、应用、保存等操作；操作区固定在弹窗底部并处理安全区，表单内容单独滚动。自定义操作区占满可用宽度，并列按钮自适应等分。确认类流程操作不放在标题栏或滚动内容中。旧 `renderFooter` 仍兼容并已弃用。

页面容器默认把顶部安全区与页头绘制为同一主题表面，正文仍使用页面背景；业务页面直接使用 `ListScreenContainer`、`DetailScreenContainer` 或 `FormScreenContainer` 即可衔接状态栏区域和页头。自定义页头背景时，通过 `headerBackgroundColor` 同步安全区底色；父级导航已处理顶部安全区时，将 `safeAreaEdges` 配置为不含 `top`，避免重复留白。底部操作区可搭配 `BottomActionBar`，由操作栏本身处理底部安全区。

`DateNavigator` 可按日、周、月或年切换；未设置 `period` 时仍按天切换。传入 `maximumDate` 可限制日期选择，并在到达最后一个可用周期时禁用向后切换。日期锚点和数据请求仍由宿主管理。

## 身份与头像

`Avatar` 展示头像图片或姓名首字母，并提供可选的点按、上传中和无障碍状态。`ProfileIdentity` 将头像、姓名和宿主提供的身份摘要组合成紧凑横向布局。图片选择、裁剪、上传、用户字段权限、导航和保存接口由宿主 App 负责；这两个组件不读取账号数据或系统照片权限。

```tsx
import { AppText, ProfileIdentity } from 'sunxu/core';

<ProfileIdentity
  displayName={user.realName || user.username}
  avatarUri={user.avatarUrl}
  metadata={<AppText>{`坐席 ${user.seatNumber} · 分机 ${user.extension}`}</AppText>}
  onAvatarPress={openHostAvatarPicker}
  avatarLoading={uploadingAvatar}
/>
```

## 地图与图表

`MapScreenContainer` 提供全屏底图和安全区叠层插槽；`sunxu/maps` 提供当前定位坐标、定位按钮、常用地图控件、地点标记和当前位置标记。Sunxu 不内置地图厂商 SDK，宿主将 SDK 的地图视图、Marker 与相机控制接到插槽和回调中。

`ChartPanel` 与 `ChartLegend` 提供统一图表容器和加载/空/错误态。`sunxu/charts` 在 [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) 上提供主题化柱、线、饼和雷达图。需要地图定位时安装 `expo-location`；需要图表渲染时安装 `react-native-gifted-charts`、`react-native-svg` 和 `expo-linear-gradient`（Gifted Charts 导入时要求提供渐变实现）。

```tsx
import { ChartPanel, MapScreenContainer } from 'sunxu';
import { MapLocationButton, MapMarker } from 'sunxu/maps';
import { SunxuBarChart } from 'sunxu/charts';

<MapScreenContainer topTrailing={
  <MapLocationButton onLocation={(point) => mapCamera.animateTo(point)} />
}>
  <VendorMapView>
    <VendorMarker coordinate={coordinate}><MapMarker label="客户位置" /></VendorMarker>
  </VendorMapView>
</MapScreenContainer>

<ChartPanel title="月度跟进">
  <SunxuBarChart data={monthlyValues} width={320} height={200} />
</ChartPanel>
```

地图坐标统一使用 `{ latitude, longitude }`。宿主负责转换到所选地图 SDK 的坐标系，并处理相机动画、底图密钥、路线和地理编码等 provider/业务能力。

## Tab 列表缓存（可选）

`StatusTabs` 只负责展示和选择，不拥有请求或缓存。需要按 Tab 缓存无限列表时，可选安装 `@tanstack/react-query` 并从 `sunxu/query` 引入 `SunxuQueryProvider`、`createTabQueryFamily`、`useTabInfiniteQuery` 和失效工具。TanStack Query 是可选 peer dependency；只使用 `sunxu/core` 的应用不需要安装它。

缓存键按资源、登录用户、租户、Tab 和筛选条件隔离；Hook 不提供 `placeholderData`，切换 Tab 时不会把上一 Tab 的数据当作当前结果。宿主仍负责创建 `QueryClient`、API 请求、权限、数据新鲜度、业务事件失效以及退出登录时清缓存。详细约定与示例见[Tab 查询缓存规范](./docs/tab-query-caching.md)。

## 基线组件筛选

MES 固定基线原始盘点共 393 项：筛选后保留 49 个跨项目共享组件/工具，排除 MES 领域模块、宿主集成、页面私有组件和带数据请求/导航耦合的树列表。Sunxu 新增标准页面容器。每个基线文件的来源提交、状态、目标路径或排除原因见[逐文件迁移账本](https://github.com/aiyuekuang/sunxu/blob/main/docs/migrations/mes-components.md)。

Expo Web 示例已在 375×812 竖屏、812×375 横屏和浅/深主题下渲染；截图、控制台结果和几何/溢出数据见[容器预览记录](https://github.com/aiyuekuang/sunxu/blob/main/docs/verification/component-containers.md)。原生 iOS/Android 的安全区、键盘和无障碍渲染仍为 **UNVERIFIED**。 地图、定位控件和图表另有[地图图表验收记录](https://github.com/aiyuekuang/sunxu/blob/main/docs/verification/maps-charts.md)。

## 包与授权

[`sunxu@0.1.3`](https://www.npmjs.com/package/sunxu) 起采用 MIT 许可证，允许使用者使用、复制、修改、分发、再许可和销售软件副本，并须随副本保留版权与许可声明。`0.1.0`–`0.1.2` 保留各自发布时的 `UNLICENSED` 元数据。发布包仅包含 `src/`、本 README 和根目录 `LICENSE`；peer dependencies 由使用方安装，不捆绑进包。

## 开发入口

- 项目目标与收录边界：[AGENTS.md](https://github.com/aiyuekuang/sunxu/blob/main/AGENTS.md)
- 组件筛选、容器规范与验证记录：[组件迁移规范](https://github.com/aiyuekuang/sunxu/blob/main/docs/component-migration.md)
- 393 项基线明细：[MES 组件迁移清单](https://github.com/aiyuekuang/sunxu/blob/main/docs/migrations/mes-components.md)
- 可运行 Expo 示例：[catalog 示例 App](https://github.com/aiyuekuang/sunxu/tree/main/examples/catalog)

`ListScreenContainer` 可在父级已提供页面标题时省略 `title`；`SwipeableRow` 操作支持禁用与忙碌状态；`ErrorBoundary` 支持宿主 fallback；`Skeleton` 遵循系统减少动态效果偏好。API 详情和迁移示例见[组件迁移规范](https://github.com/aiyuekuang/sunxu/blob/main/docs/component-migration.md)。

通用间距、字号、字重、圆角、控件尺寸、描边、阴影和动效时长统一从 `sunxu/core` 的 `Spacing`、`FontSize`、`FontWeight`、`Radius`、`ControlSize`、`BorderWidth`、`Shadow`、`MotionDuration` 读取；宿主不再维护同义基础 token。

`PersistentBottomSheet` 用于拨号盘等常驻、非模态、可多段吸附的工具面板；短时确认/选择继续使用带标题和固定操作栏的 `BottomSheet`。

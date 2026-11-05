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

所有容器默认使用 Sunxu 语义主题和顶部安全区。底部操作区可搭配 `BottomActionBar`，由操作栏本身处理底部安全区。

## 基线组件筛选

MES 固定基线原始盘点共 393 项：筛选后保留 49 个跨项目共享组件/工具，排除 MES 领域模块、宿主集成、页面私有组件和带数据请求/导航耦合的树列表。Sunxu 新增标准页面容器。每个基线文件的来源提交、状态、目标路径或排除原因见[逐文件迁移账本](https://github.com/aiyuekuang/sunxu/blob/main/docs/migrations/mes-components.md)。

Expo Web 示例已在 375×812 竖屏、812×375 横屏和浅/深主题下渲染；截图、控制台结果和几何/溢出数据见[容器预览记录](https://github.com/aiyuekuang/sunxu/blob/main/docs/verification/component-containers.md)。原生 iOS/Android 的安全区、键盘和无障碍渲染仍为 **UNVERIFIED**。

## 包与授权

发布包将仅包含 `src/`、本 README 和许可证文件，不打包迁移账本、项目指令或示例 App。发布前需选定许可证；当前许可证仍为 `UNLICENSED`，因此尚未执行 npm 发布。

## 开发入口

- 项目目标与收录边界：[AGENTS.md](https://github.com/aiyuekuang/sunxu/blob/main/AGENTS.md)
- 组件筛选、容器规范与验证记录：[组件迁移规范](https://github.com/aiyuekuang/sunxu/blob/main/docs/component-migration.md)
- 393 项基线明细：[MES 组件迁移清单](https://github.com/aiyuekuang/sunxu/blob/main/docs/migrations/mes-components.md)
- 可运行 Expo 示例：[catalog 示例 App](https://github.com/aiyuekuang/sunxu/tree/main/examples/catalog)

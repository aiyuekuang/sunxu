# 页面容器预览记录

- 日期：2026-11-05
- 示例：[`examples/catalog`](../../examples/catalog)
渲染方式：Expo Web / React Native Web，Chromium。不是 iOS/Android 原生渲染。

## 结果

- 375×812 竖屏：列表、表单、详情三种容器均显示完整页头与底部区域；搜索/筛选工具栏紧贴列表结果区。
- 812×375 横屏：列表内容仍处于可滚动结果区，底部切换操作固定在内容区之后。
- Light/Dark：主题 token 均有渲染截图；状态色和文字层级可辨认。
- 浏览器控制台错误：0；HTTP 错误：0。
- 所有预览状态的根容器几何与视口一致；检测到的横向溢出节点：0。
- 375×812 列表：页头新增按钮 44×44px；紧凑状态 tab 可视高度 37px，组件 hitSlop 为上下左右各 8px；底部 tab 72×44px；列表卡片 351×89px。
- 375×812 表单：返回和保存按钮均至少 44px 高；底部 tab 72×44px；表单输入控件高度为 44px。

| 状态 | 截图 |
|---|---|
| 列表，竖屏，浅色 | [list-portrait-light.png](./list-portrait-light.png) |
| 表单，竖屏，浅色 | [form-portrait-light.png](./form-portrait-light.png) |
| 详情，竖屏，浅色 | [detail-portrait-light.png](./detail-portrait-light.png) |
| 列表，横屏，浅色 | [list-landscape-light.png](./list-landscape-light.png) |
| 列表，竖屏，深色 | [list-portrait-dark.png](./list-portrait-dark.png) |

## 未覆盖

示例验证的是页面容器及截图中展示的控件组合，不代表全部 49 个保留源组件均完成视觉回归。iOS/Android 原生安全区、系统键盘、Dynamic Type、TalkBack/VoiceOver 和 reduced-motion 状态仍为 **UNVERIFIED**。

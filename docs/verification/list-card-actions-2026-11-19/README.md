# ListCard 操作区渲染验收

**状态：PASS（Expo Web）；原生 iOS / Android：UNVERIFIED。**

## 组件约定

- 高频记录操作放在 `ListCard.Actions`；标准按钮使用 `ListCard.Action`，最多显示 3 个。
- 操作按钮等分一行，按钮间自动插入主题竖分隔线；Native 触控高度按 iOS 44pt / Android 48dp，Expo Web 可见高度为 44px，窄屏仍保留单行。
- 低频操作和第 4 项起的溢出操作由宿主传入 `SwipeableRow.rightActions`。`ListCard.Actions` 在开发态发现超过 3 项时发出警告，不静默丢弃业务动作。
- 卡片带有操作区时，`ListCard.onPress` 只作用于记录信息区，操作行与详情点击互为独立触控目标；`SwipeableRow` 此时只负责左滑动作。

## 页面、视口与几何

运行目标是 `examples/catalog` Expo Web，本地源码页面 `/` → “组件页面示例” → “常用操作与左滑溢出示例”。Playwright Chromium 的 `innerWidth`、文档宽度与视口一致，没有页面横向溢出。

| 视口 | 三个按钮宽 × 高 | 操作区 | 页面溢出 |
|---|---:|---|---|
| 375×812 | 91×44 px，各 3 项 | x=50–325 px，宽 275 px | `scrollWidth=375` |
| 320×720 | 72.7×44 px，各 3 项 | 三项保持单行 | `scrollWidth=320` |
| 430×932 | 109.3×44 px，各 3 项 | 三项等宽 | `scrollWidth=430` |
| 812×375 横屏 | 236.7×44 px，各 3 项 | 三项等宽 | `scrollWidth=812` |

375×812 下两条分隔线各为 1×28 px，位于 y=467 px，按钮行高度 44 px。按钮均暴露为独立 `button`，无嵌套按钮或控制台错误。

## 交互核对

- 点击“录入”调用对应操作回调；详情反馈仍为 0，未误触发卡片详情。
- 点击卡片信息区触发详情回调。
- 在记录行向左滑动后，“归档”出现在右侧操作区并可访问。
- 375×812 页面运行错误 0 条；320×720、430×932 和 812×375 横屏也均为 0 条。

## 截图

- [375×812 常用操作栏](./375-light.png)
- [375×812 左滑展开溢出操作](./375-swipe-open.png)
- [320×720 窄屏](./320-light.png)
- [430×932](./430-light.png)
- [812×375 横屏](./812-landscape-light.png)
- [原始 DOM 几何与错误记录](./layout-evidence.json)

## 验证边界

Catalog TypeScript 检查通过，`git diff --check` 通过；本次 `ListCard` 没有对应类型错误。没有新增或运行单元测试。Expo Web 的几何和点击/滑动已核对，原生设备渲染、系统读屏及大字体模式仍为 `UNVERIFIED`。

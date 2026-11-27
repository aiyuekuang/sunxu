# FilterBar 前置筛选验收

**Catalog Web：PASS。MES App 业务路由和原生环境：UNVERIFIED。**

## 运行环境

- 路由：Sunxu Expo Web Catalog → 组件 → `FilterBar · 高级筛选`
- 浏览器：Chromium，通过 Playwright 可见窗口操作
- 视口：375×812 与 320×720 CSS px
- 数据：Catalog 的 `SelectableChip` “仅我的”与快捷筛选“今天”
- 示例消费本地 Sunxu 源码；MES App 受保护页面需要登录，Catalog 结果不替代其页面验收

## 结果

- 高优先级筛选出现在快捷筛选之前；两个入口在初始滚动位置都完整可见。
- 有自定义筛选的行高为 44px，前置控件 44×44px 的触控框完整位于行内；快捷筛选控件垂直居中。
- 点击“仅我的”后，`aria-pressed` 从 `false` 变为 `true`。
- 两个视口下 `documentElement.scrollWidth` 与 `body.scrollWidth` 均等于视口宽度；浏览器未报告页面错误。

## 截图与测量

- [375×812](./375x812.png)
- [320×720](./320x720.png)
- [DOM 几何与状态](./geometry.json)

Android/iOS 原生平台的触控热区、系统读屏和 MES App 真实业务路由尚未在本次运行环境中复核，保持 `UNVERIFIED`。

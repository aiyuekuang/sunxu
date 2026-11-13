# Sunxu 组件适配渲染核验

## 范围

检查 Sunxu Expo Web Catalog 的“组件示例 → 表单选择与设置行”区域，覆盖装饰图标、`InlineHint`、带文案的 `LoadingView`、启用与禁用的 `SwitchControl`。本记录只证明共享组件示例的渲染和交互，不替代 Digi CRM 小程序真实路由验收。

## 页面证据

| 视口（CSS px） | `document.clientWidth` | `document.scrollWidth` | 横向溢出 | 行内提示容器 | 加载容器 |
| --- | ---: | ---: | --- | --- | --- |
| 375×812 | 375 | 375 | 无 | 301×44 | 301×112 |
| 320×720 | 320 | 320 | 无 | 246×44 | 246×112 |

- 展开 `InlineHint` 后，说明文本可见且按钮名称切换为“收起填写说明”；关闭后文字移除，按钮名称恢复为“查看填写说明”。
- `LoadingView` 公开 `progressbar` 角色和加载文案；指示器与文案在两档视口均可见。
- `SwitchControl` 在 Catalog 中可由关闭切换为开启；禁用态保留关闭状态且不可交互。真实移动平台触控热区仍待设备核验。
- `InlineHint` 图标的布局框为 28×28 CSS px，代码扩展 10dp `hitSlop`；DOM 几何不包含平台实际命中边界。

## 截图

- [375×812](./components-375.png)
- [320×720](./components-320.png)
- [DOM 几何 JSON](./geometry.json)

## 未覆盖

真实 iOS/Android、微信小程序、Taro 页面、原生系统读屏、字体缩放及真实设备触控边界均标记为 `UNVERIFIED`。

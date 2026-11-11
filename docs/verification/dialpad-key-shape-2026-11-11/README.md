# DialPad 按键几何复核 · 2026-11-11

## 范围

- 路由：Sunxu `examples/catalog` → “地图图表”页签 → `demo-dial-pad`。
- 渲染：Expo Web / Chromium，亮色主题，设备像素比 1。
- 组件：共享 `DialPad`。Tel App 的拨号面板使用相同键盘样式，但宿主会另外管理号码输入、SIM/SIP 方式和拨号行为。

## 结果

| 视口 | 组件区域 | 按键尺寸/横向位置 | 页面横向溢出 | 结论 |
|---|---:|---|---|---|
| 375×812 | 351×451 | 64×64；列 x=80/156/232 | 无 | PASS |
| 320×720 | 296×451 | 64×64；列 x=52/128/204 | 无 | PASS |
| 812×375 | 788×451 | 64×64；列 x=298/374/450 | 无 | PASS WITH SCROLL |

三列按键在各宽度下居中，未随父容器拉伸。横屏目录页高度不足以一次展示整个示例；页面滚动后最后一排及拨号按钮完整露出，底部导航未遮住操作区。点击 `1`、`2` 后号码显示为 `12`。页面没有报告 JS 异常。

此修复把之前 375px 实测为 109×64、320px 为 91×64、横屏为 255×64 的宽胶囊按键收敛到组件契约要求的 64×64 圆形触控面。

## 证据

- [375×812 页面](./screen-portrait-375x812.png) · [按键几何](./dialpad-portrait-375x812.png)
- [320×720 页面](./screen-narrow-320x720.png) · [按键几何](./dialpad-narrow-320x720.png)
- [812×375 按键几何](./dialpad-landscape-812x375.png) · [滚动后最后一排和拨号操作](./landscape-controls-visible.png)
- [输入 12 状态](./dialpad-entered-12.png)
- [DOM 测量](./geometry.json)

## 验收边界

Sunxu Catalog 的浏览器渲染、按键几何、窄屏宽屏布局及号码输入已核对。Tel App 认证后的 `IncomingCallScreen`、Android 原生 `PersistentBottomSheet` 和 SIM 模式拨出图标尚未在设备上渲染，宿主验收为 `UNVERIFIED`；当前环境没有连接的 Android 模拟器或设备。

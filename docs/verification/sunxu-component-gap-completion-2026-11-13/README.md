# Sunxu 与小程序组件缺口补齐验收证据

日期：2026-11-13

## 范围

对照 Sunxu 通用交互组件与 wkcrm-app 已用组件，补齐确认的两个共享缺口：受控附件字段、受控底部导航。Sunxu 提供 React Native/Expo 组件和 Catalog 示例；wkcrm-app 提供 Taro 适配层，并接入 CRM 附件字段和自定义底部导航。CRM 路由、权限、业务数据、微信文件选择/上传/下载/预览仍由宿主负责。

其余 CRM/Taro 专属字段和流程不新增为跨端基础组件：签名目前只有一个 Taro Canvas 消费点；动态字段和明细表依赖 CRM 数据契约与权限；组织目录选择可组合现有实体/树选择器。

## Sunxu Expo Web Catalog 实际渲染

页面：`http://localhost:8097/` →「组件示例」。每个视口都在新页面中直接打开，没有从较宽视口缩放。单位为 CSS px。

| 视口 | 页面 scrollWidth | 附件区 | 底部导航区 | 结果 |
| --- | ---: | ---: | ---: | --- |
| 375 × 812 | 375 | 319 × 354.5 | 319 × 130 | 无横向溢出 |
| 320 × 720 | 320 | 264 × 354.5 | 264 × 130 | 无横向溢出 |

附件示例包含 ready PDF、ready image、uploading video 与 error DOCX。两个视口均看到错误项重试操作；点击后恢复为 ready。底部导航待办项可选中并显示徽标 6。页面没有浏览器运行时错误。附件项、按钮和 Tab 的 DOM 几何见 [geometry.json](./geometry.json)，截图见 [375px](./components-375.png) 与 [320px](./components-320.png)。

实测操作尺寸：附件打开、重试、移除按钮均为 48px 高/方形，底部三个 tab 均为 48px 高。Taro 适配层行内按钮使用透明命中扩展；微信触点仍须真机核实。

## 静态验证与边界

- Sunxu：`npm run typecheck` 通过。
- wkcrm-app：`npm run tsc` 与 `npm run build` 通过。全仓 `npm run audit:ui:check` 仍失败，报告 37 处散落图标字符；本次新增组件清单为 65/65，无漏登记组件。
- 此目录是 Sunxu Expo Web Catalog 的 DOM/截图证据，不代表微信小程序运行态验收。微信目标路由、真实角色/业务数据、Taro 原生触控区与系统读屏均为 `UNVERIFIED`。

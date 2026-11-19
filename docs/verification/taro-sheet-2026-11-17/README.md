# Taro Sheet 0.1.1 验证记录

日期：2026-11-17。独立工作树基线：`a3af7ef`。本轮仅修改 `sunxu-taro-normalization`，没有设备操作、宿主代码修改、提交、推送或 npm 发布。

## 任务与范围

使用者是组合小程序界面的宿主开发者，最终用户在当前弹层直接选择项目或应用筛选。现有 OptionSheet 只支持字符串列表，无法承载任意图标网格、标题 Tabs 或独立 footer，宿主因此重复实现遮罩与表面。

本轮将通用表面抽为 Sheet：标题、关闭、正文、底栏各有单一所有者；正文只使用调用方明确选择的自然高度、容器滚动或 child-owned 滚动模式。几何从公开 token 配置，数据、权限、状态、业务图标及导航仍归宿主。首屏空间由宿主来源定义，库不引入隐含的 70vh、行数或业务标题；OptionSheet 显式保留自己的旧 82vh/八行预算。原版 H5 是宿主复刻基准，库默认外观和 Catalog 均不作为原版证据。

实施文件：`src/core/taro/Sheet.tsx`、`OptionSheet.tsx`、`Button.tsx`、公开入口和通用样式；包清单、Catalog、契约与迁移账本同步更新。RN/Expo 运行时、业务接口、图标资产、宿主和旧工作树不在写入范围。

## 已执行静态验证（E1）

| 命令 / 检查 | 结果 |
| --- | --- |
| `SUNXU_TARO_NODE_MODULES=/Users/suconnect/Desktop/code/digi-crm/wkcrm-app-components/node_modules node scripts/pack-taro.cjs --out /tmp/sunxu-taro-sheet-0.1.1` | PASS：独立 Taro strict TypeScript、声明/JS emit、npm pack，版本 0.1.1 |
| Catalog `npm run typecheck` | PASS：退出 0 |
| Catalog `npm run build:weapp` | PASS：退出 0，Webpack compiled successfully；输出只在示例自己的 dist |
| `git diff --check` | PASS |
| 版本化 tgz 内容核对 | PASS：包含 Sheet JS/声明、CSS、README、LICENSE；无 RN/Expo import 或业务资产 |

Catalog 将已安装开发依赖只读链接到自身被忽略的 node_modules；`sunxu-taro` 本身由上述 tgz 解包到 Catalog 自有 node_modules，未 alias 相邻源码。没有把包安装进宿主或改动其依赖。

OptionSheet 源码核对：选项点击只清空 keyword 并调用 `onChoose(index)`；关闭只清空 keyword 并调用 `onClose()`。关闭后重置搜索、字符串匹配、八行可视高度与 selectedIndex 展示保持原有实现。

## 运行态矩阵

本轮授权明确排除设备操作；没有生成截图或 DOM/原生节点几何，也没有执行 seam validator。以下各行均为 `UNVERIFIED`，不能用编译结果替代视觉或交互验收。

| 目标与视口 | 状态 / 交互 | 状态 |
| --- | --- | --- |
| 微信 Catalog `/pages/index/index`，375 与 320 CSS px 等效宽度 | 图标网格自然高度、标题居中/关闭在左、末项与安全区 | UNVERIFIED |
| 同路由、上述视口及横屏 | 长列表滚动、背景触摸隔离、取消与选择 | UNVERIFIED |
| 同路由、上述视口 | Tabs header、child-owned ScrollView、固定 footer、窄屏操作换行 | UNVERIFIED |
| 同路由 | OptionSheet 搜索/空值/无匹配、选中、取消后重开；onChoose 与 onClose 分离 | UNVERIFIED |
| 微信真实运行时 | 透明触控范围、系统返回/手势、辅助技术焦点及读屏 | UNVERIFIED |
| Digi CRM 原版对应真实路由 | 原版视觉、数据、权限、模板选择到目标表单 | UNVERIFIED：由宿主独立验收 |

表面层级为 viewport mask → bottom surface → header/content/footer。自然高度默认无上限；scroll 模式必须显式给出正文高度，fill 模式必须有界并由子内容拥有滚动。标题/正文/footer 使用同一横向留白，底部安全区只由 panel 追加一次。实际几何、溢出和可见分隔仍待上述运行态证据。

## Modern Web Guidance

执行 search `compose modal dialog content` 并 retrieve/读完 `dialog`、`platform-controls-dismiss-dialog`、`accessibility`。保留具名原生关闭 Button（“use a native `<button>` with an accessible name”）及自定义弹层 dialog 语义（“Apply `role="dialog"` to the custom overlay”）。微信 Taro 不具备 HTMLDialogElement，因此没有引入 `showModal()`、`closedby`、DOM focus trap 或 inert；不宣称浏览器原生焦点和返回键能力已在微信实现或通过验收。

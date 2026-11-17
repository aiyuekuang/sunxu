# Taro 组件示例

先在 Sunxu 仓库根目录运行 `node scripts/pack-taro.cjs`（依赖未安装在 `packages/taro` 时可通过 `SUNXU_TARO_NODE_MODULES` 指向已安装的 Taro 开发依赖）。然后在此目录执行 `npm install`、`npm run typecheck`、`npm run build:weapp`，用微信开发者工具打开生成的 `dist`，使用自己的合法 AppID 或工具支持的测试模式。

示例仅消费版本化 `sunxu-taro` 包，不 alias 相邻源码、不含宿主 API 或业务素材。图标 renderer 使用 Taro 原生 Icon，未知图标以 info 占位，只示范注入边界；生产宿主负责完整语义图标映射。选项、取消/清空、长文案、禁用和附件重试均可交互，修改不写外部数据。

宽窄视口与真实微信触控/读屏、截图、节点几何/溢出仍须实测；未取证前状态为 `UNVERIFIED`。本示例不是 Digi CRM 的真实路由验收证据。

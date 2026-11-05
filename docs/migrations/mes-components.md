# MES 组件迁移状态

MES 基线完整组件集已迁入目标树：共享组件 88 个、页面私有组件 305 个，共 393 条来源路径记录。迁移范围来自 `../mes-app` 的 `main-买断版本` 分支，固定提交 `e92d02d7cf2269cf8c564a60ff6a00255e903c8e`。来源工作区有未提交改动，本次只读取固定提交中的文件；没有修改来源仓库。

逐文件清单记录来源路径、提交、SHA-256、所属层、目标路径、导出子路径、宿主依赖、适配方案、迁移状态和验证证据，见 [`mes-components.json`](./mes-components.json)。393 条目标路径均已存在并通过 TypeScript 项目检查。

## 分层和导入

- `sunxu/core`：跨业务 UI、主题、工具和交互模块。
- `sunxu/mes`：32 个 MES 共享领域组件及宿主配置契约；页面私有组件不从此入口导出。
- `sunxu/integrations/mes-app`：6 个依赖 MES App 更新或生命周期的可选集成。
- `src/mes/screens/**/components/**`：305 个页面私有组件及其原目录结构，留在包内部，不升级为公共 API。

## 宿主适配

- HTTP 客户端通过 `configureMesApiClient` 注入；MES 服务代理通过 `configureMesHostServices`、`configureMesHostGeneratedServices` 和 `configureMesHostServiceHelpers` 注入。
- 权限结果由宿主 `MesAuthorizationAdapter` 提供；Sunxu 不复制后端权限码或授权策略。
- 页面状态通过外部 store 绑定接入；实时事件和附件下载通过单独适配器提供。
- 通用弹层关闭上下文、分页和字典标签规则放在 core，避免基础控件反向依赖 MES。
- App 更新、热更新、安装权限和支持联系信息仅从 `sunxu/integrations/mes-app` 显式导入。模块导入不会自行发请求或注册监听；挂载更新组件后才会运行对应生命周期行为。

## 验证和授权

- `tsc --project tsconfig.json --noEmit --pretty false`：通过。
- UI 渲染证据：`UNVERIFIED`。当前未在真实路由、视口和数据状态中运行组件，也没有截图或 DOM 几何/溢出数据。
- MES 来源仓库没有明确许可证；Sunxu 保持 `private: true`、`UNLICENSED`。不得据此对外发布或再分发迁入代码，直到权利人确认授权并确定许可证。

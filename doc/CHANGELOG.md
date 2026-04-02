# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [Unreleased]

### ✨ 新特性
- **附件上传功能 (流式方案)**：
    - **通用上传组件**：新增 `AttachmentUploader.vue`，支持 `multipart/form-data` 流式上传，简化了上传流程并提升了兼容性。
    - **详情页集成**：服务器详情页新增「附件图片」区域，支持图片的异步上传、网格化展示及点击大图预览。图片加载支持自动身份认证。
- **工单管理模块**：
    - **工单列表**：新增售后工单列表页，支持按状态筛选与分页浏览。
    - **详情页集成**：服务器详情页现已集成工单记录区域，支持直接查看该 SN 的历史工单并在详情页快速创建新工单。
    - **状态闭环**：管理员可实时更新工单状态并填写解决方案，实现售后流程线上化。
- **登录设备管理 (Session 管理)**：
    - **个人设备查看**：用户可在个人设置页查看所有活跃登录设备及其地理/设备信息。
    - **主动踢出功能**：支持踢掉指定活跃 session 或一键下线所有其他设备，提升账号安全性。
    - **管理员审计**：管理员可在用户管理页直接查看并强制下线任意用户的活跃 session。
- **用户管理模块**：为 Admin 角色新增了完整的用户管理功能。支持查看用户列表、创建新用户、修改用户角色/状态以及删除用户。通过路由守卫 `requireAdmin` 确保了模块的安全性。
- **动态内存类型联动**：重构了 `ConfigPlan` 内存选择逻辑。内存类型（DDR4/DDR5）现支持基于 CPU 规格的自动推导，并在 CPU 信息缺失时智能回退至主板支持类型，确保硬件选配的专业性与准确性。
- **全链路权限 UI 控制**：
    - **写操作入口隐藏**：基于 `usePermission` 组合式函数，对非 Admin 用户隐藏 CPU 及主板的录入/编辑按钮。
    - **受限菜单过滤**：侧边栏组件现支持 `requireAdmin` 路由标记校验。非 Admin 用户登录后，受限菜单项（如服务器录入、配置方案）将自动从菜单中移除。
...
    - **组件级访问保护**：实现了基于路由守卫 (`beforeEach`) 的 Admin 权限校验。有效解决了页面刷新时因静默刷新异步性导致的 Admin 用户被误踢回首页的问题。

### 🚀 优化与重构
- **功耗计算引擎增强**：新增 `parseTdp` 智能解析逻辑，支持处理如 `"100W/130W"` 等复杂 TDP 字符串格式，确保在多规格描述下依然能精准提取基础功耗进行累加，规避了计算结果出现 `NaN` 的风险。
- **Intel Socket 匹配增强**：
    - 优化了 `FCLGA` 至 `LGA-` 的转换正则，现已完美支持 `FCLGA2011-3` 等带复杂后缀的 Intel 接口型号。
    - 统一了验证层的 `normalizeSocket` 逻辑，通过全量归一化处理（大写化、移除非数字字符）彻底消除了因空格或短横线差异导致的兼容性误报。
- **权限响应性加固**：重构 `usePermission` 组合式函数，引入 `storeToRefs` 保持 `isAdmin` 状态的实时响应性，确保异步身份刷新完成后 UI 能即时同步权限状态。

### 🚀 优化与重构
- **详情页 UI 一致性优化**：使用 `VaCard` 重新包裹了详情页的工单折叠面板，统一了页面的阴影与圆角深度表现，使垂直布局视觉层级更加协调。
- **详情页布局重构**：将服务器详情页调整为垂直流式布局。工单记录现以折叠面板形式展现，并移至硬件配置下方，操作面板则统一置于页面底部，优化了单列阅读与操作体验。
- **工单列表显示修复**：修正了 `CasesPage.vue` 和 `ServerDetailPage.vue` 中对后端返回字段的解析逻辑，由 `items` 改为 `list`，解决了工单数据无法正常加载渲染的问题。
- **Silent Refresh 数据重建**：修复了静默刷新接口仅返回 Token 而丢失用户信息的问题。现在 `silentRefresh` 会同步从响应中重建 `user` 对象，确保刷新页面后用户的角色权限（`role`）不再丢失。
- **Store 闭合异常修复**：修正了 `configPlan` store 文件末尾因误编辑导致的重复闭合与代码片段截断问题，恢复了文件语法的完整性。

### ✨ 新特性
- **ConfigPlan 锚点导航**：为服务器配置方案页引入侧边快速导航栏。支持点击平滑滚动跳转及基于 `IntersectionObserver` 的精准滚动监听高亮，显著提升长表单操作效率。
- **硬件分类标签对齐**：在入库页与方案页同步了存储及扩展设备的细分标签（如 `M.2 SSD (NVMe)`、`显卡 (GPU / 加速卡)`、`存储控制 (RAID / HBA)`），实现两端业务逻辑与视觉认知的完全统一。

### 🚀 优化与重构
- **多型号合并存储协议**：重构了入库页提交与方案页导出的数据处理逻辑。
    - **单型号**：维持 `型号名称 + 数量` 的纯净存储。
    - **多型号**：自动转换为 `型号1 * 数量1;型号2 * 数量2` 的合并字符串，并设置数量字段为 `0`（多项标记位），确保数据库层面数据结构的紧凑与直观。
- **配置方案 UI 瘦身**：
    - 重构 `StorageSelector` 与 `ExpansionSelector`，移除冗余背景色块与表头。
    - 采用紧凑行布局 (`hw-row`) 并将添加按钮聚合至板块底部，大幅减少页面垂直占用空间。
- **VS Code 任务适配**：更新 `.vscode/tasks.json`，将调试任务标签由 `npm: dev` 修正为 `pnpm: dev`，解决 Remote-SSH 环境下的任务探测失效问题。

### 🚀 优化与重构
- **服务器录入 API 对齐**：将入库接口统一指向 `POST /api/sn`，并将 SN 唯一性检查接口更新为 `GET /api/sn/check-sn/:sn`，确保前后端数据流向一致。
- **SN 序列号智能校验**：在入库页引入异步校验逻辑。用户输入 SN 时自动检查库中是否存在冲突，并提供实时的 Loading 状态与错误预警，从源头防止重复入库。
- **批量导入 OS 智能分发**：增强了批量配置导入的解析引擎。现在能自动识别“系统”或“OS”关键字，并将其内容精准填充至表单的“操作系统”栏目，减少了手动从备注中提取的工作量。

### 🚀 优化与重构
- **硬件维护闭环**：
    - **快捷录入集成**：在“方案页”与“入库页”同步集成了 CPU 及主板的快捷录入按钮。用户可直接在录入过程中补全缺失硬件规格，系统支持新增后的自动选中与联动刷新。
    - **UI 布局优化**：采用“Label 占位”方案，实现了录入按钮与输入框的精确对齐；同时重构了服务器详情页的硬件展示逻辑，实现了多型号数据的智能拆分换行、垂直居中对齐及全局色彩归一化。
- **方案页体验升级**：新增“重置方案”一键清空功能，并集成了二次确认弹窗，有效防止误操作并提升了多配置切换的便利性。
- **硬件规格在线修改**：
    - **编辑模式集成**：重构了 CPU 和主板的维护弹窗，支持“新增/修改”双模式。
    - **入口全覆盖**：在方案页与入库页的硬件详情区域均集成了编辑按钮，支持在业务流程中即时修正硬件规格错误。
- **录入稳健性增强**：新增服务器录入页“草稿自动保存”功能。通过实时监听表单状态并同步至本地存储，有效防止页面刷新或意外断连导致的数据丢失，支持智能恢复并自动剔除敏感校验字段。
- **交互细节打磨**：
    - **CPU 搜索优化**：修正了 `CpuSelector.vue` 中搜索建议列表的定位逻辑，确保下拉列表在各种布局下的展示稳定性。
    - **UI 布局优化**：采用“Label 占位”方案，实现了录入按钮与输入框的精确对齐。
- **仪表盘动态化集成**：完成了仪表盘与后端统计接口的全面对接。现在可实时展示总资产数、月新增入库、客户统计及系统分布占比，并支持最近入库记录的动态追踪。
- **Hashids 全链路适配**：加固了硬件维护模块的 ID 处理逻辑，支持混淆字符串 ID 的回填与透传，确保了编辑模式在后端安全架构变更后的持续可用。
- **全局拦截器增强**：优化了 `request.js` 的响应拦截逻辑。实现了对 409 (数据冲突)、403 (权限不足) 等特定状态码的显式错误提示，增强了系统的交互韧性。
- **路由权限架构升级**：
    - **全量白名单模式**：重构全局路由守卫，由“逐条声明”切换为“默认拦截”模式。仅 `public: true` 的页面免登录访问，从架构层面杜绝了新页面漏配权限的安全隐患。
    - **封锁逻辑加固**：修复并强化了 `allowDirectAccess: false` 的判定流。该限制现在对直连、刷新及应用内跳转均生效，确保特定功能页面的受控访问。
    - **路由表精简**：移除了所有路由项中冗余的 `requiresAuth` 标记，使配置结构更加扁平清晰。

### 🚀 优化与重构
- **核心配置录入解耦**：将主板选择逻辑由“基于 CPU Socket 的联动下拉框”重构为“独立实时搜索输入框”。彻底解除 CPU 对主板录入的硬性限制，并解决了批量填充时 CPU 变动误重置主板数据的问题。
- **录入 UI 体验增强**：
    - 批量导入文本框支持 `autosize` 自适应高度，并优化了初始可视区域，提升大段 Excel 数据粘贴时的观感。
    - 为非数据库匹配项（如内存、硬盘等）引入“已识别”状态，消除误报“未匹配”红框带来的视觉干扰。
- **API 路径对齐**：将主板搜索接口路径统一更新为 `/hw/mb`。

### 🐛 修复
- **详情页折叠面板间距修复**：由于 `VaCollapse` 会重置子组件内边距，现将内部容器由 `VaCardContent` 替换为带显式 `padding` 的 `div`，彻底解决了工单记录展开后内容紧贴边框的问题。
- **请求分流优化**：修正了 CPU 型号录入或导入时误触发主板接口查询的逻辑，现在根据预设类型精准分发 API 请求。
- **UI 定位纠偏**：修复了主板搜索建议列表因缺少 `relative` 定位上下文而导致的位置偏移 Bug。
- **解析正则增强**：优化了批量导入的解析正则，现在能更稳健地处理带制表符（Tab）和复杂中文前缀的粘贴数据。

## [1.0.0] - 2026-03-09

### Added
- Created this standardized `CHANGELOG.md` to track project evolution.
- 新增 `src/stores/auth.js`：Pinia 内存 Token 管理，提供 `silentRefresh()` 页面刷新静默恢复登录态备份。
- 新增 `src/pages/server/ServerEntryPage.vue`：支持 30+ 字段的服务器入库录入页面。
- 优化 `ServerEntryPage.vue`：严格对照数据库表结构调整字段，将 `number` 字段明确为入库数量，将 CPU 录入组件升级为带实时建议的文本搜索框（对齐 ConfigPlan 逻辑），并重构页面布局为全宽三行结构，显著提升录入效率。
- 新增 `src/api/server.js`：封装服务器入库与 SN 唯一性检查接口。

### Changed
- Updated root `README.md` with better navigation to documentation.
- Updated `.gitignore` to exclude local `SESSION_NOTES.md` session notes file.
- Improved inline code comments across key scripts (`request`, route-driven detail loading, session cache, table interaction) and standardized API module JSDoc in `src/api/sn.js` and `src/api/filters.js`.
- Unified `src/pages/SettingsPage.vue` to project JavaScript style, added localStorage persistence (`appSettings`), refresh-interval normalization (5-3600), and responsive layout optimization.
- Added authenticated `/server/entry` and `/settings` routes in `src/router/index.js`.
- 配置 `vite.config.js`：新增 `server.proxy` 代理，解决开发环境下跨域（CORS）问题。
- 更新 `.env.development`：调整 `VITE_API_BASE_URL` 为 `/api` 以适配 Vite 代理。
- Added missing global design tokens in `src/styles/tokens.css` (`--color-bg-card`, `--color-border-subtle`, `--color-text-subtle`, `--text-md`, `--shadow-sm`, `--shadow-lg`) to prevent style fallback issues in ConfigPlan and layout components.
- Updated memory-slot constraint logic in `src/stores/configPlan.js` to use database field `dimm_number` for accurate capacity validation.
- Fixed table-column alignment in ConfigPlan storage/expansion sections by switching header/body rows to consistent CSS grid columns in `StorageSelector.vue` and `ExpansionSelector.vue`.
- `src/utils/request.js`：添加 `withCredentials: true`，Token 读取改为 `authStore`，401 刷新改用 `silentRefresh()`。
- `src/router/index.js`：路由守卫改为检查 `authStore.isLoggedIn`，页面刷新时自动 `silentRefresh()`。
- `src/layouts/Header.vue`：登出调用 `/api/auth/logout` 清除 Cookie，不再直接删 `localStorage`。
- Merged duplicate store directories by moving `useServerListStore` from `src/store/` to `src/stores/`, and updated all related imports to the unified `src/stores/` path.
- Refactored ConfigPlan validation into a dedicated `src/stores/configPlanValidation.js` module, added graded validation output (`blockers/warnings/infos`).
- 优化 `configPlanValidation.js`：修复 Socket 校验中 Intel `FCLGA` 前缀导致的误判，统一功耗警告阈值为 `0.85` 以匹配 UI 表现。
- 完善 `CompatibilityAlert.vue`：新增对 `infos` 级建议的渲染支持，并优化了各级告警的图标与样式展示。
- 清理 `src/stores/configPlan.js`：移除了重构后冗余的 `compatibilityWarnings` 计算属性。
- Added explicit CPU/MB socket compatibility validation (final guardrail) in ConfigPlan validation rules.

### Security
- **修复 XSS 令牌窃取漏洞**：`refreshToken` 从 `localStorage` 迁移至后端下发的 `HttpOnly + SameSite=Lax` Cookie（生产环境启用 `Secure`），JS 完全无法读取。
- `accessToken` 改为内存存储（Pinia `authStore`），不再写入 `localStorage`；页面刷新后通过 Cookie 静默换取新令牌。
- 后端 CORS 从 `origin: '*'` 收紧至 `FRONTEND_URL` 并启用 `credentials: true`（`server_api/server.js`）。
- `server_api/controllers/authController.js`：`login` 改为 Cookie 下发，`refresh` 从 `req.cookies` 读取，`logout` 清除 Cookie。

### Fixed
- 修复 Safari 浏览器下 Header 用户头像弹出菜单样式异常（宽度拉伸且内容不显示）的问题，并解决了菜单项图标与文字重叠及悬停时图标消失的视觉 bug。优化了 `src/layouts/Header.vue` 中的 CSS 覆盖逻辑，移除了导致渲染问题的 `table-layout: fixed`。
- 修复 `src/utils/request.js` 中错误使用 CommonJS `require()` 导致浏览器端 `ReferenceError` 的 bug，改为 ESM `import`。

### Removed
- Cleaned up legacy documentation in `doc/` directory (removed 11 outdated migration and design docs).

## [0.1.0] - 2026-02-01

### Changed
- Major refactor: Migrated from Element Plus to Vuestic UI.
- Converted codebase from TypeScript to JavaScript for simplified maintenance.
- Implemented state persistence for server list.
- Optimized large data handling in `ServerListPage` (V3 update).

## [0.0.1] - 2026-01-01

### Added
- Initial release of the Server Info hardware management system.

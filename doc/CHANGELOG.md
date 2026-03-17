# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- **硬件管理 API 扩展**：新增并完善了 CPU (POST/PUT) 与主板 (POST/PUT) 的维护接口，适配最新的 `cpu_info` 与 `mb_info` 表结构。
- **UI 细节打磨**：优化了各页面中新增硬件按钮的布局样式，通过锁定按钮高度（36px）实现了与输入框框体的完美视觉对齐。
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

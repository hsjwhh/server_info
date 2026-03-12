# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ 新特性
- **业务筛选**：在服务器搜索结果页新增“业务筛选”下拉框，支持基于搜索结果的内存过滤、分页联动以及 Session 状态持久化。
- **路由安全拦截**：在全局路由守卫中新增 `allowDirectAccess` 校验逻辑，支持通过路由元信息显式禁止手动输入 URL 访问特定页面（如配置为 `false` 时自动重定向至 Dashboard）。
- **页面闭环**：补全了服务器列表页“添加服务器”按钮的跳转逻辑，现在直接链接至入库录入页。

### 🚀 优化与重构
- **视觉细节微调**：
    - 移除了 Sidebar 容器右侧边框，使侧边栏与内容区视觉过渡更自然。
    - 调整 `PageHeader` 最小高度为 `60px`，优化了面包屑区域的垂直空间感。
    - 统一全局边框色变量 (`--color-border`, `--color-border-subtle`) 为更浅的 `#f3f4f6`。
- **构建体积优化**：
    - 将 `@mdi/font` 迁移至 `index.html` 通过 CDN 引入，显著减少了生产环境包体积。
    - 在 `vite.config.js` 中实施了细粒度的 `manualChunks` 策略（Vue 生态、Vuestic UI、HTTP 层、业务逻辑层），提升了产物缓存命中率。
    - 在 `main.js` 中优化了图标别名映射，解决了基础图标显示异常的问题。
- **冗余样式大扫除**：对 `CpuSelector`, `MotherboardSelector`, `ServerEntryPage` 等核心组件进行了“去重”治理，累计移除 150+ 行 Scoped CSS，确保全站 UI 逻辑高度统一。
- **全站页面瘦身**：对 `pages/` 目录下所有页面进行了样式治理，全面改用全局 `utilities` 与 `Design Token`。
- **布局一致性修复**：移除了所有路由页面根部的 Flex 容器，回归块级流式布局，解决了内容不足时页面垂直居中问题。
- **样式体系重构**：建立了完整的 Design Token 体系 (`tokens.css`)，消灭硬编码颜色。
- **UI 模式组件化**：正式建立 `src/styles/components.css`，将建议列表（Suggestions）、已选卡片（Selected Card）及详情网格（Details Grid）提取为可复用的全局 UI 模式，并内置移动端响应式适配。

### 🐛 修复
- **全量数据排序**：重构了服务器列表的排序逻辑，将排序行为从组件局部移至 Store 层级（`sortedServers`），实现了基于全量搜索结果的跨页排序，并解决了日期（y/m/d 分散字段）排序乱序的问题。
- **定位与覆盖**：修复了 CPU 搜索建议列表覆盖输入框的定位缺陷。
- **事件绑定**：将全站 `VaInput` 实时搜索触发事件统一为 `@update:model-value`，解决了部分浏览器下输入响应不灵敏的问题。
- **状态恢复**：优化了列表页的生命周期钩子，确保在未开启 keep-alive 的环境下依然能正确存取 Session 搜索状态。
- **Login**：修复了登录页卡片圆角裁剪风险，移除了 `clip-path` hack。
- **空状态**：优化并统一了全站空状态图标尺寸与样式。

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

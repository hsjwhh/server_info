# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Created this standardized `CHANGELOG.md` to track project evolution.
- 新增 `src/stores/auth.js`：Pinia 内存 Token 管理，提供 `silentRefresh()` 页面刷新静默恢复登录态。

### Changed
- Updated root `README.md` with better navigation to documentation.
- Updated `.gitignore` to exclude local `SESSION_NOTES.md` session notes file.
- Improved inline code comments across key scripts (`request`, route-driven detail loading, session cache, table interaction) and standardized API module JSDoc in `src/api/sn.js` and `src/api/filters.js`.
- Unified `src/pages/SettingsPage.vue` to project JavaScript style, added localStorage persistence (`appSettings`), refresh-interval normalization (5-3600), and responsive layout optimization.
- Added authenticated `/settings` route in `src/router/index.js` so header "个人设置" navigation resolves correctly.
- Added missing global design tokens in `src/styles/tokens.css` (`--color-bg-card`, `--color-border-subtle`, `--color-text-subtle`, `--text-md`, `--shadow-sm`, `--shadow-lg`) to prevent style fallback issues in ConfigPlan and layout components.
- Updated memory-slot constraint logic in `src/stores/configPlan.js` to use database field `dimm_number` for accurate capacity validation.
- Fixed table-column alignment in ConfigPlan storage/expansion sections by switching header/body rows to consistent CSS grid columns in `StorageSelector.vue` and `ExpansionSelector.vue`.
- `src/utils/request.js`：添加 `withCredentials: true`，Token 读取改为 `authStore`，401 刷新改用 `silentRefresh()`。
- `src/router/index.js`：路由守卫改为检查 `authStore.isLoggedIn`，页面刷新时自动 `silentRefresh()`。
- `src/layouts/Header.vue`：登出调用 `/api/auth/logout` 清除 Cookie，不再直接删 `localStorage`。

### Security
- **修复 XSS 令牌窃取漏洞**：`refreshToken` 从 `localStorage` 迁移至后端下发的 `HttpOnly + SameSite=Lax` Cookie（生产环境启用 `Secure`），JS 完全无法读取。
- `accessToken` 改为内存存储（Pinia `authStore`），不再写入 `localStorage`；页面刷新后通过 Cookie 静默换取新令牌。
- 后端 CORS 从 `origin: '*'` 收紧至 `FRONTEND_URL` 并启用 `credentials: true`（`server_api/server.js`）。
- `server_api/controllers/authController.js`：`login` 改为 Cookie 下发，`refresh` 从 `req.cookies` 读取，`logout` 清除 Cookie。

### Fixed
- 修复 `src/utils/request.js` 中错误使用 CommonJS `require()` 导致浏览器端 `ReferenceError` 的 bug，改为 ESM `import`。

### Removed
- Cleaned up legacy documentation in `doc/` directory (removed 11 outdated migration and design docs).

---

## [2.0.0] - 2026-02-01

### Changed
- Major refactor: Migrated from Element Plus to Vuestic UI.
- Converted codebase from TypeScript to JavaScript for simplified maintenance.
- Implemented state persistence for server list.
- Optimized large data handling in `ServerListPage` (V3 update).

## [1.0.0] - 2026-01-01

### Added
- Initial release of the Server Info hardware management system.

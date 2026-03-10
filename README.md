# Server Info - 服务器资产管理与选型系统

基于 Vue 3 + Pinia + Vuestic UI 构建的专业服务器硬件管理平台。

## ✨ 最近更新 (2026-03-10)

- **样式工程化重构**：建立了基于 Design Token 的语义化样式体系，消灭硬编码颜色，全站视觉精致度与一致性大幅提升。
- **业务筛选功能**：在服务器列表页新增“业务二次筛选”，支持对海量搜索结果进行毫秒级的前端内存过滤。
- **UI/UX 深度优化**：重构了 Sidebar 折叠动效、统一了全局空状态规范、并为 Dashboard 引入了多维统计卡片视觉强化。
- **架构治理**：彻底移除了样式中的 `!important` 滥用，实现了样式优先级的规范化管理。

## 🌟 核心特性

- **资产快速查询**：支持 SN/主机名全局模糊搜索，集成业务（Owner）级即时筛选，支持分页状态持久化。
- **硬件选型联动**：根据选定 CPU 自动筛选兼容主板，推导内存类型，实时校验物理插槽与针脚兼容性。
- **功耗分析引擎**：实时计算服务器总功耗（TDP/TGP），并根据 1.3x 安全冗余系数动态推荐分级电源。
- **兼容性智能审计**：内置内存插槽上限、总容量边界及电源负载率（85% 阈值）三重智能校验。
- **极致安全架构**：refreshToken 采用 HttpOnly Cookie 存储，内存态 accessToken 实现防劫持静默刷新。

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **状态管理**：Pinia (单例模式，具备响应式计算属性缓存)
- **UI 组件库**：Vuestic UI (企业级高性能组件库)
- **样式方案**：原生 CSS 变量 (Design Tokens) + 布局工具类
- **构建工具**：Vite

## 🧠 架构与样式规范

- **Design Tokens**：全站视觉变量统一定义在 `src/styles/tokens.css`，严禁在组件内硬编码颜色或阴影。
- **状态驱动**：复杂的硬件联动与校验逻辑封装在 `src/stores/` 中，组件仅负责数据订阅与视图派发。
- **工具类优先**：布局调整优先使用 `utilities.css` 中的原子类，严禁滥用 `!important` 破坏级联规则。

## 📂 项目结构

```text
src/
├── api/            # API 请求模块 (Axios 封装与拦截器)
├── components/     # 业务组件 (ConfigPlan 配置方案 / ServerDetail 详情展示)
├── layouts/        # 页面布局模板 (Sidebar, Header, PageHeader)
├── pages/          # 路由页面模块
├── stores/         # Pinia 状态树 (核心业务逻辑与校验引擎)
├── styles/         # 设计系统 Token 与全局原子类
└── utils/          # 硬件逻辑处理与请求工具函数
```

## 🚀 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发服务器
```bash
pnpm dev
```

### 3. 构建生产版本
```bash
pnpm build
```

---
> [!TIP]
> 详细的项目演进记录请参阅 [CHANGELOG.md](./doc/CHANGELOG.md)。

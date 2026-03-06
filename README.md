# Server Info - 服务器硬件配置管理系统

基于 Vue 3 + Pinia + Vuestic UI 构建的专业服务器硬件选型与配置管理系统。

## 🌟 核心特性

- **硬件选型联动**：根据选定的 CPU 自动筛选兼容的主板针脚，并推导支持的内存类型。
- **功耗分析引擎**：实时计算服务器总功耗（TDP/TGP），并根据 1.3x 冗余系数推荐合适的电源功率。
- **多维度硬件配置**：
  - 支持多路 CPU 节点配置。
  - 存储设备（M.2, SSD, HDD）支持多型号、多容量组合。
  - 扩展设备（网卡, 显卡, RAID 卡）支持复杂的硬件堆叠。
- **兼容性智能审计**：
  - 内存总容量上限校验。
  - 主板内存插槽数量校验。
  - 电源负载风险预警。
- **方案导出**：一键生成标准 JSON 配置方案并复制到剪贴板。

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **状态管理**：Pinia (真正的单例模式，解决内存泄漏与 SSR 数据污染)
- **UI 组件库**：Vuestic UI (现代化、高性能的企业级 UI 库)
- **图标系统**：Material Design Icons (MDI)
- **构建工具**：Vite
- **包管理**：pnpm

## 📂 项目结构

```text
src/
├── api/            # API 请求模块 (Axios 封装)
├── components/     # 业务组件
│   └── ConfigPlan/ # 配置方案核心组件 (CPU/主板/内存/存储/扩展选择器)
├── layouts/        # 页面布局模板
├── pages/          # 路由页面 (Dashboard, ConfigPlan, ServerDetail 等)
├── stores/         # Pinia 状态树 (核心业务逻辑所在)
└── styles/         # 全局样式与设计系统 Token
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

## 🧠 架构设计规范

- **状态驱动**：所有硬件联动逻辑集中在 `src/stores/configPlan.js` 中，通过 Pinia Getters 实现计算属性的全局唯一缓存。
- **魔法数字管理**：严禁在组件内硬编码功耗常量，所有硬件参数系数必须维护在 Store 顶部的 `CONFIG` 字典中。

> [!NOTE]
> 本项目目前处于快速迭代阶段，最新的硬件功耗系数基于实验室估算值，仅供配置选型参考。

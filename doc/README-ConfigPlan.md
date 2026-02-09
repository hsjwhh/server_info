# 硬件配置方案页面 - 集成指南

## 📁 文件说明

### 前端文件
1. **ConfigPlanPage.vue** - 主页面组件
   - 位置: `src/pages/ConfigPlanPage.vue`
   - 功能: 硬件选择、配置总览、功耗计算

2. **configPlan.js** - API 封装
   - 位置: `src/api/configPlan.js`
   - 功能: 所有硬件配置相关的 API 调用

3. **router-index.js** - 更新后的路由配置
   - 位置: `src/router/index.js`
   - 新增: `/config-plan` 路由

4. **hardwareData-mock.js** - Mock 数据示例
   - 位置: `mock/hardwareData.js` (可选)
   - 功能: 后端 API 返回格式参考

---

## 🚀 快速集成步骤

### 1. 复制文件到项目

```bash
# 复制页面组件
cp ConfigPlanPage.vue src/pages/

# 复制 API 封装
cp configPlan.js src/api/

# 替换路由配置 (或手动合并)
cp router-index.js src/router/index.js
```

### 2. 安装依赖 (如果缺少)

```bash
npm install lodash.debounce
# 或
pnpm add lodash.debounce
```

### 3. 确认已有依赖

确保 `package.json` 中已包含:
```json
{
  "dependencies": {
    "vue": "^3.5.24",
    "vue-router": "^4.6.4",
    "vuestic-ui": "^1.10.3",
    "axios": "^1.13.2",
    "lodash.debounce": "^4.0.8"
  }
}
```

---

## 🔧 后端 API 接口要求

### 1. CPU 搜索接口

**请求:**
```
GET /api/hardware/cpu/search?keyword=xeon
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "cpu_short_name": "Intel Xeon E5-2680 v4",
      "cores": 14,
      "threads": 28,
      "base_freq": 2.4,
      "turbo_freq": 3.3,
      "tdp": 120,
      "memory_type": "DDR4",
      "max_memory_speed": 2400,
      "socket": "LGA2011-3"
    }
  ]
}
```

### 2. 兼容主板查询接口

**请求:**
```
GET /api/hardware/motherboard/compatible?cpu=Intel Xeon E5-2680 v4
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "model": "Supermicro X10DRi",
      "chipset": "Intel C612",
      "socket": "LGA2011-3",
      "cpu_support": ["Xeon E5-2600 v3", "Xeon E5-2600 v4"],
      "memory_slots": 16,
      "memory_type": "DDR4",
      "max_memory": 512,
      "pcie_slots": "3 × PCIe 3.0 x16",
      "power": 50
    }
  ]
}
```

### 3. 保存配置方案接口 (可选)

**请求:**
```
POST /api/config-plan
Content-Type: application/json

{
  "name": "双路E5服务器配置方案",
  "cpu": { "model": "Intel Xeon E5-2680 v4", "count": 2 },
  "motherboard": "Supermicro X10DRi",
  "memory": { "type": "DDR4", "capacity": "32GB", "count": 8 }
  // ... 其他配置
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "cfg_1234567890",
    "created_at": "2024-02-08T10:30:00Z"
  }
}
```

---

## 📊 数据库设计建议

### CPU 表 (cpu_specs)

```sql
CREATE TABLE cpu_specs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  cpu_short_name VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  manufacturer VARCHAR(50),
  socket VARCHAR(50),
  cores INT,
  threads INT,
  base_freq DECIMAL(4,2),
  turbo_freq DECIMAL(4,2),
  tdp INT,
  memory_type VARCHAR(20),
  max_memory_speed INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_short_name (cpu_short_name),
  INDEX idx_socket (socket)
);
```

### 主板表 (motherboard_specs)

```sql
CREATE TABLE motherboard_specs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  model VARCHAR(255) UNIQUE NOT NULL,
  manufacturer VARCHAR(50),
  chipset VARCHAR(50),
  socket VARCHAR(50),
  cpu_support TEXT,  -- JSON: ["E5-2600 v3", "E5-2600 v4"]
  memory_slots INT,
  memory_type VARCHAR(20),
  max_memory INT,
  pcie_slots VARCHAR(255),
  power INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_socket (socket)
);
```

---

## 🎨 功能特性

### ✅ 已实现功能

1. **CPU 智能搜索**
   - 关键字自动补全
   - 实时搜索建议
   - 显示核心参数 (核心数、频率、TDP)

2. **主板兼容性匹配**
   - 根据 CPU 自动筛选兼容主板
   - 显示主板关键参数 (芯片组、内存插槽、PCIe)
   - 自动检查兼容性

3. **内存配置**
   - 根据 CPU/主板自动设置内存类型
   - 支持多种容量选择
   - 实时显示总容量和功耗

4. **存储配置**
   - 支持 M.2 NVMe / SATA SSD / HDD
   - 灵活的数量配置
   - 功耗预估

5. **扩展硬件**
   - 网卡、显卡、RAID 卡
   - 预设功耗数据

6. **实时功耗计算**
   - 各部件功耗分解
   - 总功耗统计
   - 推荐电源功率
   - 负载率可视化

7. **兼容性检查**
   - 内存容量超限提醒
   - 插槽数量检查
   - 功耗预警

8. **配置导出**
   - 一键复制到剪贴板
   - JSON 格式

### 🔮 可扩展功能

1. **配置方案保存/加载**
   - 实现 `saveConfig()` 和 `getConfigList()`
   - 用户可管理多个方案

2. **配置模板**
   - 预设常用配置模板
   - 快速应用

3. **价格估算**
   - 接入硬件价格数据
   - 显示总成本

4. **性能评分**
   - 根据配置计算性能分数
   - 不同应用场景的推荐

5. **PDF 导出**
   - 生成配置清单 PDF
   - 包含详细参数

---

## 🐛 常见问题

### 1. 路由菜单不显示

检查 `meta.showInMenu` 是否设置为 `true`:

```javascript
{
  path: 'config-plan',
  meta: {
    title: '配置方案',
    icon: 'mdi-clipboard-text-outline',
    showInMenu: true  // 👈 必须设置
  }
}
```

### 2. API 调用失败

确认 `baseURL` 配置正确:

```javascript
// src/utils/request.js
const service = axios.create({
  baseURL: 'http://your-backend-api:3001/api',
  timeout: 5000
})
```

### 3. 图标不显示

确保已安装 MDI 图标:

```bash
npm install @mdi/font
```

并在 `main.js` 中引入:

```javascript
import '@mdi/font/css/materialdesignicons.min.css'
```

---

## 🎯 使用流程

1. **选择 CPU**
   - 输入 CPU 型号关键字
   - 从搜索结果中选择
   - 查看 CPU 详细参数
   - 设置 CPU 数量

2. **选择主板**
   - 系统自动加载兼容主板
   - 选择合适的主板型号
   - 查看主板参数

3. **配置内存**
   - 选择内存容量 (自动匹配类型)
   - 设置内存条数量
   - 查看总容量和功耗

4. **配置存储**
   - 勾选需要的存储类型
   - 选择容量和数量

5. **添加扩展硬件** (可选)
   - 网卡、显卡、RAID 卡

6. **查看总览**
   - 右侧实时显示配置清单
   - 功耗分析
   - 兼容性提示

7. **导出配置**
   - 点击"导出配置"按钮
   - 配置已复制到剪贴板

---

## 📝 样式说明

页面采用左右分栏布局:

- **左侧 (Selection Panel)**: 60%宽度,滚动区域,硬件选择表单
- **右侧 (Summary Panel)**: 400px固定宽度,配置总览和功耗分析

响应式设计:
- 屏幕宽度 < 1280px 时,自动切换为单栏布局

配色方案:
- 主色调: Vuestic 默认蓝色 (`#2563eb`)
- 背景色: `#f9fafb` (浅灰)
- 边框色: `#e5e7eb`
- 警告色: `#f59e0b` (橙色)
- 危险色: `#ef4444` (红色)

---

## 🔐 权限控制

页面需要登录才能访问:

```javascript
meta: {
  requiresAuth: true  // 需要登录
}
```

如果用户未登录,会自动跳转到 `/login`。

---

## 📞 技术支持

如有问题,请检查:

1. 浏览器控制台 (F12) 查看错误信息
2. 网络面板查看 API 请求/响应
3. Vue DevTools 查看组件状态

常见错误:
- `Cannot read property of undefined`: 数据结构不匹配
- `Network Error`: 后端服务未启动或 baseURL 配置错误
- `401 Unauthorized`: Token 过期,需要重新登录

---

## 📄 License

MIT License

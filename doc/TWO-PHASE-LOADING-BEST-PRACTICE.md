# Vue3 两阶段数据加载最佳实践

## 📊 架构设计原则

### 问题背景

在硬件配置方案页面中，用户需要：
1. 搜索 CPU（可能返回几十条结果）
2. 从结果中选择一个
3. 查看详细信息并配置

### 两种方案对比

#### ❌ 方案 A：一次性加载所有数据

```javascript
// 搜索接口返回完整数据
const handleCpuSearch = async () => {
  const results = await searchCpu(keyword)
  // results 包含所有字段：
  // id, cpu_short_name, full_name, cores, threads, 
  // base_freq, turbo_freq, tdp, cache_l3, memory_type,
  // memory_channels, max_memory_speed, max_memory, 
  // pcie_lanes, release_date, ...
  cpuSuggestions.value = results
}

const selectCpu = (cpu) => {
  selectedCpu.value = cpu  // 直接使用搜索结果
}
```

**缺点：**
- 🔴 搜索时传输大量无用数据（用户只看到 3-4 个字段）
- 🔴 网络带宽浪费
- 🔴 搜索速度慢（数据库查询和序列化开销大）
- 🔴 客户端内存占用高

---

#### ✅ 方案 B：两阶段加载（推荐）

```javascript
/**
 * 第一阶段：搜索 - 轻量级数据
 * 
 * 只返回列表展示所需字段：
 * - id (后续查询用)
 * - cpu_short_name (显示)
 * - cores, threads, tdp (关键参数)
 */
const handleCpuSearch = async () => {
  const results = await searchCpu(keyword)
  // results: [{ id: 123, cpu_short_name: "...", cores: 14, tdp: 120 }]
  cpuSuggestions.value = results
}

/**
 * 第二阶段：选择 - 完整数据
 * 
 * 通过 ID 获取所有详细信息
 */
const selectCpu = async (cpuSummary) => {
  loadingCpuDetail.value = true
  
  // 👇 调用详情接口，获取完整数据
  const cpuDetail = await getCpuDetail(cpuSummary.id)
  
  selectedCpu.value = cpuDetail
  loadingCpuDetail.value = false
}
```

**优点：**
- ✅ 搜索快：只传输必要数据
- ✅ 带宽优化：减少 60-80% 的数据传输
- ✅ 内存优化：建议列表只保留轻量数据
- ✅ 可扩展：详情可包含更复杂的数据（规格书、测试报告等）

---

## 🏗️ 完整实现示例

### 1. 后端 API 设计

#### 搜索接口（轻量级）

```javascript
/**
 * GET /api/hardware/cpu/search?keyword=xeon
 * 
 * 只返回列表必需字段
 */
router.get('/cpu/search', async (req, res) => {
  const query = `
    SELECT 
      id,
      cpu_short_name,
      cores,
      threads,
      base_freq,
      tdp
    FROM cpu_info
    WHERE cpu_short_name LIKE ?
    LIMIT 20
  `
  
  const [results] = await db.execute(query, [`%${keyword}%`])
  res.json({ success: true, data: results })
})
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "cpu_short_name": "Intel Xeon E5-2680 v4",
      "cores": 14,
      "threads": 28,
      "base_freq": 2.4,
      "tdp": 120
    }
  ]
}
```

---

#### 详情接口（完整数据）

```javascript
/**
 * GET /api/hardware/cpu/123
 * 
 * 返回所有字段
 */
router.get('/cpu/:cpuId', async (req, res) => {
  const query = `SELECT * FROM cpu_info WHERE id = ?`
  const [results] = await db.execute(query, [cpuId])
  res.json({ success: true, data: results[0] })
})
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "cpu_short_name": "Intel Xeon E5-2680 v4",
    "full_name": "Intel Xeon E5-2680 v4 @ 2.40GHz",
    "manufacturer": "Intel",
    "series": "Xeon E5 v4",
    "socket": "LGA2011-3",
    "cores": 14,
    "threads": 28,
    "base_freq": 2.4,
    "turbo_freq": 3.3,
    "tdp": 120,
    "cache_l3": 35,
    "memory_type": "DDR4",
    "memory_channels": 4,
    "max_memory_speed": 2400,
    "max_memory": 768,
    "pcie_lanes": 40,
    "release_date": "2016-Q1"
  }
}
```

---

### 2. 前端 API 封装

```javascript
// src/api/configPlan.js

/**
 * 搜索 CPU (轻量级)
 */
export function searchCpu(keyword) {
  return request.get('/hardware/cpu/search', {
    params: { keyword }
  })
}

/**
 * 获取 CPU 详情 (完整数据)
 */
export function getCpuDetail(cpuId) {
  return request.get(`/hardware/cpu/${cpuId}`)
}
```

---

### 3. Vue 组件实现

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { searchCpu, getCpuDetail } from '@/api/configPlan'

/**
 * 状态管理
 */
const cpuKeyword = ref('')
const cpuSuggestions = ref<any[]>([])  // 搜索结果 (轻量级)
const selectedCpu = ref<any>(null)      // 选中的 CPU (完整数据)
const loadingCpuDetail = ref(false)

/**
 * 第一阶段：搜索
 */
const handleCpuSearch = debounce(async () => {
  if (!cpuKeyword.value || cpuKeyword.value.length < 2) {
    cpuSuggestions.value = []
    return
  }

  try {
    // 只获取列表数据
    const results = await searchCpu(cpuKeyword.value)
    cpuSuggestions.value = results
  } catch (err) {
    console.error('CPU 搜索失败:', err)
  }
}, 300)

/**
 * 第二阶段：选择并加载详情
 */
const selectCpu = async (cpuSummary: any) => {
  try {
    // 立即更新 UI
    cpuKeyword.value = cpuSummary.cpu_short_name
    cpuSuggestions.value = []
    loadingCpuDetail.value = true

    // 获取完整数据
    const cpuDetail = await getCpuDetail(cpuSummary.id)
    selectedCpu.value = cpuDetail

    // 使用完整数据做后续操作
    memoryType.value = cpuDetail.memory_type || 'DDR4'
    await loadCompatibleMotherboards()

  } catch (err) {
    console.error('加载 CPU 详情失败:', err)
    selectedCpu.value = null
  } finally {
    loadingCpuDetail.value = false
  }
}
</script>

<template>
  <VaInput
    v-model="cpuKeyword"
    :loading="loadingCpuDetail"
    @input="handleCpuSearch"
  />

  <!-- 搜索建议列表 -->
  <div v-if="cpuSuggestions.length > 0">
    <div
      v-for="cpu in cpuSuggestions"
      :key="cpu.id"
      @click="selectCpu(cpu)"
    >
      {{ cpu.cpu_short_name }} - {{ cpu.cores }}C/{{ cpu.threads }}T
    </div>
  </div>

  <!-- 已选择的 CPU 详情 -->
  <div v-if="selectedCpu">
    <h3>{{ selectedCpu.cpu_short_name }}</h3>
    <p>完整名称: {{ selectedCpu.full_name }}</p>
    <p>插槽: {{ selectedCpu.socket }}</p>
    <p>内存类型: {{ selectedCpu.memory_type }}</p>
    <!-- ... 更多详细字段 -->
  </div>
</template>
```

---

## 📈 性能对比

假设一个 CPU 完整数据约 2KB，搜索返回 20 条结果：

| 方案 | 搜索数据量 | 详情数据量 | 总传输量 |
|------|-----------|-----------|---------|
| 方案 A | 40KB (20×2KB) | 0KB | **40KB** |
| 方案 B | 8KB (20×0.4KB) | 2KB (1×2KB) | **10KB** |

**节省 75% 带宽！**

---

## 🎯 适用场景

### ✅ 应该使用两阶段加载：

1. **列表 + 详情** 结构
   - 商品列表 → 商品详情
   - 用户列表 → 用户档案
   - 文章列表 → 文章正文

2. **搜索 + 选择** 场景
   - 地址搜索 → 完整地址
   - 药品搜索 → 药品说明书
   - 硬件搜索 → 规格参数

3. **详情数据复杂**
   - 包含大量文本
   - 包含关联数据
   - 包含计算字段

### ❌ 不需要两阶段加载：

1. 数据量很小（<100 字节）
2. 列表和详情字段几乎一致
3. 用户总是需要查看所有数据

---

## 🔧 进阶优化

### 1. 添加缓存

```typescript
const cpuCache = new Map<number, any>()

const getCpuDetailWithCache = async (cpuId: number) => {
  // 先查缓存
  if (cpuCache.has(cpuId)) {
    return cpuCache.get(cpuId)
  }

  // 缓存未命中，调用 API
  const detail = await getCpuDetail(cpuId)
  cpuCache.set(cpuId, detail)
  return detail
}
```

### 2. 预加载

```typescript
// 鼠标悬停时预加载
const handleCpuHover = async (cpu: any) => {
  if (!cpuCache.has(cpu.id)) {
    getCpuDetail(cpu.id).then(detail => {
      cpuCache.set(cpu.id, detail)
    })
  }
}
```

### 3. 防抖优化

```typescript
// 避免快速点击多次调用 API
const selectCpu = debounce(async (cpu: any) => {
  // ... 加载逻辑
}, 300)
```

---

## 📝 总结

### 核心原则

1. **按需加载**: 只加载当前需要的数据
2. **渐进增强**: 先显示基础信息，再加载完整数据
3. **用户体验**: 添加 loading 状态，避免页面卡顿

### 代码清单

```
✅ 搜索接口只返回必要字段 (id + 展示字段)
✅ 选择后调用 getCpuDetail(id) 获取完整数据
✅ 添加 loading 状态反馈
✅ 错误处理和提示
✅ 可选：添加缓存和预加载
```

这种设计模式不仅适用于 CPU 选择，也适用于所有类似的**搜索-选择-详情**场景，是 Vue3 企业级应用的标准实践。

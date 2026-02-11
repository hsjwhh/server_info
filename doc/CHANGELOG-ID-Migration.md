# 修改说明 - 使用 ID 而非 cpu_short_name

## 📝 修改原因

使用数据库 ID 作为主键比使用 `cpu_short_name` 更可靠,原因如下:

1. **避免名称相似混乱**: 型号名称可能只差一个字符 (如 "E5-2680 v3" vs "E5-2680 v4")
2. **性能更优**: 数字 ID 索引查询比字符串更快
3. **更符合 RESTful 规范**: `/api/cpu/123` 比 `/api/cpu/Intel%20Xeon%20E5-2680%20v4` 更简洁
4. **避免 URL 编码问题**: 不需要处理空格、特殊字符等

## 🔄 主要修改内容

### 1. API 接口变更

#### 修改前:
```javascript
// CPU 详情查询
GET /api/hardware/cpu/Intel%20Xeon%20E5-2680%20v4

// 兼容主板查询
GET /api/hardware/motherboard/compatible?cpu=Intel Xeon E5-2680 v4
```

#### 修改后:
```javascript
// CPU 详情查询 - 使用 ID
GET /api/hardware/cpu/123

// 兼容主板查询 - 使用 cpu_id 参数
GET /api/hardware/motherboard/compatible?cpu_id=123
```

### 2. 前端 API 封装 (configPlan.js)

#### 修改前:
```javascript
export function getCpuDetail(cpuShortName) {
  return request.get(`/hardware/cpu/${encodeURIComponent(cpuShortName)}`)
}

export function getCompatibleMotherboards(cpuShortName) {
  return request.get('/hardware/motherboard/compatible', {
    params: { cpu: cpuShortName }
  })
}
```

#### 修改后:
```javascript
export function getCpuDetail(cpuId) {
  return request.get(`/hardware/cpu/${cpuId}`)
}

export function getCompatibleMotherboards(cpuId) {
  return request.get('/hardware/motherboard/compatible', {
    params: { cpu_id: cpuId }
  })
}
```

### 3. Vue 组件修改 (ConfigPlanPage.vue)

#### 修改 1: CPU 搜索结果 - 使用 ID 作为 key

```vue
<!-- 修改前 -->
<div v-for="cpu in cpuSuggestions" :key="cpu.cpu_short_name">

<!-- 修改后 -->
<div v-for="cpu in cpuSuggestions" :key="cpu.id">
```

#### 修改 2: 加载兼容主板 - 使用 CPU ID

```javascript
// 修改前
const boards = await getCompatibleMotherboards(selectedCpu.value.cpu_short_name)

// 修改后
const boards = await getCompatibleMotherboards(selectedCpu.value.id)
```

#### 修改 3: 导出配置 - 保存 CPU ID 和名称

```javascript
// 修改前
const config = {
  cpu: selectedCpu.value?.cpu_short_name,
  cpuCount: cpuCount.value,
  // ...
}

// 修改后
const config = {
  cpu: {
    id: selectedCpu.value?.id,      // 👈 保存 ID
    name: selectedCpu.value?.cpu_short_name,  // 👈 保存名称
    count: cpuCount.value
  },
  // ...
}
```

### 4. 后端 API 修改

#### CPU 搜索接口 - 返回 ID

```javascript
// 修改后的 SQL
const query = `
  SELECT 
    id,                    -- 👈 必须包含 ID
    cpu_short_name,
    cores,
    threads,
    // ...
  FROM cpu_info           -- 👈 表名改为 cpu_info
  WHERE cpu_short_name LIKE ?
`
```

#### CPU 详情接口 - 使用 ID 查询

```javascript
// 修改前
router.get('/cpu/:cpuShortName', async (req, res) => {
  const { cpuShortName } = req.params
  // ... WHERE cpu_short_name = ?
})

// 修改后
router.get('/cpu/:cpuId', async (req, res) => {
  const { cpuId } = req.params
  // ... WHERE id = ?
})
```

#### 兼容主板接口 - 使用 cpu_id 参数

```javascript
// 修改前
const { cpu } = req.query  // cpu = "Intel Xeon E5-2680 v4"
// ... WHERE cpu_short_name = ?

// 修改后
const { cpu_id } = req.query  // cpu_id = 123
// ... WHERE id = ?
```

### 5. 数据库表名修改

```sql
-- 修改前
cpu_specs          → cpu_info
motherboard_specs  → motherboard_info

-- 主键都是 id (BIGINT AUTO_INCREMENT)
```

## 📊 数据格式示例

### CPU 搜索返回格式:

```json
{
  "success": true,
  "data": [
    {
      "id": 123,                           // 👈 数据库主键
      "cpu_short_name": "Intel Xeon E5-2680 v4",
      "cores": 14,
      "threads": 28,
      "tdp": 120,
      // ...
    }
  ]
}
```

### 主板兼容查询返回格式:

```json
{
  "success": true,
  "data": [
    {
      "id": 456,                           // 👈 主板 ID
      "model": "Supermicro X10DRi",
      "chipset": "Intel C612",
      // ...
    }
  ]
}
```

### 配置方案保存格式:

```json
{
  "cpu": {
    "id": 123,                             // 👈 保存 CPU ID
    "name": "Intel Xeon E5-2680 v4",       // 👈 保存名称用于显示
    "count": 2
  },
  "motherboard": "Supermicro X10DRi",
  // ...
}
```

## ✅ 修改清单

- [x] `configPlan.js` - API 封装改用 ID
- [x] `ConfigPlanPage.vue` - 组件逻辑改用 ID
- [x] `backend-hardware-api.js` - 后端接口改用 ID
- [x] `hardwareData-mock.js` - Mock 数据添加 ID 字段
- [x] 表名修改: `cpu_specs` → `cpu_info`, `motherboard_specs` → `motherboard_info`

## 🔍 向后兼容性

如果需要同时支持旧的 `cpu_short_name` 方式,可以保留两个接口:

```javascript
// 新接口 (推荐)
GET /api/hardware/cpu/123

// 旧接口 (兼容)
GET /api/hardware/cpu/by-name/Intel%20Xeon%20E5-2680%20v4
```

## 🚀 升级步骤

1. **更新数据库**: 确保 `cpu_info` 和 `motherboard_info` 表有 `id` 字段
2. **更新后端**: 部署新的 API 代码
3. **更新前端**: 部署新的前端代码
4. **测试**: 验证 CPU 搜索、主板兼容查询功能正常

## 📌 注意事项

- CPU ID 必须是数据库的**自增主键**
- 搜索接口返回时**必须包含 id 字段**
- 前端选择 CPU 后,保存的是 `cpu.id` 而不是 `cpu.cpu_short_name`
- 导出配置时,同时保存 `id` 和 `name`,方便后续查询和显示

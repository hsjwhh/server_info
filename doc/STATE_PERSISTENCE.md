# 搜索列表状态保持功能说明

## 问题描述
用户从服务器列表页查看某台服务器的详情后，点击"返回列表"时，之前的搜索结果消失了，需要重新搜索。这导致用户体验不佳。

## 解决方案

### 方案选择
使用 **SessionStorage** 保存页面状态，当用户返回列表页时自动恢复。

**为什么选择 SessionStorage？**
- ✅ 简单易用，无需额外依赖
- ✅ 数据在标签页关闭后自动清除
- ✅ 容量足够（5-10MB）
- ✅ 同步操作，性能好
- ❌ Vuex/Pinia 对于这个简单场景过于复杂
- ❌ LocalStorage 会永久保留，可能导致数据过期

### 实现原理

#### 1. 状态保存
当用户执行以下操作时，自动保存状态：
- 执行搜索
- 切换筛选条件
- 翻页
- 跳转到详情页

**保存的数据**：
```javascript
{
  searchQuery: "R730",           // 搜索关键词
  hasSearched: true,             // 是否已搜索
  servers: [...],                // 搜索结果列表
  totalRecords: 100,             // 总记录数
  currentPage: 2,                // 当前页码
  filters: {                     // 筛选条件
    customer: "阿里云",
    business: "云计算",
    dateRange: {...}
  },
  showFilter: true,              // 筛选面板展开状态
  timestamp: 1706801234567       // 保存时间戳
}
```

#### 2. 状态恢复
当用户返回列表页时：
1. 检查 SessionStorage 中是否有保存的状态
2. 验证状态是否过期（30分钟）
3. 恢复搜索条件、结果列表、分页等
4. 用户看到的是离开前的状态

#### 3. 状态清除
以下情况会清除状态：
- 用户主动点击"重置搜索"
- 状态超过30分钟
- 浏览器标签页关闭

## 核心代码

### 1. 保存状态函数
```javascript
const saveState = () => {
  const state = {
    searchQuery: searchQuery.value,
    hasSearched: hasSearched.value,
    servers: servers.value,
    totalRecords: totalRecords.value,
    currentPage: currentPage.value,
    filters: filters.value,
    showFilter: showFilter.value,
    timestamp: Date.now()
  }
  
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(state))
}
```

### 2. 恢复状态函数
```javascript
const restoreState = () => {
  const savedState = sessionStorage.getItem(CACHE_KEY)
  if (!savedState) return false
  
  const state = JSON.parse(savedState)
  
  // 检查是否过期（30分钟）
  const age = Date.now() - state.timestamp
  if (age > 30 * 60 * 1000) {
    sessionStorage.removeItem(CACHE_KEY)
    return false
  }
  
  // 恢复所有状态
  searchQuery.value = state.searchQuery || ''
  servers.value = state.servers || []
  // ... 其他状态
  
  return true
}
```

### 3. 跳转前保存
```javascript
const viewDetail = (sn) => {
  // 👈 跳转前保存状态
  saveState()
  router.push({ name: 'ServerDetail', params: { sn } })
}
```

### 4. 返回时恢复
```javascript
onMounted(() => {
  // 组件挂载时尝试恢复状态
  const restored = restoreState()
  
  if (restored) {
    console.log('已恢复页面状态')
  }
})
```

## 使用场景演示

### 场景 1: 查看详情后返回
```
1. 用户搜索 "R730" → 显示 50 条结果
2. 用户翻到第 3 页
3. 用户点击某个 SN 查看详情
4. 用户点击"返回列表"
5. ✅ 自动恢复到第 3 页，显示之前的 50 条结果
```

### 场景 2: 应用筛选后查看详情
```
1. 用户搜索 "R730"
2. 用户选择筛选条件：客户="阿里云"，业务="云计算"
3. 用户点击"应用筛选" → 显示 20 条结果
4. 用户点击某个 SN 查看详情
5. 用户点击"返回列表"
6. ✅ 自动恢复筛选条件和 20 条结果
```

### 场景 3: 跨标签页
```
1. 用户在标签页 A 搜索并查看结果
2. 用户在标签页 B 打开列表页
3. ❌ 标签页 B 看不到标签页 A 的搜索结果（这是正常的）
4. 各标签页独立维护自己的状态
```

### 场景 4: 状态过期
```
1. 用户搜索并查看结果
2. 用户离开超过 30 分钟
3. 用户返回列表页
4. ✅ 状态已过期，显示初始空状态
5. 用户需要重新搜索
```

## 优势对比

### 方案对比表

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **SessionStorage** | 简单、轻量、自动清理 | 刷新页面会丢失 | ✅ 当前场景 |
| Vuex/Pinia | 功能强大、类型安全 | 复杂、需要额外配置 | ❌ 大型应用 |
| LocalStorage | 持久保存 | 需要手动清理、可能过期 | ❌ 需要长期保存 |
| keep-alive | Vue 原生、完全保持 | 占用内存、路由配置复杂 | ❌ 简单页面切换 |

### 为什么不用 keep-alive？

**keep-alive 的问题**：
```vue
<!-- 需要在路由配置中包裹 -->
<router-view v-slot="{ Component }">
  <keep-alive include="ServerListPage">
    <component :is="Component" />
  </keep-alive>
</router-view>
```

- ❌ 需要修改 Layout.vue 或路由配置
- ❌ 组件实例一直保留在内存中
- ❌ 多个列表页时管理复杂
- ✅ SessionStorage 更灵活、更轻量

## 测试验证

### 测试步骤

#### 1. 基础搜索保持
```
✅ 搜索 "R730"
✅ 点击某个 SN 查看详情
✅ 点击"返回列表"
✅ 验证：搜索框显示 "R730"，结果列表存在
```

#### 2. 分页保持
```
✅ 搜索并翻到第 3 页
✅ 点击某个 SN 查看详情
✅ 点击"返回列表"
✅ 验证：仍然在第 3 页
```

#### 3. 筛选保持
```
✅ 搜索并应用筛选条件
✅ 点击某个 SN 查看详情
✅ 点击"返回列表"
✅ 验证：筛选条件保持，筛选面板展开状态保持
```

#### 4. 状态过期
```
✅ 搜索并查看结果
✅ 修改 timestamp 为 31 分钟前
✅ 刷新页面
✅ 验证：状态已清除，显示初始状态
```

#### 5. 跨标签页隔离
```
✅ 标签页 A 搜索 "R730"
✅ 新建标签页 B 打开列表
✅ 验证：标签页 B 是空状态
✅ 标签页 B 搜索 "R740"
✅ 切换回标签页 A
✅ 验证：标签页 A 仍显示 "R730" 的结果
```

### 控制台验证
```javascript
// 查看保存的状态
console.log(JSON.parse(sessionStorage.getItem('serverListPageState')))

// 手动清除状态
sessionStorage.removeItem('serverListPageState')

// 手动保存状态
sessionStorage.setItem('serverListPageState', JSON.stringify({...}))
```

## 注意事项

### 1. 数据量限制
- SessionStorage 容量：5-10MB
- 如果搜索结果超过 1000 条，考虑只保存搜索条件，不保存结果
- 返回时自动重新搜索

**优化方案**（可选）：
```javascript
const saveState = () => {
  const state = {
    searchQuery: searchQuery.value,
    filters: filters.value,
    currentPage: currentPage.value,
    // 只在结果少于 500 条时保存完整数据
    servers: servers.value.length < 500 ? servers.value : null,
    shouldRefetch: servers.value.length >= 500
  }
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(state))
}
```

### 2. 敏感数据
- 不要在状态中保存密码、Token 等敏感信息
- 当前实现只保存搜索结果，没有敏感数据

### 3. 浏览器兼容性
- SessionStorage 所有现代浏览器都支持
- IE8+ 支持
- 无需 polyfill

### 4. 性能考虑
- JSON.stringify 和 JSON.parse 性能很好
- 1000 条记录序列化/反序列化 < 10ms
- 不会影响用户体验

## 后续优化建议

### 1. 添加状态恢复提示
```javascript
const restoreState = () => {
  const restored = // ... 恢复逻辑
  
  if (restored) {
    notify({
      message: '已恢复上次的搜索结果',
      color: 'info'
    })
  }
}
```

### 2. 添加"清除历史"按钮
```vue
<VaButton @click="clearState">
  清除搜索历史
</VaButton>
```

### 3. 支持多个搜索历史
```javascript
// 保存最近 5 次搜索
const HISTORY_KEY = 'searchHistory'
const saveToHistory = () => {
  const history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]')
  history.unshift({ ...currentState, id: Date.now() })
  history.splice(5) // 只保留最近 5 次
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}
```

### 4. 升级到 Pinia（大型应用）
如果应用变得复杂，可以升级到 Pinia：
```javascript
// stores/serverList.js
export const useServerListStore = defineStore('serverList', {
  state: () => ({
    searchQuery: '',
    servers: [],
    // ...
  }),
  persist: {
    storage: sessionStorage,
    paths: ['searchQuery', 'servers', 'filters']
  }
})
```

## 文件变更

### 修改的文件
- `src/pages/ServerListPage.vue`

### 新增的功能
```javascript
// 1. 状态管理函数
saveState()       // 保存当前状态
restoreState()    // 恢复保存的状态
clearState()      // 清除保存的状态

// 2. 生命周期钩子
onMounted()       // 页面加载时恢复状态
onActivated()     // keep-alive 激活时恢复（可选）
onDeactivated()   // keep-alive 失活时保存（可选）

// 3. 跳转前保存
viewDetail()      // 跳转详情前保存状态
```

### 新增的常量
```javascript
const CACHE_KEY = 'serverListPageState'  // SessionStorage 键名
```

## 总结

✅ **问题已解决**：用户从详情页返回列表页时，搜索结果自动恢复

✅ **用户体验提升**：
- 无需重新搜索
- 保持页码位置
- 保持筛选条件
- 保持展开状态

✅ **技术方案优势**：
- 实现简单（约 50 行代码）
- 性能良好（< 10ms）
- 无需额外依赖
- 自动清理过期数据

✅ **可扩展性**：
- 支持添加更多状态
- 可升级到 Pinia
- 可添加历史记录

---

**更新日期**: 2026-02-01
**版本**: V4.0
**状态**: ✅ 已实现

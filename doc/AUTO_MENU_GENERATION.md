# 菜单自动生成说明 🎯

## ✅ 现在的实现

菜单现在完全从路由配置自动生成，不需要手动维护菜单列表。

### 📋 工作原理

#### 1️⃣ 路由配置中添加 `showInMenu` 标记

```typescript
// src/router/index.ts
{
  path: 'machines',
  name: 'Machines',
  component: () => import('../pages/machines/MachinesListPage.vue'),
  meta: {
    title: '服务器列表',      // 👈 菜单显示的文字
    icon: 'server',          // 👈 菜单图标
    showInMenu: true,        // 👈 是否显示在菜单中
    breadcrumbs: [...]
  }
}
```

#### 2️⃣ Sidebar 自动读取路由配置

```typescript
// src/layouts/Sidebar.vue
const menuItems = computed<MenuItem[]>(() => {
  // 获取根路由的子路由
  const rootRoute = router.getRoutes().find(r => r.path === '/')
  if (!rootRoute || !rootRoute.children) {
    return []
  }

  // 过滤出需要显示在菜单中的路由
  return rootRoute.children
    .filter(route => route.meta?.showInMenu)  // 👈 只显示标记为 showInMenu 的
    .map(route => ({
      name: route.name as string,
      label: route.meta?.title || route.name as string,
      icon: route.meta?.icon || 'home',
      to: route.path === '' ? '/' : `/${route.path}`,
    }))
})
```

---

## 🎯 当前菜单配置

| 路由 | 菜单标题 | 图标 | 是否显示 |
|------|---------|------|---------|
| `/` | Dashboard | view-dashboard | ✅ 是 |
| `/machines` | 服务器列表 | server | ✅ 是 |
| `/machines/:sn` | 服务器详情 | server | ❌ 否（详情页不显示在菜单） |
| `/settings` | 设置 | cog | ✅ 是 |

---

## 📝 如何添加新菜单项

### 只需要在路由配置中添加路由！

```typescript
// src/router/index.ts
{
  path: '/',
  component: AppLayout,
  children: [
    // ... 已有的路由
    {
      path: 'users',           // 👈 新路由
      name: 'Users',
      component: () => import('../pages/UsersPage.vue'),
      meta: {
        title: '用户管理',     // 👈 菜单显示的文字
        icon: 'account-group', // 👈 菜单图标（需要先在 main.ts 注册）
        showInMenu: true,      // 👈 显示在菜单中
        breadcrumbs: [
          { label: '首页', to: '/' },
          { label: '用户管理' }
        ]
      }
    }
  ]
}
```

**菜单会自动更新！** 不需要修改 Sidebar.vue

---

## 🔧 菜单显示控制

### 显示在菜单中
```typescript
meta: {
  showInMenu: true  // ✅ 显示
}
```

### 不显示在菜单中
```typescript
meta: {
  showInMenu: false  // ❌ 不显示（如详情页、编辑页等）
}

// 或者不设置（默认为 false）
meta: {
  title: '详情页',
  icon: 'eye'
  // 没有 showInMenu，默认不显示
}
```

---

## 🎨 菜单项的属性来源

```typescript
{
  name: route.name,              // 路由的 name
  label: route.meta?.title,      // 来自 meta.title
  icon: route.meta?.icon,        // 来自 meta.icon
  to: route.path                 // 路由路径
}
```

---

## 📊 菜单顺序

菜单项的顺序 = 路由配置的顺序

```typescript
children: [
  { path: '', ... },           // 第 1 个菜单项
  { path: 'machines', ... },   // 第 2 个菜单项
  { path: 'settings', ... }    // 第 3 个菜单项
]
```

如果需要调整菜单顺序，只需调整路由配置的顺序即可。

---

## 🌲 多级菜单示例

虽然目前是单级菜单，但如果未来需要多级菜单：

```typescript
{
  path: 'system',
  name: 'System',
  meta: {
    title: '系统管理',
    icon: 'cog',
    showInMenu: true
  },
  children: [
    {
      path: 'users',
      name: 'SystemUsers',
      component: () => import('../pages/system/UsersPage.vue'),
      meta: {
        title: '用户管理',
        icon: 'account',
        showInMenu: true
      }
    },
    {
      path: 'roles',
      name: 'SystemRoles',
      component: () => import('../pages/system/RolesPage.vue'),
      meta: {
        title: '角色管理',
        icon: 'shield',
        showInMenu: true
      }
    }
  ]
}
```

需要修改 Sidebar.vue 的逻辑来支持递归渲染子菜单。

---

## 🔍 菜单激活状态判断

```typescript
const isActive = (path: string): boolean => {
  if (path === '/') {
    // 首页：精确匹配
    return route.path === '/'
  }
  // 其他页面：前缀匹配
  return route.path.startsWith(path)
}
```

**示例：**
- 访问 `/machines` → 激活 "Machines" 菜单
- 访问 `/machines/SN123` → 仍然激活 "Machines" 菜单（前缀匹配）
- 访问 `/settings` → 激活 "Settings" 菜单

---

## 💡 类型安全

已更新 `types/index.ts`，添加了 RouteMeta 类型定义：

```typescript
export interface RouteMeta {
  title?: string
  icon?: string
  showInMenu?: boolean
  breadcrumbs?: BreadcrumbItem[]
}

// 扩展 vue-router 的类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    showInMenu?: boolean
    breadcrumbs?: BreadcrumbItem[]
  }
}
```

现在在路由配置中使用 `meta` 时，TypeScript 会有自动补全和类型检查！

---

## ✅ 优势总结

| 特性 | 手动维护 | 自动生成 ✅ |
|------|---------|------------|
| 代码维护 | 需要同步路由和菜单 | 只需维护路由 |
| 一致性 | 可能不一致 | 100% 一致 |
| 扩展性 | 每次都要改两处 | 只改路由即可 |
| 类型安全 | 容易出错 | TypeScript 检查 |
| 菜单顺序 | 手动调整 | 跟随路由顺序 |

---

## 🎯 完整示例

### 添加一个新的"监控"页面

**1. 在 main.ts 中添加图标（如果需要新图标）：**
```typescript
import { mdiMonitorDashboard } from '@mdi/js'

icons: [
  // ... 已有的图标
  {
    name: 'monitor-dashboard',
    to: mdiMonitorDashboard,
  }
]
```

**2. 在 router/index.ts 中添加路由：**
```typescript
{
  path: 'monitor',
  name: 'Monitor',
  component: () => import('../pages/MonitorPage.vue'),
  meta: {
    title: '监控',
    icon: 'monitor-dashboard',
    showInMenu: true,  // 👈 自动显示在菜单中
    breadcrumbs: [
      { label: '首页', to: '/' },
      { label: '监控' }
    ]
  }
}
```

**3. 创建页面组件 `pages/MonitorPage.vue`**

**完成！** 菜单会自动出现 "监控" 选项。

---

## 🐛 调试技巧

如果菜单没有显示：

**1. 检查路由配置：**
```typescript
// 确保设置了 showInMenu: true
meta: {
  showInMenu: true
}
```

**2. 检查路由是否在正确的位置：**
```typescript
// ✅ 正确：在根路由的 children 中
{
  path: '/',
  component: AppLayout,
  children: [
    { path: 'new-page', meta: { showInMenu: true } }
  ]
}

// ❌ 错误：不在根路由的 children 中
{
  path: '/new-page',  // 平级路由，不会显示在菜单
  meta: { showInMenu: true }
}
```

**3. 在浏览器控制台检查：**
```javascript
// 打开控制台，输入：
router.getRoutes()
// 查看所有路由配置
```

---

现在你的菜单完全由路由驱动，实现了真正的自动化！🎉

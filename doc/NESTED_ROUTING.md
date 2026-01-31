# 嵌套路由重构说明 🎯

## 📋 为什么使用嵌套路由？

### ❌ 之前的方式（平铺路由）
```typescript
const routes = [
  {
    path: '/',
    component: () => import('./pages/DashboardPage.vue'),
  },
  {
    path: '/machines',
    component: () => import('./pages/MachinesListPage.vue'),
  },
  // ...
]

// App.vue
<AppLayout>
  <router-view />
</AppLayout>
```

**问题：**
- AppLayout 不是路由的一部分，手动包裹
- 无法灵活控制布局（比如未来可能需要不带 Layout 的页面）
- 路由结构不清晰

---

### ✅ 现在的方式（嵌套路由）
```typescript
const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', component: DashboardPage },
      { path: 'machines', component: MachinesListPage },
      { path: 'machines/:sn', component: ServerDetailPage },
    ]
  }
]

// App.vue
<router-view />  // 简洁！

// AppLayout.vue
<Sidebar />
<Header />
<router-view />  // 渲染子路由
```

**优势：**
- ✅ 路由结构清晰，层级分明
- ✅ AppLayout 作为路由组件，受路由系统管理
- ✅ 未来可以轻松添加不同布局（如登录页、全屏页面）
- ✅ 符合 Vue Router 最佳实践
- ✅ 更容易实现路由守卫、过渡动画等

---

## 🏗️ 新的路由结构

```
/                           → AppLayout
├─ ''                       → DashboardPage
├─ machines                 → MachinesListPage
├─ machines/:sn             → ServerDetailPage
└─ settings                 → SettingsPage
```

### 渲染流程：

```
1. 访问 /machines
   ↓
2. 匹配到父路由 '/'，渲染 AppLayout
   ↓
3. AppLayout 中的 <router-view /> 渲染子路由
   ↓
4. 匹配到 'machines'，渲染 MachinesListPage
```

---

## 📁 更新的文件

### 1. `src/router/index.ts`

**核心变化：**
```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,  // 👈 父路由使用 AppLayout
    children: [            // 👈 子路由
      {
        path: '',          // 👈 空路径匹配 '/'
        name: 'Dashboard',
        component: () => import('../pages/DashboardPage.vue'),
      },
      {
        path: 'machines',  // 👈 匹配 '/machines'
        name: 'Machines',
        component: () => import('../pages/machines/MachinesListPage.vue'),
      },
      // ...
    ]
  }
]
```

**重要：**
- 父路由直接 `component: AppLayout`（不是懒加载）
- 子路由使用懒加载 `() => import(...)`
- 首页使用空路径 `path: ''`

---

### 2. `src/App.vue`

**变得非常简洁：**
```vue
<template>
  <router-view />
</template>

<script setup lang="ts">
// 不需要导入 AppLayout
// 不需要手动包裹
</script>
```

---

### 3. `src/layouts/AppLayout.vue`

**关键变化：**
```vue
<template>
  <div class="app-layout">
    <Sidebar />
    <Header />
    <PageHeader />
    <main class="content">
      <!-- 👇 渲染子路由（页面组件） -->
      <router-view />
    </main>
  </div>
</template>
```

**之前：**
```vue
<slot />  <!-- 通过插槽传递内容 -->
```

**现在：**
```vue
<router-view />  <!-- 通过路由渲染子组件 -->
```

---

## 🎯 实际效果

### 访问 `/`
```
App.vue
└── AppLayout (父路由)
    └── DashboardPage (子路由)
```

### 访问 `/machines`
```
App.vue
└── AppLayout (父路由)
    └── MachinesListPage (子路由)
```

### 访问 `/machines/SN123456789`
```
App.vue
└── AppLayout (父路由)
    └── ServerDetailPage (子路由)
```

---

## 🚀 未来扩展性

### 添加无布局的页面（如登录页）

```typescript
const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      // ... 已有的路由
    ]
  },
  {
    // 👇 不使用 AppLayout 的路由
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
  }
]
```

### 添加不同布局

```typescript
const routes = [
  {
    path: '/',
    component: AppLayout,  // 主布局
    children: [...]
  },
  {
    path: '/admin',
    component: AdminLayout,  // 管理员布局
    children: [...]
  },
  {
    path: '/auth',
    component: AuthLayout,  // 认证布局
    children: [...]
  }
]
```

---

## 🔍 路由路径说明

### 子路由路径拼接规则：

| 父路径 | 子路径 | 最终路径 |
|--------|--------|----------|
| `/` | `` (空) | `/` |
| `/` | `machines` | `/machines` |
| `/` | `machines/:sn` | `/machines/:sn` |
| `/` | `settings` | `/settings` |

**注意：**
- 子路径 **不要** 以 `/` 开头
- 空路径 `''` 表示父路径本身

---

## 📝 路由守卫示例

有了嵌套路由，可以轻松对整个布局添加守卫：

```typescript
const routes = [
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },  // 👈 所有子路由都需要认证
    children: [
      { path: '', component: DashboardPage },
      { path: 'machines', component: MachinesListPage },
    ]
  },
  {
    path: '/login',
    component: LoginPage,
    meta: { requiresAuth: false }
  }
]

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

---

## ✅ 迁移检查清单

- [x] 更新 `router/index.ts` - 使用嵌套路由结构
- [x] 更新 `App.vue` - 只保留 `<router-view />`
- [x] 更新 `AppLayout.vue` - 使用 `<router-view />` 替代 `<slot />`
- [ ] 测试所有路由正常工作
- [ ] 测试浏览器前进/后退按钮
- [ ] 测试直接访问 URL（如 `/machines/SN123456789`）

---

## 🎨 对比总结

| 特性 | 平铺路由 | 嵌套路由 ✅ |
|------|---------|------------|
| 代码组织 | 分散 | 清晰 |
| 布局管理 | 手动 | 自动 |
| 路由守卫 | 每个路由独立配置 | 可在父路由统一配置 |
| 未来扩展 | 困难 | 简单 |
| 最佳实践 | ❌ | ✅ |

---

## 💡 最佳实践

1. **父路由直接导入**（不懒加载）
   ```typescript
   import AppLayout from '../layouts/AppLayout.vue'
   
   {
     path: '/',
     component: AppLayout,  // 直接使用
   }
   ```

2. **子路由使用懒加载**
   ```typescript
   {
     path: 'machines',
     component: () => import('../pages/MachinesListPage.vue'),
   }
   ```

3. **首页使用空路径**
   ```typescript
   {
     path: '',  // 不是 '/' 而是 ''
     component: DashboardPage,
   }
   ```

---

现在你的路由结构更加符合 Vue Router 的最佳实践！🎉

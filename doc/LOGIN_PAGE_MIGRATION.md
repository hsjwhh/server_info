# 登录页面迁移说明 🔐

## ✅ 已完成的工作

已将 Element Plus 登录页面完整迁移到 Vuestic UI，包括：

1. ✅ 登录页面组件（`LoginPage.vue`）
2. ✅ Axios 请求工具（`request.ts`）
3. ✅ 路由配置（添加登录路由和守卫）
4. ✅ 图标配置（添加 account 和 lock 图标）
5. ✅ 依赖更新（添加 axios）

---

## 📁 新增文件

```
src/
├── pages/
│   └── auth/
│       └── LoginPage.vue       # 登录页面
└── utils/
    └── request.ts              # Axios 请求工具
```

---

## 🔄 组件对照表

| Element Plus | Vuestic UI | 说明 |
|--------------|------------|------|
| `<el-card>` | `<VaCard>` + `<VaCardContent>` | 卡片容器 |
| `<el-divider>` | `<VaDivider>` | 分割线 |
| `<el-form>` | `<VaForm>` | 表单容器 |
| `<el-form-item>` | 直接使用 `<VaInput>` 的 `label` 属性 | 表单项 |
| `<el-input>` | `<VaInput>` | 输入框 |
| `<el-button>` | `<VaButton>` | 按钮 |
| `ElMessage.warning()` | `useToast().init()` | 消息提示 |
| `prefix-icon="User"` | `<template #prependInner><VaIcon name="account" /></template>` | 图标位置 |

---

## 🎨 主要变化

### 1️⃣ **卡片组件**

**之前（Element Plus）：**
```vue
<el-card class="login-card" shadow="always">
  <!-- 内容 -->
</el-card>
```

**现在（Vuestic UI）：**
```vue
<VaCard class="login-card">
  <VaCardContent>
    <!-- 内容 -->
  </VaCardContent>
</VaCard>
```

---

### 2️⃣ **输入框**

**之前（Element Plus）：**
```vue
<el-form-item label="用户名">
  <el-input
    v-model="form.username"
    placeholder="请输入用户名"
    prefix-icon="User"
    clearable
  />
</el-form-item>
```

**现在（Vuestic UI）：**
```vue
<VaInput
  v-model="form.username"
  label="用户名"
  placeholder="请输入用户名"
  clearable
>
  <template #prependInner>
    <VaIcon name="account" color="secondary" />
  </template>
</VaInput>
```

**关键差异：**
- Vuestic 的 `label` 直接在 `VaInput` 上，不需要 `el-form-item`
- 图标使用插槽 `#prependInner` 而不是 `prefix-icon` 属性

---

### 3️⃣ **消息提示**

**之前（Element Plus）：**
```javascript
import { ElMessage } from 'element-plus'

ElMessage.warning('请输入用户名和密码')
```

**现在（Vuestic UI）：**
```javascript
import { useToast } from 'vuestic-ui'

const { init: notify } = useToast()

notify({
  message: '请输入用户名和密码',
  color: 'warning'
})
```

---

### 4️⃣ **按钮**

**之前（Element Plus）：**
```vue
<el-button
  type="primary"
  :loading="loading"
  @click="handleLogin"
  block
>
  登录
</el-button>
```

**现在（Vuestic UI）：**
```vue
<VaButton
  :loading="loading"
  @click="handleLogin"
  block
>
  登录
</VaButton>
```

**注意：** Vuestic 的 `VaButton` 默认就是 primary 样式，不需要 `type="primary"`

---

## 🛠️ 使用步骤

### 1️⃣ 安装依赖

```bash
pnpm install
```

这会安装新增的 `axios` 依赖。

---

### 2️⃣ 配置环境变量（可选）

创建 `.env` 文件：

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:3000/api
```

或者直接在 `request.ts` 中修改 `baseURL`。

---

### 3️⃣ 启动开发服务器

```bash
pnpm dev
```

---

### 4️⃣ 访问登录页

浏览器访问：`http://localhost:5173/login`

---

## 🔐 路由守卫逻辑

已添加全局路由守卫，实现自动登录检查：

```typescript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth && !token) {
    // 需要登录但未登录 → 跳转登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录访问登录页 → 跳转首页
    next('/')
  } else {
    next()
  }
})
```

**工作流程：**

1. **未登录访问首页** → 自动跳转到 `/login`
2. **登录成功** → 跳转到 `/`
3. **已登录访问登录页** → 自动跳转到 `/`
4. **Token 失效（401）** → 清除 token，跳转到 `/login`

---

## 📋 路由配置

```typescript
const routes = [
  // 登录页（不需要认证）
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/LoginPage.vue'),
    meta: {
      requiresAuth: false  // 不需要登录
    }
  },
  // 主应用（需要认证）
  {
    path: '/',
    component: AppLayout,
    meta: {
      requiresAuth: true  // 需要登录
    },
    children: [
      // Dashboard、Machines、Settings...
    ]
  }
]
```

---

## 🌐 Axios 请求工具

`src/utils/request.ts` 提供了以下功能：

### 功能特性

1. **自动添加 Token**
   - 从 localStorage 读取 `accessToken`
   - 自动添加到请求头 `Authorization: Bearer xxx`

2. **自动处理 401**
   - Token 失效时自动清除
   - 跳转到登录页

3. **统一错误处理**
   - 提取错误信息
   - 返回 Promise.reject

### 使用示例

```typescript
import request from '@/utils/request'

// GET 请求
const data = await request.get('/api/users')

// POST 请求
const result = await request.post('/auth/login', {
  username: 'admin',
  password: '123456'
})

// PUT 请求
await request.put('/api/users/1', { name: 'New Name' })

// DELETE 请求
await request.delete('/api/users/1')
```

---

## 🎨 样式特点

### 背景效果
- 使用渐变背景：`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- 添加旋转光晕效果
- 半透明背景模糊效果（`backdrop-filter: blur(10px)`）

### 卡片样式
- 圆角阴影卡片
- 半透明白色背景
- 响应式设计（移动端自适应）

### Logo
- 渐变背景
- 大号字体
- 圆角设计

---

## 📱 响应式设计

### 桌面端（> 640px）
- 登录卡片最大宽度 420px
- Logo 56x56px
- 标题 24px

### 移动端（≤ 640px）
- 登录卡片占满宽度
- Logo 48x48px
- 标题 20px

---

## 🔧 Mock 登录测试

如果后端 API 还未准备好，可以修改 `handleLogin` 方法模拟登录：

```typescript
const handleLogin = async () => {
  if (!form.username || !form.password) {
    notify({
      message: '请输入用户名和密码',
      color: 'warning'
    })
    return
  }

  loading.value = true

  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 模拟登录成功
  const mockToken = 'mock-access-token-' + Date.now()
  localStorage.setItem('accessToken', mockToken)
  localStorage.setItem('refreshToken', 'mock-refresh-token')

  notify({
    message: '登录成功',
    color: 'success'
  })

  router.push('/')

  loading.value = false
}
```

---

## 🚀 进一步优化建议

### 1. **添加表单验证**

```typescript
import { ref } from 'vue'
import { useForm } from 'vuestic-ui'

const { validate, isValid } = useForm('loginForm')

const rules = {
  username: [
    { required: true, message: '请输入用户名' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { minLength: 6, message: '密码至少6位' }
  ]
}

const handleLogin = async () => {
  if (!validate()) {
    return
  }
  // 登录逻辑...
}
```

### 2. **添加记住密码功能**

```vue
<VaCheckbox v-model="rememberMe">
  记住密码
</VaCheckbox>
```

### 3. **添加验证码**

```vue
<VaInput
  v-model="form.captcha"
  label="验证码"
  placeholder="请输入验证码"
>
  <template #append>
    <img :src="captchaUrl" @click="refreshCaptcha" />
  </template>
</VaInput>
```

### 4. **添加第三方登录**

```vue
<div class="social-login">
  <VaButton preset="outline" icon="google">
    Google 登录
  </VaButton>
  <VaButton preset="outline" icon="github">
    GitHub 登录
  </VaButton>
</div>
```

---

## ✅ 检查清单

迁移完成后，请确认：

- [ ] 安装了 axios 依赖（`pnpm install`）
- [ ] 登录页面样式正常显示
- [ ] 图标（account、lock）正常显示
- [ ] 输入框可以正常输入
- [ ] 点击登录按钮有 loading 状态
- [ ] 未登录访问首页会自动跳转到登录页
- [ ] 登录成功后跳转到首页
- [ ] 已登录访问登录页会跳转到首页

---

## 🎉 完成

现在你有一个完整的、符合 Vuestic UI 风格的登录页面了！

所有的 Element Plus 组件都已经成功迁移到 Vuestic UI，样式和功能保持一致。

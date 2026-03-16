// src/router/index.js
/**
 *
 * Vue Router 配置：
 *   - 定义前端路由
 *   - 全局路由守卫（未登录自动跳转登录页）
 *   - 登录后访问 /login 自动跳转首页
 *
 * 安全说明：
 *   - accessToken 存于 authStore 内存（不读 localStorage）
 *   - 页面刷新时 authStore 为空 → 自动调用 silentRefresh() 换取新 token
 *   - silentRefresh() 通过 HttpOnly Cookie 中的 refreshToken 完成，对用户透明
 *
 * 路由守卫策略：
 *   - 白名单模式：所有页面默认需要登录，仅 meta.public: true 的页面例外
 *   - meta.allowDirectAccess: false 可禁止用户直接访问某页面（跳回 Dashboard）
 *   - 无需在每条路由上标记 requiresAuth，降低漏配风险
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// 定义路由表
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { public: true } // 标记为公开页面，不需要 token
  },

  {
    path: '/',
    component: () => import('../layouts/Layout.vue'), // 登录后的主布局
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../pages/DashboardPage.vue'),
        meta: {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard',
          showInMenu: true,
          breadcrumbs: [
            { label: '首页', to: '/' }
          ]
        },
      },
      {
        path: 'servers',
        name: 'ServerList',
        component: () => import('../pages/server/ServerListPage.vue'),
        meta: {
          title: '服务器列表',
          icon: 'mdi-server-network',
          showInMenu: true,
          breadcrumbs: [
            { label: '首页', to: '/' },
            { label: '服务器列表', to: '/servers' }
          ]
        }
      },
      {
        path: 'servers/:sn',
        name: 'ServerDetail',
        component: () => import('../pages/server/ServerDetailPage.vue'),
        meta: {
          title: '服务器详情',
          icon: 'mdi-server',
          showInMenu: false,
          breadcrumbs: [
            { label: '首页', to: '/' },
            { label: '服务器列表', to: '/servers' },
            { label: '服务器详情' }
          ]
        }
      },
      {
        path: 'config-plan',
        name: 'ConfigPlan',
        component: () => import('../pages/ConfigPlanPage.vue'),
        meta: {
          title: '配置方案',
          icon: 'mdi-clipboard-text-outline',
          showInMenu: false,
          allowDirectAccess: false,
          breadcrumbs: [
            { label: '首页', to: '/' },
            { label: '配置方案', to: '/config-plan' }
          ]
        }
      },
      {
        path: 'server/entry',
        name: 'ServerEntry',
        component: () => import('../pages/server/ServerEntryPage.vue'),
        meta: { 
          title: '服务器录入', 
          icon: 'mdi-database-plus', 
          showInMenu: false,
          allowDirectAccess: false,
          breadcrumbs: [
            { label: '首页', to: '/' },
            { label: '服务器录入', to: '/server/entry' }
          ]
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../pages/SettingsPage.vue'),
        meta: {
          title: '个人设置',
          icon: 'mdi-account-cog',
          showInMenu: false,
          breadcrumbs: [
            { label: '首页', to: '/' },
            { label: '个人设置', to: '/settings' }
          ]
        }
      },
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * ============================================================
 * 全局路由守卫
 * ============================================================
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 1. 公开页面处理（包含已登录跳离 /login）
  if (to.meta.public) {
    if (authStore.isLoggedIn && to.path === '/login') {
      return next('/')
    }
    return next()
  }

  // 2. 身份验证 (Authentication)
  // 白名单策略：所有非 public 页面默认要求登录，无需逐一标记 requiresAuth
  let isAuth = authStore.isLoggedIn
  if (!isAuth) {
    isAuth = await authStore.silentRefresh()
  }
  if (!isAuth) {
    return next('/login')
  }

  // 3. 访问限制 (Authorization)
  // 走到这里说明用户一定已登录，再判断页面级别的特定限制
  if (to.meta.allowDirectAccess === false) {
    return next({ name: 'Dashboard' })
  }

  // 4. 所有检查通过，正常放行
  next()
})

export default router

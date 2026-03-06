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
          ],
          requiresAuth: true
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
          ],
          requiresAuth: true
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
          ],
          requiresAuth: true
        }
      },
      {
        path: 'config-plan',
        name: 'ConfigPlan',
        component: () => import('../pages/ConfigPlanPage.vue'),
        meta: {
          title: '配置方案',
          icon: 'mdi-clipboard-text-outline',
          showInMenu: true,
          breadcrumbs: [
            { label: '首页', to: '/' },
            { label: '配置方案', to: '/config-plan' }
          ],
          requiresAuth: true
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
          ],
          requiresAuth: true
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
 *
 * 逻辑：
 *   1. accessToken 存在 → 正常放行
 *   2. accessToken 不存在 → 尝试 silentRefresh()（利用 HttpOnly Cookie）
 *   3. silentRefresh 成功 → 放行
 *   4. silentRefresh 失败 → 跳转登录页
 *   5. 已登录却访问 /login → 自动跳首页
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 访问公开页面直接放行
  if (to.meta.public) {
    // 但如果已登录访问 /login，跳回首页
    if (authStore.isLoggedIn) {
      return next('/')
    }
    return next()
  }

  // 需要登录的页面
  if (to.meta.requiresAuth) {
    // 内存中有 token，直接放行
    if (authStore.isLoggedIn) {
      return next()
    }

    // 内存中无 token（页面刷新导致）→ 尝试静默刷新
    const refreshed = await authStore.silentRefresh()
    if (refreshed) {
      return next()
    }

    // 刷新也失败 → 跳转登录页
    return next('/login')
  }

  next()
})

export default router

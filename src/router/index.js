// src/router/index.js
/**
 *
 * Vue Router 配置：
 *   - 定义前端路由
 *   - 全局路由守卫（未登录自动跳转登录页）
 *   - 登录后访问 /login 自动跳转首页
 *
 * 说明：
 *   - accessToken 存在 localStorage 中
 *   - 后端所有受保护接口都需要 token
 */

import { createRouter, createWebHistory } from 'vue-router'

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
          showInMenu: true,  // 👈 显示在菜单中
          breadcrumbs: [
            { label: '首页', to: '/' }
          ],
          requiresAuth: true // 需要登录
        },
      },
      {
        path: 'servers',
        name: 'ServerList',
        component: () => import('../pages/server/ServerListPage.vue'),
        meta: {
          title: '服务器列表',
          icon: 'mdi-server-network',
          showInMenu: true,  // 👈 显示在菜单中
          breadcrumbs: [
            { label: '首页', to: '/' },
            { label: '服务器列表', to: '/servers' }
          ],
          requiresAuth: true // 需要登录
        }
      },
      {
        path: 'servers/:sn',
        name: 'ServerDetail',
        component: () => import('../pages/server/ServerDetailPage.vue'),
        meta: {
          title: '服务器详情',
          icon: 'mdi-server',
          showInMenu: false,  // 👈 不显示在菜单中
          breadcrumbs: [
            { label: '首页', to: '/' },
            { label: '服务器列表', to: '/servers' },
            { label: '服务器详情' }
          ],
          requiresAuth: true // 需要登录
        }
      },
      {
        path: 'config-plan',
        name: 'ConfigPlan',
        component: () => import('../pages/ConfigPlanPage.vue'),
        meta: {
          title: '配置方案',
          icon: 'mdi-clipboard-text-outline',
          showInMenu: true,  // 👈 显示在菜单中
          breadcrumbs: [
            { label: '首页', to: '/' },
            { label: '配置方案', to: '/config-plan' }
          ],
          requiresAuth: true // 需要登录
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../pages/SettingsPage.vue'),
        meta: {
          title: '个人设置',
          icon: 'mdi-account-cog',
          showInMenu: false, // 仅通过 Header 入口访问
          breadcrumbs: [
            { label: '首页', to: '/' },
            { label: '个人设置', to: '/settings' }
          ],
          requiresAuth: true // 需要登录
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
 *   1. 如果访问需要登录的页面，但没有 token → 跳转登录页
 *   2. 如果已登录却访问 /login → 自动跳转首页
 */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')

  // 访问登录页，但已经登录 → 自动跳首页
  if (to.path === '/login' && token) {
    return next('/')
  }

  // 访问需要登录的页面，但没有 token → 跳转登录页
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  // 其它情况正常放行
  next()
})

export default router

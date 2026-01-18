/**
 * router/index.js
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

// 页面组件
import Home from '@/views/Home.vue'
import SnQuery from '@/views/SnQuery.vue'
import Login from '@/views/Login.vue'
import Layout from '@/layouts/Layout.vue'

// 定义路由表
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true } // 标记为公开页面，不需要 token
  },

  {
    path: '/',
    component: Layout, // 登录后的主布局
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true } // 需要登录
      },
      {
        path: 'sn',
        name: 'SnQuery',
        component: SnQuery,
        meta: { requiresAuth: true } // 需要登录
      }
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

// src/utils/request.js
/**
 * axios 二次封装（安全版）
 *
 * 功能：
 * 1. 统一 baseURL
 * 2. 自动附带 accessToken（从 authStore 内存读取，不读 localStorage）
 * 3. 自动刷新 token（401 时利用 HttpOnly Cookie 中的 refreshToken）
 * 4. 刷新成功后自动重试原请求
 * 5. 刷新失败自动跳转登录页
 * 6. 统一错误提示（Vuestic UI Toast）
 * 7. 返回 response.data，调用方更简洁
 */

import axios from 'axios'
import { useToast } from 'vuestic-ui'
import { useAuthStore } from '../stores/auth'
import router from '../router'
import { API_BASE_URL } from '../config/env'

// 创建 toast 实例
let toastInstance = null
const getToast = () => {
  if (!toastInstance) {
    const { init } = useToast()
    toastInstance = init
  }
  return toastInstance
}

// 创建 axios 实例
const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  withCredentials: true    // 允许携带 Cookie（refreshToken 由后端通过 HttpOnly Cookie 管理）
})

/**
 * ============================================================
 * 1. 请求拦截器：从内存（authStore）读取 accessToken
 * ============================================================
 */
service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

/**
 * ============================================================
 * 2. 响应拦截器：自动刷新 token（401 时）
 * ============================================================
 */
service.interceptors.response.use(
  (response) => {
    return response.data
  },

  async (error) => {
    const originalRequest = error.config

    const status = error.response?.status
    const url = originalRequest?.url || ''
    const isLoginAPI = url.includes('/auth/login')

    // ============================
    // 1. 登录接口的 401（用户名/密码错误）
    // ============================
    if (isLoginAPI && status === 401) {
      const msg = error.response?.data?.message || '登录失败'
      const notify = getToast()
      notify({ message: msg, color: 'danger' })
      return Promise.reject(error)
    }

    // ============================
    // 2. 其它接口的 401 → 静默刷新 token
    // 浏览器会自动携带 HttpOnly Cookie 中的 refreshToken，无需手动读取
    // ============================
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const authStore = useAuthStore()

      // 调用 authStore 的静默刷新（内部用 withCredentials 携带 Cookie）
      const refreshed = await authStore.silentRefresh()

      if (refreshed) {
        // 刷新成功 → 用新 token 重试原请求
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
        return service(originalRequest)
      } else {
        // 刷新失败 → 跳转登录页
        const notify = getToast()
        notify({ message: '登录已过期，请重新登录', color: 'danger' })
        if (router.currentRoute.value.path !== '/login') {
          router.replace('/login')
        }
        return Promise.reject(error)
      }
    }

    // ============================
    // 3. 其它错误
    // ============================
    const msg = error.response?.data?.message || error.message || '请求失败'
    const notify = getToast()
    notify({ message: msg, color: 'danger' })
    return Promise.reject(error)
  }
)

export default service

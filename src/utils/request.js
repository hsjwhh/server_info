// src/utils/request.js
/**
 * axios 二次封装（最终整合版）
 *
 * 功能：
 * 1. 统一 baseURL
 * 2. 自动附带 accessToken
 * 3. 自动刷新 token（401 时）
 * 4. 刷新成功后自动重试原请求
 * 5. 刷新失败自动跳转登录页
 * 6. 统一错误提示（Vuestic UI Toast）
 * 7. 返回 response.data，调用方更简洁
 */

import axios from 'axios'
import { useToast } from 'vuestic-ui'

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
  baseURL: 'http://localhost:3000/api', // 后端 API 根路径
  timeout: 5000, // 超时时间
})

/**
 * ============================================================
 * 1. 请求拦截器：自动附带 accessToken
 * ============================================================
 */
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')

    if (token) {
      // 在请求头中加入 Authorization: Bearer xxx
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
    // 直接返回 response.data
    return response.data
  },

  async (error) => {
    const originalRequest = error.config

    const status = error.response?.status
    const url = originalRequest?.url || ''
    const isLoginAPI = url.includes('/auth/login')

    // ============================
    // 1. 登录接口的 401（用户名不存在 / 密码错误）
    // ============================
    if (isLoginAPI && status === 401) {
      const msg = error.response?.data?.message || '登录失败'
      const notify = getToast()
      notify({
        message: msg,
        color: 'danger'
      })
      return Promise.reject(error)
    }    

    // ============================
    // 2. 其它接口的 401 → 刷新 token
    // ============================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        const notify = getToast()
        notify({
          message: '登录已过期，请重新登录',
          color: 'danger'
        })
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        /**
         * 调用刷新 token API
         * 注意：这里不能用 service（否则会再次进入拦截器）
         * 必须用 axios 原生实例
         */
        const res = await axios.post('http://192.168.1.6:3001/api/auth/refresh', {
          refreshToken
        })

        const newAccessToken = res.data.accessToken

        // 保存新的 accessToken
        localStorage.setItem('accessToken', newAccessToken)

        // 更新原请求的 Authorization
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        // 使用新的 token 重试原请求
        return service(originalRequest)

      } catch (refreshError) {
        // 刷新失败 → 清除 token → 跳转登录页
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        const notify = getToast()
        notify({
          message: '登录已过期，请重新登录',
          color: 'danger'
        })
        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    // ============================
    // 3. 其它错误
    // ============================
    const msg = error.response?.data?.message || error.message || '请求失败'
    const notify = getToast()
    notify({
      message: msg,
      color: 'danger'
    })
    return Promise.reject(error)
  }
)

export default service

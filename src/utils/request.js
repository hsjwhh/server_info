/**
 * axios 二次封装
 * 目的：
 * 1. 统一 baseURL
 * 2. 统一超时配置
 * 3. 请求拦截器（可加 token）
 * 4. 响应拦截器（统一处理后端返回格式）
 * 5. 统一错误处理
 */

import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service = axios.create({
  baseURL: 'http://localhost:3000/api', // ✅ 后端 API 根路径
  timeout: 5000, // ✅ 超时时间
})

// =============================
// ✅ 请求拦截器
// =============================
service.interceptors.request.use(
  (config) => {
    // 这里可以统一加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// =============================
// ✅ 响应拦截器
// =============================
service.interceptors.response.use(
  (response) => {
    // 后端返回的数据结构一般是：
    // { code: 200, data: xxx, message: 'OK' }

    return response.data // ✅ 直接返回 data，调用方更简洁
  },
  (error) => {
    // 统一错误提示
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default service

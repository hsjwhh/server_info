// src/composables/usePermission.js
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

export function usePermission() {
  const authStore = useAuthStore()
  // 使用 storeToRefs 确保从 store 解构出的属性保持响应性
  const { isAdmin } = storeToRefs(authStore)
  
  return {
    isAdmin
  }
}

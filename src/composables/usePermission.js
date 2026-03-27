// src/composables/usePermission.js
import { useAuthStore } from '../stores/auth'

export function usePermission() {
  const authStore = useAuthStore()
  return {
    isAdmin: authStore.isAdmin
  }
}

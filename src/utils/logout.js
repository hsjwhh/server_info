// src/utils/logout.js
import { useAuthStore } from '../stores/auth'
import { useServerListStore } from '../stores/useServerListStore'
import router from '../router'

/**
 * 统一维护需要清理的 SessionStorage 键名
 */
const SESSION_KEYS = ['serverListPageState']

/**
 * 全量登出清理编排
 * 
 * 职责：
 * 1. 清除 Auth 状态 (Token, User)
 * 2. 清除各业务 Store 状态 (实现跨用户数据隔离)
 * 3. 清除持久化缓存 (SessionStorage)
 * 4. 可选：发出 UI 提示并执行路由跳转
 * 
 * @param {Object} options 
 * @param {Function} options.notify - Vuestic notify 函数
 * @param {string} options.message - 提示信息
 */
export function performLogout(options = { notify: null, message: '' }) {
    // 1. 清除 Auth 状态
    const authStore = useAuthStore()
    authStore.clearToken()

    // 2. 清除业务 Store 状态
    // (新增业务 store 后需在此处追加重置调用)
    const serverListStore = useServerListStore()
    serverListStore.resetSearchState()

    // 3. 清除 SessionStorage 缓存
    SESSION_KEYS.forEach(key => sessionStorage.removeItem(key))

    // 4. 执行提示
    if (options.notify && options.message) {
        options.notify({
            message: options.message,
            color: 'danger',
            duration: 5000
        })
    }

    // 5. 跳转至登录页
    if (router.currentRoute.value.path !== '/login') {
        router.replace('/login')
    }
}

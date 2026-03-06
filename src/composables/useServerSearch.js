import { useServerListStore } from '../store/useServerListStore'
import { searchSn } from '../api/sn'
import { useToast } from 'vuestic-ui'
import { getCurrentInstance } from 'vue'

/**
 * 封装与服务器列表搜索相关的 API 逻辑
 * 与 Pinia Store 联动，专门处理副作用 (Side Effects)
 */
export function useServerSearch() {
    const store = useServerListStore()

    // 安全地获取 useToast：只有在 setup() 同步上下文中才能调用 useToast()。
    // 通过 getCurrentInstance() 检测当前是否存在 Vue 实例，
    // 若不存在（如异步回调、非组件上下文）则降级为 console.warn，避免运行时报错。
    const instance = getCurrentInstance()
    const notify = instance
        ? useToast().init
        : (opts) => console.warn('[useServerSearch] 通知（无组件实例）:', opts?.message)

    const CACHE_KEY = 'serverListPageState'
    const CACHE_TTL_MS = 30 * 60 * 1000

    /**
     * 执行搜索
     */
    const executeSearch = async () => {
        if (!store.searchQuery || store.searchQuery.trim().length === 0) {
            notify({
                message: '请输入搜索关键词',
                color: 'warning'
            })
            return
        }

        store.searching = true
        store.loading = true
        store.hasSearched = true
        store.currentPage = 1 // 搜索后重置页码

        try {
            const results = await searchSn(store.searchQuery.trim(), {})

            store.servers = results || []
            store.totalRecords = results?.length || 0
            store.updateTimestamp()

            saveStateToSession()

            if (store.servers.length === 0) {
                notify({ message: '未找到匹配的服务器', color: 'info' })
            } else {
                notify({ message: `找到 ${store.servers.length} 台服务器`, color: 'success' })
            }
        } catch (error) {
            console.error('搜索失败:', error)
            store.servers = []
            store.totalRecords = 0
        } finally {
            store.searching = false
            store.loading = false
        }
    }


    /**
     * 重置所有状态和搜索
     */
    const clearAllAndReset = () => {
        store.resetSearchState()
        clearSessionState()
    }

    // === Session Storage Cache 逻辑 ===
    // 缓存结构（schema）：
    // {
    //   searchQuery: string,
    //   hasSearched: boolean,
    //   servers: Array,
    //   totalRecords: number,
    //   currentPage: number,
    //   timestamp: number // Date.now() 毫秒时间戳
    // }
    const saveStateToSession = () => {
        const state = {
            searchQuery: store.searchQuery,
            hasSearched: store.hasSearched,
            servers: store.servers,
            totalRecords: store.totalRecords,
            currentPage: store.currentPage,
            timestamp: store.lastUpdateTimestamp
        }
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(state))
        } catch (error) {
            console.error('保存状态失败:', error)
        }
    }

    const restoreStateFromSession = () => {
        try {
            const savedState = sessionStorage.getItem(CACHE_KEY)
            if (!savedState) return false

            const state = JSON.parse(savedState)

            // 检查状态是否过期（30 分钟）
            const age = Date.now() - state.timestamp
            if (age > CACHE_TTL_MS) {
                sessionStorage.removeItem(CACHE_KEY)
                return false
            }

            store.searchQuery = state.searchQuery || ''
            store.hasSearched = state.hasSearched || false
            store.servers = state.servers || []
            store.totalRecords = state.totalRecords || 0
            store.currentPage = state.currentPage || 1
            store.lastUpdateTimestamp = state.timestamp

            return true
        } catch (error) {
            console.error('恢复状态失败:', error)
            return false
        }
    }

    const clearSessionState = () => {
        try {
            sessionStorage.removeItem(CACHE_KEY)
        } catch (error) {
            console.error('清除状态失败:', error)
        }
    }

    return {
        executeSearch,
        clearAllAndReset,
        // Session handlers
        saveStateToSession,
        restoreStateFromSession,
        clearSessionState
    }
}

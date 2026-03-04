import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useServerListStore = defineStore('serverList', () => {
    // === State ===
    // 搜索相关
    const searchQuery = ref('')
    const searching = ref(false)
    const hasSearched = ref(false)

    // 数据相关
    const servers = ref([])
    const totalRecords = ref(0)
    const loading = ref(false)

    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    const sortBy = ref('sn')
    const sortingOrder = ref('asc')

    // 分页相关
    const lastUpdateTimestamp = ref(Date.now())

    // === Getters ===
    const totalPages = computed(() => {
        return Math.ceil(servers.value.length / pageSize.value)
    })

    const paginatedServers = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value
        const end = start + pageSize.value
        return servers.value.slice(start, end)
    })

    const paginationStart = computed(() => {
        return servers.value.length > 0 ? (currentPage.value - 1) * pageSize.value + 1 : 0
    })

    const paginationEnd = computed(() => {
        return Math.min(currentPage.value * pageSize.value, servers.value.length)
    })

    // === Actions ===
    const resetSearchState = () => {
        searchQuery.value = ''
        servers.value = []
        hasSearched.value = false
        currentPage.value = 1
    }

    const updateTimestamp = () => {
        lastUpdateTimestamp.value = Date.now()
    }

    return {
        // state
        searchQuery,
        searching,
        hasSearched,
        servers,
        totalRecords,
        loading,
        currentPage,
        pageSize,
        sortBy,
        sortingOrder,
        lastUpdateTimestamp,
        // getters
        totalPages,
        paginatedServers,
        paginationStart,
        paginationEnd,
        // actions
        resetSearchState,
        updateTimestamp
    }
})

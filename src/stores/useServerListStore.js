import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

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

    // 筛选相关
    const selectedBusiness = ref('--- ALL ---')

    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    const sortBy = ref('sn')
    const sortingOrder = ref('asc')

    // 分页相关
    const lastUpdateTimestamp = ref(Date.now())

    // === Getters ===
    // 从当前搜索结果中提取唯一的业务名称（去重）
    const businessOptions = computed(() => {
        if (!servers.value.length) return ['--- ALL ---']
        const owners = servers.value.map(s => s.owner).filter(Boolean)
        const unique = Array.from(new Set(owners)).sort()
        return ['--- ALL ---', ...unique]
    })

    // 基于选中的业务对原始搜索结果进行过滤
    const filteredServers = computed(() => {
        if (selectedBusiness.value === '--- ALL ---') return servers.value
        return servers.value.filter(s => s.owner === selectedBusiness.value)
    })

    // 基于排序状态对过滤后的结果进行全量排序
    const sortedServers = computed(() => {
        const data = [...filteredServers.value]
        if (!sortBy.value || !sortingOrder.value) return data

        return data.sort((a, b) => {
            const key = sortBy.value
            let valA = a[key]
            let valB = b[key]

            // 特殊处理日期排序：数据中没有 date 字段，需由 y, m, d 拼成数字比较
            if (key === 'date') {
                valA = (a.y ?? 0) * 10000 + (a.m ?? 0) * 100 + (a.d ?? 0)
                valB = (b.y ?? 0) * 10000 + (b.m ?? 0) * 100 + (b.d ?? 0)
            }

            // 处理 null 或 undefined
            if (valA == null) return 1
            if (valB == null) return -1

            const result = valA > valB ? 1 : valA < valB ? -1 : 0
            return sortingOrder.value === 'asc' ? result : -result
        })
    })

    // 下拉框变化时自动重置页码
    watch(selectedBusiness, () => {
        currentPage.value = 1
    })

    const totalPages = computed(() => {
        return Math.ceil(sortedServers.value.length / pageSize.value)
    })

    const paginatedServers = computed(() => {
        // 输入源改为排序后的全量数据
        const start = (currentPage.value - 1) * pageSize.value
        const end = start + pageSize.value
        return sortedServers.value.slice(start, end)
    })

    const paginationStart = computed(() => {
        return sortedServers.value.length > 0 ? (currentPage.value - 1) * pageSize.value + 1 : 0
    })

    const paginationEnd = computed(() => {
        return Math.min(currentPage.value * pageSize.value, sortedServers.value.length)
    })

    // === Actions ===
    const resetSearchState = () => {
        searchQuery.value = ''
        searching.value = false
        hasSearched.value = false
        servers.value = []
        totalRecords.value = 0
        loading.value = false
        selectedBusiness.value = '--- ALL ---'
        currentPage.value = 1
        sortBy.value = 'sn'
        sortingOrder.value = 'asc'
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
        selectedBusiness,
        currentPage,
        pageSize,
        sortBy,
        sortingOrder,
        lastUpdateTimestamp,
        // getters
        businessOptions,
        filteredServers,
        sortedServers,
        totalPages,
        paginatedServers,
        paginationStart,
        paginationEnd,
        // actions
        resetSearchState,
        updateTimestamp
    }
})

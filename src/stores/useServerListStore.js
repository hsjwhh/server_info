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

    // 下拉框变化时自动重置页码
    watch(selectedBusiness, () => {
        currentPage.value = 1
    })

    const totalPages = computed(() => {
        return Math.ceil(filteredServers.value.length / pageSize.value)
    })

    const paginatedServers = computed(() => {
        // 前置约定：servers 已经是“最终展示顺序”。
        // 当前排序由 VaDataTable 的交互与上游数据流协同完成，这里仅负责按页切片。
        const start = (currentPage.value - 1) * pageSize.value
        const end = start + pageSize.value
        return filteredServers.value.slice(start, end)
    })

    const paginationStart = computed(() => {
        return filteredServers.value.length > 0 ? (currentPage.value - 1) * pageSize.value + 1 : 0
    })

    const paginationEnd = computed(() => {
        return Math.min(currentPage.value * pageSize.value, filteredServers.value.length)
    })

    // === Actions ===
    const resetSearchState = () => {
        searchQuery.value = ''
        servers.value = []
        hasSearched.value = false
        currentPage.value = 1
        selectedBusiness.value = '--- ALL ---'
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
        totalPages,
        paginatedServers,
        paginationStart,
        paginationEnd,
        // actions
        resetSearchState,
        updateTimestamp
    }
})

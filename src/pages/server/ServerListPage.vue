<!-- src/pages/ServerListPage.vue -->

<template>
  <div class="server-list-page">
    <div class="page-header">
      <h1 class="page-title">服务器列表</h1>
      <VaButton icon="mdi-plus" @click="handleAdd">
        添加服务器
      </VaButton>
    </div>


    <!-- 搜索和筛选卡片 -->
    <VaCard>
      <VaCardContent>
        <div class="toolbar">
          <!-- SN 搜索框 -->
          <div class="search-container">
            <VaInput v-model="searchQuery" placeholder="请输入 SN、主机名或 IP 进行搜索..." clearable class="search-input"
              @keyup.enter="handleSearch">
              <template #prepend>
                <VaIcon name="mdi-magnify" />
              </template>
            </VaInput>
            <VaButton @click="handleSearch" :loading="searching" :disabled="!searchQuery">
              搜索
            </VaButton>
          </div>

          <div class="toolbar-actions">
            <VaButtonGroup>
              <VaButton preset="secondary" icon="mdi-filter-variant" @click="toggleFilter">
                筛选
              </VaButton>
              <VaButton preset="secondary" icon="mdi-refresh" @click="handleRefresh" :loading="loading">
                刷新
              </VaButton>
            </VaButtonGroup>
          </div>
        </div>

        <!-- 筛选面板 -->
        <VaCollapse v-model="showFilter" class="mt-3">
          <div class="filter-panel">
            <VaSelect v-model="filters.customer" label="出机客户" placeholder="选择客户" :options="customerOptions" clearable
              class="filter-input" :loading="loadingCustomers" />

            <VaSelect v-model="filters.business" label="业务类型" placeholder="选择业务" :options="businessOptions" clearable
              class="filter-input" :loading="loadingBusinesses" />

            <VaDateInput v-model="filters.dateRange" label="日期范围" mode="range" clearable class="filter-input" />

            <div class="filter-actions">
              <VaButton preset="primary" size="small" @click="applyFilters">
                应用筛选
              </VaButton>
              <VaButton preset="secondary" size="small" @click="resetFilters">
                重置
              </VaButton>
            </div>
          </div>
        </VaCollapse>
      </VaCardContent>
    </VaCard>

    <!-- 服务器列表 -->
    <VaCard class="mt-4">
      <VaCardContent>
        <!-- 数据表格 -->
        <VaDataTable v-if="servers.length > 0" v-model:sort-by="sortBy" v-model:sorting-order="sortingOrder"
          :items="paginatedServers" :columns="columns" :loading="loading" hoverable clickable striped
          @row:click="handleRowClick">
          <template #cell(sn)="{ rowData }">
            <div class="sn-cell" @click.stop="viewDetail(rowData.SN)">
              <VaIcon name="mdi-server" size="small" color="primary" />
              <span class="sn-text">{{ rowData.SN }}</span>
            </div>
          </template>

          <template #cell(date)="{ rowData }">
            <span class="date-text">{{ formatDate(rowData) }}</span>
          </template>

          <template #cell(customer)="{ rowData }">
            <VaChip size="small" color="info" outline>
              {{ rowData.出机客户 }}
            </VaChip>
          </template>

          <template #cell(business)="{ rowData }">
            <VaChip size="small" color="success" outline>
              {{ rowData.业务 }}
            </VaChip>
          </template>

          <template #cell(hardware)="{ rowData }">
            <div class="hardware-summary">
              <VaChip v-if="rowData.CPU" size="small" class="mr-1">
                CPU: {{ rowData.CPU数量 || 1 }}
              </VaChip>
              <VaChip v-if="rowData.内存" size="small" class="mr-1">
                内存: {{ rowData.内存数量 || 1 }}
              </VaChip>
              <VaChip v-if="rowData.SSD" size="small">
                SSD: {{ rowData.SSD数量 || 1 }}
              </VaChip>
            </div>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="action-buttons">
              <VaButton preset="plain" icon="mdi-eye" size="small" @click.stop="viewDetail(rowData.SN)" />
              <VaButton preset="plain" icon="mdi-pencil" size="small" color="warning"
                @click.stop="handleEdit(rowData)" />
              <VaButton preset="plain" icon="mdi-delete" size="small" color="danger"
                @click.stop="handleDelete(rowData)" />
            </div>
          </template>
        </VaDataTable>

        <!-- 分页 -->
        <div v-if="servers.length > 0" class="pagination-container">
          <VaPagination v-model="currentPage" :pages="totalPages" :visible-pages="5" buttons-preset="secondary" />
          <div class="pagination-info">
            显示 {{ paginationStart }}-{{ paginationEnd }} / 共 {{ totalRecords }} 条
          </div>
        </div>

        <!-- 初始状态 - 未搜索 -->
        <div v-if="!hasSearched && servers.length === 0 && !loading" class="empty-state">
          <VaIcon name="mdi-magnify" size="96px" color="primary" />
          <p class="empty-title">请输入搜索条件</p>
          <p class="empty-text">在上方搜索框输入 SN、主机名或 IP，点击搜索按钮查询服务器</p>
        </div>

        <!-- 空状态 - 搜索无结果 -->
        <div v-if="hasSearched && servers.length === 0 && !loading" class="empty-state">
          <VaIcon name="mdi-server-off" size="96px" color="secondary" />
          <p class="empty-title">未找到匹配的服务器</p>
          <p class="empty-text">请尝试使用其他关键词或调整筛选条件</p>
          <VaButton @click="resetSearch" class="mt-3" preset="secondary">
            重置搜索
          </VaButton>
        </div>

        <!-- 加载状态 -->
        <VaInnerLoading :loading="loading && servers.length === 0" class="loading-container">
          <p class="loading-text">正在搜索服务器...</p>
        </VaInnerLoading>
      </VaCardContent>
    </VaCard>


  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchSn } from '../../api/sn'
import { getCustomerList, getBusinessList } from '../../api/filters'
import {
  VaCard,
  VaCardContent,
  VaInput,
  VaButton,
  VaButtonGroup,
  VaIcon,
  VaDataTable,
  VaChip,
  VaPagination,
  VaCollapse,
  VaSelect,
  VaDateInput,
  VaInnerLoading,
  useToast,
  useModal
} from 'vuestic-ui'

const router = useRouter()
const { init: notify } = useToast()
const { confirm } = useModal()

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
const sortBy = ref('SN')
const sortingOrder = ref('asc')

// 筛选相关
const showFilter = ref(false)
const customerOptions = ref([])
const businessOptions = ref([])
const loadingCustomers = ref(false)
const loadingBusinesses = ref(false)

const filters = ref({
  customer: null,
  business: null,
  dateRange: null
})

// 表格列定义
const columns = [
  { key: 'sn', label: 'SN', sortable: true },
  { key: 'date', label: '日期', sortable: true },
  { key: 'customer', label: '出机客户', sortable: true },
  { key: 'business', label: '业务', sortable: true },
  { key: 'hardware', label: '硬件摘要', sortable: false },
  { key: 'actions', label: '操作', width: 150 }
]

/**
 * 格式化日期
 */
const formatDate = (server) => {
  if (!server.年份) return '-'
  const y = server.年份
  const m = String(server.月份).padStart(2, '0')
  const d = String(server.日期).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 分页计算
 */
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

/**
 * 执行搜索
 */
const handleSearch = async () => {
  if (!searchQuery.value || searchQuery.value.trim().length === 0) {
    notify({
      message: '请输入搜索关键词',
      color: 'warning'
    })
    return
  }

  searching.value = true
  loading.value = true
  hasSearched.value = true
  currentPage.value = 1

  try {
    // 调用 searchSn API - 返回符合条件的 SN 列表
    const results = await searchSn(searchQuery.value.trim(), {
      customer: filters.value.customer,
      business: filters.value.business,
      dateRange: filters.value.dateRange
    })

    // 注意: searchSn API 需要返回完整的服务器对象数组，而不仅仅是 SN 字符串
    servers.value = results || []
    totalRecords.value = results?.length || 0

    if (servers.value.length === 0) {
      notify({
        message: '未找到匹配的服务器',
        color: 'info'
      })
    } else {
      notify({
        message: `找到 ${servers.value.length} 台服务器`,
        color: 'success'
      })
    }
  } catch (error) {
    console.error('搜索失败:', error)
    servers.value = []
    totalRecords.value = 0
    // 错误提示由 axios 拦截器处理
  } finally {
    searching.value = false
    loading.value = false
  }
}

/**
 * 刷新当前搜索结果
 */
const handleRefresh = () => {
  if (hasSearched.value && searchQuery.value) {
    handleSearch()
  } else {
    notify({
      message: '请先执行搜索',
      color: 'info'
    })
  }
}

/**
 * 重置搜索
 */
const resetSearch = () => {
  searchQuery.value = ''
  servers.value = []
  hasSearched.value = false
  currentPage.value = 1
  resetFilters()
}

/**
 * 切换筛选面板
 */
const toggleFilter = () => {
  showFilter.value = !showFilter.value

  // 第一次打开时加载筛选选项
  if (showFilter.value && customerOptions.value.length === 0) {
    loadFilterOptions()
  }
}

/**
 * 加载筛选选项数据
 */
const loadFilterOptions = async () => {
  // 加载客户列表
  loadingCustomers.value = true
  try {
    const customers = await getCustomerList()
    customerOptions.value = customers.map(item => ({
      text: item.name || item,
      value: item.value || item
    }))
  } catch (error) {
    console.error('加载客户列表失败:', error)
  } finally {
    loadingCustomers.value = false
  }

  // 加载业务列表
  loadingBusinesses.value = true
  try {
    const businesses = await getBusinessList()
    businessOptions.value = businesses.map(item => ({
      text: item.name || item,
      value: item.value || item
    }))
  } catch (error) {
    console.error('加载业务列表失败:', error)
  } finally {
    loadingBusinesses.value = false
  }
}

/**
 * 应用筛选
 */
const applyFilters = () => {
  if (!searchQuery.value) {
    notify({
      message: '请先输入搜索关键词',
      color: 'warning'
    })
    return
  }

  currentPage.value = 1
  handleSearch()

  notify({
    message: '筛选条件已应用',
    color: 'success'
  })
}

/**
 * 重置筛选
 */
const resetFilters = () => {
  filters.value = {
    customer: null,
    business: null,
    dateRange: null
  }

  if (hasSearched.value && searchQuery.value) {
    handleSearch()
  }

  notify({
    message: '筛选条件已重置',
    color: 'info'
  })
}

/**
 * 查看详情
 */
const viewDetail = (sn) => {
  router.push({ name: 'ServerDetail', params: { sn } })
}

/**
 * 行点击事件
 */
const handleRowClick = (event) => {
  viewDetail(event.item.SN)
}

/**
 * 添加服务器
 */
const handleAdd = () => {
  notify({
    message: '添加功能开发中',
    color: 'info'
  })
}

/**
 * 编辑服务器
 */
const handleEdit = (server) => {
  notify({
    message: `编辑服务器: ${server.SN}`,
    color: 'info'
  })
}

/**
 * 删除服务器
 */
const handleDelete = async (server) => {
  const agreed = await confirm({
    title: '确认删除',
    message: `确定要删除服务器 ${server.SN} 吗？此操作不可恢复。`,
    okText: '删除',
    cancelText: '取消',
    size: 'small'
  })

  if (agreed) {
    try {
      // TODO: 调用删除 API
      servers.value = servers.value.filter(s => s.SN !== server.SN)
      totalRecords.value = servers.value.length

      notify({
        message: `服务器 ${server.SN} 已删除`,
        color: 'success'
      })
    } catch (error) {
      console.error('删除失败:', error)
    }
  }
}

// 组件挂载时可以预加载筛选选项（可选）
onMounted(() => {
  // 如果需要在页面加载时就准备好筛选选项，取消下面的注释
  // loadFilterOptions()
})
</script>

<style scoped>
.server-list-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.toolbar {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.search-container {
  flex: 1;
  max-width: 600px;
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.search-input {
  flex: 1;
}

.toolbar-actions {
  flex-shrink: 0;
}

.filter-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: flex-end;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.filter-input {
  min-width: 0;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.sn-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.sn-text {
  font-weight: 600;
  color: var(--va-primary);
}

.sn-text:hover {
  text-decoration: underline;
}

.date-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.hardware-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
}

.empty-title {
  margin-top: 1rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.empty-text {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #6b7280;
  max-width: 500px;
}

.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
    flex-direction: column;
  }

  .filter-panel {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
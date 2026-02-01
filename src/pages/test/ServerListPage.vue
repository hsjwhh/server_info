<!-- src/pages/ServerListPage.vue -->
<template>
  <div class="server-list-page">
    <div class="page-header">
      <h1 class="page-title">服务器列表</h1>
      <VaButton
        icon="mdi-plus"
        @click="handleAdd"
      >
        添加服务器
      </VaButton>
    </div>

    <!-- 搜索和筛选卡片 -->
    <VaCard>
      <VaCardContent>
        <div class="toolbar">
          <!-- SN 自动补全搜索 -->
          <div class="search-container">
            <VaInput
              v-model="searchQuery"
              placeholder="搜索服务器 SN、主机名或 IP..."
              clearable
              class="search-input"
              @input="handleSearchInput"
            >
              <template #prepend>
                <VaIcon name="mdi-magnify" />
              </template>
            </VaInput>

            <!-- 自动补全建议列表 -->
            <div v-if="suggestions.length > 0 && showSuggestions" class="suggestions-dropdown">
              <VaList>
                <VaListItem
                  v-for="suggestion in suggestions"
                  :key="suggestion"
                  @click="selectSuggestion(suggestion)"
                  clickable
                >
                  <VaListItemSection icon>
                    <VaIcon name="mdi-server" size="small" />
                  </VaListItemSection>
                  <VaListItemSection>
                    <VaListItemLabel>{{ suggestion }}</VaListItemLabel>
                  </VaListItemSection>
                </VaListItem>
              </VaList>
            </div>
          </div>

          <div class="toolbar-actions">
            <VaButtonGroup>
              <VaButton
                preset="secondary"
                icon="mdi-filter-variant"
                @click="toggleFilter"
              >
                筛选
              </VaButton>
              <VaButton
                preset="secondary"
                icon="mdi-refresh"
                @click="loadServers"
                :loading="loading"
              >
                刷新
              </VaButton>
            </VaButtonGroup>
          </div>
        </div>

        <!-- 筛选面板 -->
        <VaCollapse v-model="showFilter" class="mt-3">
          <div class="filter-panel">
            <VaInput
              v-model="filters.customer"
              label="出机客户"
              placeholder="筛选客户"
              clearable
              class="filter-input"
            >
              <template #prepend>
                <VaIcon name="mdi-account" size="small" />
              </template>
            </VaInput>

            <VaInput
              v-model="filters.business"
              label="业务"
              placeholder="筛选业务"
              clearable
              class="filter-input"
            >
              <template #prepend>
                <VaIcon name="mdi-briefcase" size="small" />
              </template>
            </VaInput>

            <VaDateInput
              v-model="filters.dateRange"
              label="日期范围"
              mode="range"
              clearable
              class="filter-input"
            />

            <div class="filter-actions">
              <VaButton
                preset="primary"
                size="small"
                @click="applyFilters"
              >
                应用筛选
              </VaButton>
              <VaButton
                preset="secondary"
                size="small"
                @click="resetFilters"
              >
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
        <VaDataTable
          v-model:sort-by="sortBy"
          v-model:sorting-order="sortingOrder"
          :items="paginatedServers"
          :columns="columns"
          :loading="loading"
          hoverable
          clickable
          striped
          @row:click="handleRowClick"
        >
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
              <VaButton
                preset="plain"
                icon="mdi-eye"
                size="small"
                @click.stop="viewDetail(rowData.SN)"
              />
              <VaButton
                preset="plain"
                icon="mdi-pencil"
                size="small"
                color="warning"
                @click.stop="handleEdit(rowData)"
              />
              <VaButton
                preset="plain"
                icon="mdi-delete"
                size="small"
                color="danger"
                @click.stop="handleDelete(rowData)"
              />
            </div>
          </template>
        </VaDataTable>

        <!-- 分页 -->
        <div v-if="filteredServers.length > 0" class="pagination-container">
          <VaPagination
            v-model="currentPage"
            :pages="totalPages"
            :visible-pages="5"
            buttons-preset="secondary"
          />
          <div class="pagination-info">
            显示 {{ paginationStart }}-{{ paginationEnd }} / 共 {{ filteredServers.length }} 条
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && filteredServers.length === 0" class="empty-state">
          <VaIcon name="mdi-server-off" size="64px" color="secondary" />
          <p class="empty-text">{{ searchQuery ? '未找到匹配的服务器' : '暂无服务器数据' }}</p>
          <VaButton
            v-if="!searchQuery"
            @click="handleAdd"
            class="mt-3"
          >
            添加第一台服务器
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import debounce from 'lodash.debounce'
import { searchSn, getSnDetail } from '../../api/sn'
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
  VaList,
  VaListItem,
  VaListItemSection,
  VaListItemLabel,
  VaDateInput,
  useToast,
  useModal
} from 'vuestic-ui'

const router = useRouter()
const { init: notify } = useToast()
const { confirm } = useModal()

const searchQuery = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const showFilter = ref(false)
const suggestions = ref([])
const showSuggestions = ref(false)
const sortBy = ref('SN')
const sortingOrder = ref('asc')

const filters = ref({
  customer: '',
  business: '',
  dateRange: null
})

// 服务器数据列表
const servers = ref([])

const columns = [
  { key: 'sn', label: 'SN', sortable: true },
  { key: 'date', label: '日期', sortable: true },
  { key: 'customer', label: '出机客户', sortable: true },
  { key: 'business', label: '业务', sortable: true },
  { key: 'hardware', label: '硬件摘要', sortable: false },
  { key: 'actions', label: '操作', width: 150 }
]

// 格式化日期
const formatDate = (server) => {
  if (!server.年份) return '-'
  const y = server.年份
  const m = String(server.月份).padStart(2, '0')
  const d = String(server.日期).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 筛选后的服务器列表
const filteredServers = computed(() => {
  let result = servers.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(server =>
      server.SN?.toLowerCase().includes(query) ||
      server.出机客户?.toLowerCase().includes(query) ||
      server.业务?.toLowerCase().includes(query)
    )
  }

  // 客户过滤
  if (filters.value.customer) {
    result = result.filter(server => 
      server.出机客户?.toLowerCase().includes(filters.value.customer.toLowerCase())
    )
  }

  // 业务过滤
  if (filters.value.business) {
    result = result.filter(server => 
      server.业务?.toLowerCase().includes(filters.value.business.toLowerCase())
    )
  }

  // 日期范围过滤
  if (filters.value.dateRange && filters.value.dateRange.start && filters.value.dateRange.end) {
    result = result.filter(server => {
      const serverDate = new Date(server.年份, server.月份 - 1, server.日期)
      return serverDate >= filters.value.dateRange.start && serverDate <= filters.value.dateRange.end
    })
  }

  return result
})

// 分页计算
const totalPages = computed(() => {
  return Math.ceil(filteredServers.value.length / pageSize.value)
})

const paginatedServers = computed(() => {
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

/**
 * 自动补全搜索 - 从 SnQuery.vue 移植
 */
const fetchSuggestions = async (query) => {
  if (!query || query.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  try {
    const list = await searchSn(query)
    suggestions.value = list || []
    showSuggestions.value = true
  } catch (error) {
    console.error('搜索失败:', error)
    suggestions.value = []
    showSuggestions.value = false
  }
}

const debouncedFetchSuggestions = debounce(fetchSuggestions, 500)

/**
 * 处理搜索输入
 */
const handleSearchInput = (value) => {
  if (value) {
    debouncedFetchSuggestions(value)
  } else {
    suggestions.value = []
    showSuggestions.value = false
  }
}

/**
 * 选择建议项
 */
const selectSuggestion = async (suggestion) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  
  // 自动加载该 SN 的详细信息
  try {
    const detail = await getSnDetail(suggestion)
    if (detail) {
      // 检查是否已存在
      const exists = servers.value.some(s => s.SN === detail.SN)
      if (!exists) {
        servers.value.unshift(detail)
      }
      // 跳转到详情页
      viewDetail(detail.SN)
    }
  } catch (error) {
    console.error('加载详情失败:', error)
  }
}

/**
 * 加载服务器列表
 */
const loadServers = async () => {
  loading.value = true
  try {
    // TODO: 调用真实 API 加载服务器列表
    // 这里可以调用一个获取所有服务器的 API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    notify({
      message: '刷新成功',
      color: 'success'
    })
  } catch (error) {
    notify({
      message: '刷新失败',
      color: 'danger'
    })
  } finally {
    loading.value = false
  }
}

const toggleFilter = () => {
  showFilter.value = !showFilter.value
}

const applyFilters = () => {
  currentPage.value = 1
  notify({
    message: '筛选条件已应用',
    color: 'success'
  })
}

const resetFilters = () => {
  filters.value = {
    customer: '',
    business: '',
    dateRange: null
  }
  currentPage.value = 1
  notify({
    message: '筛选条件已重置',
    color: 'info'
  })
}

const handleRowClick = (event) => {
  viewDetail(event.item.SN)
}

const viewDetail = (sn) => {
  router.push({ name: 'ServerDetail', params: { sn } })
}

const handleAdd = () => {
  notify({
    message: '添加功能开发中',
    color: 'info'
  })
}

const handleEdit = (server) => {
  notify({
    message: `编辑服务器: ${server.SN}`,
    color: 'info'
  })
}

const handleDelete = async (server) => {
  const agreed = await confirm({
    title: '确认删除',
    message: `确定要删除服务器 ${server.SN} 吗？此操作不可恢复。`,
    okText: '删除',
    cancelText: '取消',
    size: 'small'
  })

  if (agreed) {
    // TODO: 调用删除 API
    servers.value = servers.value.filter(s => s.SN !== server.SN)
    notify({
      message: `服务器 ${server.SN} 已删除`,
      color: 'success'
    })
  }
}

// 点击外部关闭建议列表
watch(searchQuery, (newVal) => {
  if (!newVal) {
    showSuggestions.value = false
  }
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
  align-items: flex-start;
}

.search-container {
  flex: 1;
  max-width: 500px;
  position: relative;
}

.search-input {
  width: 100%;
}

.suggestions-dropdown {
  position: absolute;
  z-index: 100;
  margin-top: 0.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
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
  grid-column: span 2;
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

.empty-text {
  margin-top: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
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
  }

  .filter-panel {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    grid-column: span 1;
    flex-direction: column;
  }
}
</style>

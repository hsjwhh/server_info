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

    <VaCard>
      <VaCardContent>
        <div class="toolbar">
          <VaInput
            v-model="searchQuery"
            placeholder="搜索服务器 SN、主机名或 IP..."
            clearable
            class="search-input"
          >
            <template #prepend>
              <VaIcon name="mdi-magnify" />
            </template>
          </VaInput>

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
              >
                刷新
              </VaButton>
            </VaButtonGroup>
          </div>
        </div>

        <!-- 筛选面板 -->
        <VaCollapse v-model="showFilter" class="mt-3">
          <div class="filter-panel">
            <VaSelect
              v-model="filters.status"
              label="状态"
              placeholder="全部"
              :options="statusOptions"
              clearable
            />
            <VaSelect
              v-model="filters.idc"
              label="机房"
              placeholder="全部"
              :options="idcOptions"
              clearable
            />
            <VaButton
              preset="primary"
              size="small"
              @click="applyFilters"
            >
              应用
            </VaButton>
            <VaButton
              preset="secondary"
              size="small"
              @click="resetFilters"
            >
              重置
            </VaButton>
          </div>
        </VaCollapse>
      </VaCardContent>
    </VaCard>

    <!-- 服务器列表 -->
    <VaCard class="mt-4">
      <VaCardContent>
        <VaDataTable
          :items="filteredServers"
          :columns="columns"
          :loading="loading"
          hoverable
          clickable
          striped
          @row:click="handleRowClick"
        >
          <template #cell(sn)="{ rowData }">
            <div class="sn-cell">
              <VaIcon name="mdi-server" size="small" color="primary" />
              <span class="sn-text">{{ rowData.sn }}</span>
            </div>
          </template>

          <template #cell(status)="{ rowData }">
            <VaChip
              :color="rowData.status === 'online' ? 'success' : 'danger'"
              size="small"
            >
              <VaIcon
                :name="rowData.status === 'online' ? 'mdi-check-circle' : 'mdi-close-circle'"
                size="small"
              />
              {{ rowData.status === 'online' ? '在线' : '离线' }}
            </VaChip>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="action-buttons">
              <VaButton
                preset="plain"
                icon="mdi-eye"
                size="small"
                @click.stop="viewDetail(rowData.sn)"
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
            共 {{ filteredServers.length }} 条记录
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && filteredServers.length === 0" class="empty-state">
          <VaIcon name="mdi-server-off" size="64px" color="secondary" />
          <p class="empty-text">暂无服务器数据</p>
          <VaButton
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
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
  VaSelect,
  VaCollapse,
  useToast,
  useModal
} from 'vuestic-ui'

const router = useRouter()
const { init: notify } = useToast()
const { confirm } = useModal()

const searchQuery = ref('')
const loading = ref(false)
const currentPage = ref(1)
const showFilter = ref(false)

const filters = ref({
  status: null,
  idc: null
})

const statusOptions = [
  { text: '在线', value: 'online' },
  { text: '离线', value: 'offline' }
]

const idcOptions = [
  { text: 'LAX-DC-1', value: 'LAX-DC-1' },
  { text: 'LAX-DC-2', value: 'LAX-DC-2' },
  { text: 'NYC-DC-1', value: 'NYC-DC-1' }
]

const columns = [
  { key: 'sn', label: 'SN', sortable: true },
  { key: 'hostname', label: '主机名', sortable: true },
  { key: 'ip', label: 'IP 地址', sortable: true },
  { key: 'idc', label: '机房', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'actions', label: '操作', width: 150 }
]

// Mock 数据
const servers = ref([
  { sn: 'SN123456789', hostname: 'prod-web-01', ip: '10.0.0.1', idc: 'LAX-DC-1', status: 'online' },
  { sn: 'SN123456790', hostname: 'prod-web-02', ip: '10.0.0.2', idc: 'LAX-DC-1', status: 'online' },
  { sn: 'SN123456791', hostname: 'prod-db-01', ip: '10.0.0.3', idc: 'LAX-DC-2', status: 'online' },
  { sn: 'SN123456792', hostname: 'prod-db-02', ip: '10.0.0.4', idc: 'LAX-DC-2', status: 'offline' },
  { sn: 'SN123456793', hostname: 'prod-cache-01', ip: '10.0.0.5', idc: 'LAX-DC-1', status: 'online' },
  { sn: 'SN123456794', hostname: 'prod-cache-02', ip: '10.0.0.6', idc: 'LAX-DC-1', status: 'online' },
  { sn: 'SN123456795', hostname: 'prod-app-01', ip: '10.0.0.7', idc: 'NYC-DC-1', status: 'online' },
  { sn: 'SN123456796', hostname: 'prod-app-02', ip: '10.0.0.8', idc: 'NYC-DC-1', status: 'offline' }
])

const filteredServers = computed(() => {
  let result = servers.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(server =>
      server.sn.toLowerCase().includes(query) ||
      server.hostname.toLowerCase().includes(query) ||
      server.ip.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (filters.value.status) {
    result = result.filter(server => server.status === filters.value.status)
  }

  // 机房过滤
  if (filters.value.idc) {
    result = result.filter(server => server.idc === filters.value.idc)
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredServers.value.length / 10)
})

const toggleFilter = () => {
  showFilter.value = !showFilter.value
}

const applyFilters = () => {
  notify({
    message: '筛选条件已应用',
    color: 'success'
  })
}

const resetFilters = () => {
  filters.value = {
    status: null,
    idc: null
  }
  notify({
    message: '筛选条件已重置',
    color: 'info'
  })
}

const loadServers = async () => {
  loading.value = true
  try {
    // TODO: 调用真实 API
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

const handleRowClick = (event) => {
  viewDetail(event.item.sn)
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
    message: `编辑服务器: ${server.sn}`,
    color: 'info'
  })
}

const handleDelete = async (server) => {
  const agreed = await confirm({
    title: '确认删除',
    message: `确定要删除服务器 ${server.sn} 吗？此操作不可恢复。`,
    okText: '删除',
    cancelText: '取消',
    size: 'small'
  })

  if (agreed) {
    // TODO: 调用删除 API
    notify({
      message: `服务器 ${server.sn} 已删除`,
      color: 'success'
    })
  }
}
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

.search-input {
  flex: 1;
  max-width: 400px;
}

.toolbar-actions {
  flex-shrink: 0;
}

.filter-panel {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.filter-panel .va-select {
  flex: 1;
  min-width: 150px;
}

.sn-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sn-text {
  font-weight: 600;
  color: #374151;
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

  .search-input {
    max-width: 100%;
  }

  .filter-panel {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

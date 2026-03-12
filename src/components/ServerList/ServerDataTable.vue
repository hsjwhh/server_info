<!-- src/components/ServerList/ServerDataTable.vue -->
<template>
  <VaCard class="mt-4">
    <VaCardContent>
      <!-- 数据表格 -->
      <VaDataTable
        v-if="sortedServers.length > 0"
        v-model:sort-by="sortBy"
        v-model:sorting-order="sortingOrder"
        :items="paginatedServers"
        :columns="columns"
        :loading="loading"
        :disable-client-sort="true"
        hoverable
        clickable
        striped
        @row:click="handleRowClick"
      >
        <template #cell(sn)="{ rowData }">
          <div class="sn-cell" @click.stop="viewDetail(rowData.sn)">
            <VaIcon name="mdi-server" size="small" color="primary" />
            <span class="sn-text">{{ rowData.sn }}</span>
          </div>
        </template>

        <template #cell(date)="{ rowData }">
          <span class="date-text">{{ formatDate(rowData) }}</span>
        </template>

        <template #cell(customer)="{ rowData }">
          <VaChip size="small" color="info" outline>
            {{ rowData.customer }}
          </VaChip>
        </template>

        <template #cell(business)="{ rowData }">
          <VaChip size="small" color="success" outline>
            {{ rowData.owner }}
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
      <div v-if="sortedServers.length > 0" class="pagination-container">
        <VaPagination
          v-model="currentPage"
          :pages="totalPages"
          :visible-pages="5"
          buttons-preset="secondary"
        />
        <div class="pagination-info">
          显示 {{ paginationStart }}-{{ paginationEnd }} / 共 {{ totalRecords }} 条
        </div>
      </div>

      <!-- 初始状态 - 未搜索 -->
      <div v-if="!hasSearched && servers.length === 0 && !loading" class="empty-state">
        <VaIcon name="mdi-magnify" size="64px" color="primary" />
        <p class="empty-title">请输入搜索条件</p>
        <p class="empty-text">在上方搜索框输入 SN、主机名或 IP，点击搜索按钮查询服务器</p>
      </div>

      <!-- 空状态 - 搜索无结果 -->
      <div v-if="hasSearched && servers.length === 0 && !loading" class="empty-state">
        <VaIcon name="mdi-server-off" size="64px" color="secondary" />
        <p class="empty-title">未找到匹配的服务器</p>
        <p class="empty-text">请尝试使用其他关键词或调整筛选条件</p>
        <VaButton
          @click="resetSearch"
          class="mt-3"
          preset="secondary"
        >
          重置搜索
        </VaButton>
      </div>

      <!-- 新增：筛选无结果 (搜索有数据但过滤后为空) -->
      <div v-if="hasSearched && servers.length > 0 && sortedServers.length === 0 && !loading" class="empty-state">
        <VaIcon name="mdi-filter-off" size="64px" color="secondary" />
        <p class="empty-title">当前业务下暂无数据</p>
        <p class="empty-text">请切换业务筛选条件，或查看全部结果</p>
      </div>

      <!-- 加载状态 -->
      <VaInnerLoading v-if="loading && servers.length === 0" class="loading-container">
        <p class="loading-text">正在搜索服务器...</p>
      </VaInnerLoading>
    </VaCardContent>
  </VaCard>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  VaCard,
  VaCardContent,
  VaDataTable,
  VaIcon,
  VaChip,
  VaButton,
  VaPagination,
  VaInnerLoading,
  useToast
} from 'vuestic-ui'
import { useServerListStore } from '../../stores/useServerListStore'
import { useServerSearch } from '../../composables/useServerSearch'

const router = useRouter()
const { init: notify } = useToast()

// Store 和 Composables
const store = useServerListStore()
const {
  servers,
  filteredServers,
  sortedServers,
  totalRecords,
  loading,
  hasSearched,
  currentPage,
  sortBy,
  sortingOrder,
  totalPages,
  paginatedServers,
  paginationStart,
  paginationEnd
} = storeToRefs(store)

const {
  clearAllAndReset,
  saveStateToSession
} = useServerSearch()

// 表格列定义
const columns = [
  { key: 'sn', label: 'SN', sortable: true },
  { key: 'date', label: '日期', sortable: true },
  { key: 'customer', label: '出机客户', sortable: true },
  { key: 'owner', label: '业务', sortable: true },
  { key: 'actions', label: '操作', width: 150 }
]

/**
 * 格式化日期
 */
const formatDate = (server) => {
  if (!server.y) return '-'
  const y = server.y
  const m = String(server.m).padStart(2, '0')
  const d = String(server.d).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 重置搜索
 */
const resetSearch = () => {
  clearAllAndReset()
}

/**
 * 查看详情
 */
const viewDetail = (sn) => {
  saveStateToSession()
  router.push({ name: 'ServerDetail', params: { sn } })
}

/**
 * 行点击事件
 */
const handleRowClick = (event) => {
  // VaDataTable 的 row:click 回调数据项在 event.item 中。
  // 单元格内按钮已使用 @click.stop，避免触发行跳转。
  viewDetail(event.item.sn)
}

/**
 * 编辑服务器
 */
const handleEdit = (server) => {
  notify({
    message: `编辑服务器: ${server.sn}`,
    color: 'info'
  })
}

/**
 * 删除服务器
 */
const handleDelete = (server) => {
  notify({
    message: '删除功能开发中',
    color: 'info'
  })
}
</script>

<style scoped>
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
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.hardware-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem !important; /* Match baseline gap */
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.pagination-info {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.status-tag {
  font-weight: 600;
}

.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  margin-top: var(--space-4);
  color: var(--color-text-secondary);
  font-size: var(--text-base);
}
</style>

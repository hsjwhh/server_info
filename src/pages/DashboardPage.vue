<!-- src/pages/DashboardPage.vue -->
<template>
  <div class="dashboard-page">
    <div class="page-header mb-6">
      <h1 class="page-title">资产概览 (Dashboard)</h1>
    </div>
    
    <!-- 加载遮罩 -->
    <VaInnerLoading :loading="loading" class="loading-container">
      
      <!-- 1. 核心资产指标 -->
      <div class="stats-grid mb-6">
        <VaCard class="hover-lift stat-card-primary">
          <VaCardContent>
            <div class="stat-item">
              <VaIcon name="mdi-server" size="32px" color="primary" />
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalCount }}</div>
                <div class="stat-label">服务器总资产</div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="hover-lift stat-card-success">
          <VaCardContent>
            <div class="stat-item">
              <VaIcon name="mdi-plus-circle" size="32px" color="success" />
              <div class="stat-info">
                <div class="stat-value">{{ stats.monthlyCount }}</div>
                <div class="stat-label">本月新增入库</div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="hover-lift stat-card-info">
          <VaCardContent>
            <div class="stat-item">
              <VaIcon name="mdi-account-group" size="32px" color="info" />
              <div class="stat-info">
                <div class="stat-value">{{ stats.customerCount }}</div>
                <div class="stat-label">服务客户总数</div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="hover-lift stat-card-warning">
          <VaCardContent>
            <div class="stat-item">
              <VaIcon name="mdi-alert-circle" size="32px" color="warning" />
              <div class="stat-info">
                <div class="stat-value">{{ stats.pendingInfoCount }}</div>
                <div class="stat-label">信息待完善</div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- 2. 最近入库动态 -->
        <VaCard class="lg:col-span-2">
          <VaCardTitle class="flex justify-between">
            <span>最近入库动态</span>
            <VaButton preset="plain" size="small" @click="$router.push('/servers')">查看全部</VaButton>
          </VaCardTitle>
          <VaCardContent>
            <VaDataTable
              :items="recentServers"
              :columns="recentColumns"
              class="recent-table"
              no-data-html="暂无录入记录"
            >
              <template #cell(sn)="{ value }">
                <span class="font-mono text-primary cursor-pointer hover:underline" @click="$router.push(`/servers/${value}`)">
                  {{ value }}
                </span>
              </template>
              <template #cell(entry_date)="{ value }">
                <span class="text-secondary">{{ value || '-' }}</span>
              </template>
            </VaDataTable>
          </VaCardContent>
        </VaCard>

        <!-- 3. 快速操作与系统分布 -->
        <div class="flex flex-col gap-6">
          <VaCard>
            <VaCardTitle>快速操作</VaCardTitle>
            <VaCardContent class="quick-actions">
              <VaButton block icon="mdi-database-plus" @click="$router.push('/server/entry')">
                新服务器入库
              </VaButton>
              <VaButton block preset="secondary" icon="mdi-clipboard-text-search" @click="$router.push('/config-plan')">
                制定配置方案
              </VaButton>
            </VaCardContent>
          </VaCard>

          <VaCard class="flex-grow">
            <VaCardTitle>系统分布占比</VaCardTitle>
            <VaCardContent>
              <template v-if="osDistribution.length > 0">
                <div v-for="(os, idx) in osDistribution" :key="os.name" class="os-stat-item mb-3">
                  <div class="flex justify-between text-xs mb-1">
                    <span>{{ os.name }}</span>
                    <span class="font-bold">{{ os.count }} 台 ({{ os.percent }}%)</span>
                  </div>
                  <VaProgressBar :model-value="os.percent" :color="getOsColor(idx)" />
                </div>
              </template>
              <div v-else class="text-center py-8 text-gray-400 text-sm">
                暂无分布数据
              </div>
            </VaCardContent>
          </VaCard>
        </div>
      </div>

    </VaInnerLoading>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  VaCard, VaCardContent, VaCardTitle, VaIcon, VaButton, 
  VaInnerLoading, VaDataTable, VaProgressBar, useToast 
} from 'vuestic-ui'
import { getDashboardStats } from '../api/stats'

const { init: notify } = useToast()
const loading = ref(true)

// 响应式数据
const stats = ref({
  totalCount: 0,
  monthlyCount: 0,
  customerCount: 0,
  pendingInfoCount: 0
})
const recentServers = ref([])
const osDistribution = ref([])

const recentColumns = [
  { key: 'entry_date', label: '录入日期', sortable: true },
  { key: 'sn', label: '序列号 (SN)' },
  { key: 'customer', label: '所属客户' },
  { key: 'cpu', label: 'CPU 型号' },
]

// 获取数据
const fetchDashboardData = async () => {
  loading.value = true
  try {
    const res = await getDashboardStats()
    if (res) {
      stats.value = res.summary || stats.value
      recentServers.value = res.recentServers || []
      osDistribution.value = res.osDistribution || []
    }
  } catch (error) {
    console.error('Fetch dashboard failed:', error)
    notify({ message: '获取仪表盘数据失败', color: 'danger' })
  } finally {
    loading.value = false
  }
}

const getOsColor = (index) => {
  const colors = ['primary', 'success', 'warning', 'info', 'danger', 'secondary']
  return colors[index % colors.length]
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.loading-container {
  min-height: 400px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-6);
}

.stat-card-primary  { border-left: 4px solid var(--va-primary); }
.stat-card-success  { border-left: 4px solid var(--va-success); }
.stat-card-info     { border-left: 4px solid var(--va-info); }
.stat-card-warning  { border-left: 4px solid var(--va-warning); }

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.recent-table :deep(.va-data-table__table) {
  font-size: 0.85rem;
}

.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lg\:col-span-2 { grid-column: span 2 / span 2; }
}
.gap-6 { gap: 1.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
</style>

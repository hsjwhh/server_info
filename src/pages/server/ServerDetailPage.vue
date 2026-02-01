<!-- src/pages/ServerDetailPage.vue -->
<template>
  <div class="server-detail-page">
    <div class="page-header">
      <h1 class="page-title">服务器详情</h1>
      <VaButton
        preset="secondary"
        icon-right="mdi-arrow-left"
        @click="$router.push('/servers')"
      >
        返回列表
      </VaButton>
    </div>

    <!-- 搜索卡片 -->
    <VaCard>
      <VaCardContent>
        <div class="search-bar">
          <VaInput
            v-model="snInput"
            label="服务器 SN"
            placeholder="例如:SN123456789"
            clearable
            @keyup.enter="handleSearch"
            class="search-input"
          >
            <template #prepend>
              <VaIcon name="mdi-magnify" />
            </template>
          </VaInput>
          <VaButton
            :disabled="!snInput"
            @click="handleSearch"
            :loading="loading"
          >
            查询
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- 加载状态 -->
    <VaCard v-if="loading" class="mt-4">
      <VaCardContent>
        <VaInnerLoading :loading="true" :size="60">
          <div class="loading-container">
            <p class="loading-text">查询中...</p>
          </div>
        </VaInnerLoading>
      </VaCardContent>
    </VaCard>

    <!-- 服务器详情 -->
    <template v-else-if="server">
      <!-- 基本信息卡片 -->
      <VaCard class="mt-4">
        <VaCardTitle class="card-title">
          <VaIcon name="mdi-server" class="title-icon" />
          基本信息
        </VaCardTitle>
        <VaCardContent>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">
                <VaIcon name="mdi-identifier" size="small" />
                SN
              </div>
              <div class="info-value">{{ server.sn }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <VaIcon name="mdi-desktop-tower" size="small" />
                主机名
              </div>
              <div class="info-value">{{ server.hostname }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <VaIcon name="mdi-ip-network" size="small" />
                IP 地址
              </div>
              <div class="info-value">{{ server.ip }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <VaIcon name="mdi-office-building" size="small" />
                机房
              </div>
              <div class="info-value">{{ server.idc }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <VaIcon name="mdi-circle" size="small" />
                状态
              </div>
              <VaChip
                :color="server.status === 'online' ? 'success' : 'danger'"
                size="small"
              >
                <VaIcon
                  :name="server.status === 'online' ? 'mdi-check-circle' : 'mdi-close-circle'"
                  size="small"
                />
                {{ server.status === 'online' ? '在线' : '离线' }}
              </VaChip>
            </div>

            <div v-if="server.uptime" class="info-item">
              <div class="info-label">
                <VaIcon name="mdi-clock-outline" size="small" />
                运行时间
              </div>
              <div class="info-value">{{ formatUptime(server.uptime) }}</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- 资源使用情况 -->
      <VaCard v-if="server.status === 'online'" class="mt-4">
        <VaCardTitle class="card-title">
          <VaIcon name="mdi-chart-line" class="title-icon" />
          资源使用情况
        </VaCardTitle>
        <VaCardContent>
          <div class="metrics-grid">
            <!-- CPU -->
            <div class="metric-card">
              <div class="metric-header">
                <div class="metric-info">
                  <VaIcon name="mdi-cpu-64-bit" size="24px" :color="getMetricColor(server.cpuUsage)" />
                  <span class="metric-name">CPU 使用率</span>
                </div>
                <VaChip
                  :color="getMetricColor(server.cpuUsage)"
                  size="small"
                >
                  {{ server.cpuUsage || 0 }}%
                </VaChip>
              </div>
              <VaProgressBar
                :model-value="server.cpuUsage || 0"
                :color="getMetricColor(server.cpuUsage)"
                class="mt-3"
              />
            </div>

            <!-- 内存 -->
            <div class="metric-card">
              <div class="metric-header">
                <div class="metric-info">
                  <VaIcon name="mdi-memory" size="24px" :color="getMetricColor(server.memoryUsage)" />
                  <span class="metric-name">内存使用率</span>
                </div>
                <VaChip
                  :color="getMetricColor(server.memoryUsage)"
                  size="small"
                >
                  {{ server.memoryUsage || 0 }}%
                </VaChip>
              </div>
              <VaProgressBar
                :model-value="server.memoryUsage || 0"
                :color="getMetricColor(server.memoryUsage)"
                class="mt-3"
              />
            </div>

            <!-- 磁盘 -->
            <div class="metric-card">
              <div class="metric-header">
                <div class="metric-info">
                  <VaIcon name="mdi-harddisk" size="24px" :color="getMetricColor(server.diskUsage)" />
                  <span class="metric-name">磁盘使用率</span>
                </div>
                <VaChip
                  :color="getMetricColor(server.diskUsage)"
                  size="small"
                >
                  {{ server.diskUsage || 0 }}%
                </VaChip>
              </div>
              <VaProgressBar
                :model-value="server.diskUsage || 0"
                :color="getMetricColor(server.diskUsage)"
                class="mt-3"
              />
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- 操作按钮 -->
      <VaCard class="mt-4">
        <VaCardContent>
          <div class="action-buttons">
            <VaButton preset="secondary" icon="mdi-refresh">
              刷新数据
            </VaButton>
            <VaButton preset="secondary" icon="mdi-pencil">
              编辑信息
            </VaButton>
            <VaButton color="danger" icon="mdi-delete">
              删除服务器
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </template>

    <!-- 未找到 -->
    <VaCard v-else-if="searched" class="mt-4">
      <VaCardContent>
        <div class="empty-state">
          <VaIcon name="mdi-server-off" size="64px" color="secondary" />
          <p class="empty-title">未找到服务器</p>
          <p class="empty-text">没有找到 SN 为「{{ snInput }}」的服务器记录</p>
          <VaButton
            preset="secondary"
            class="mt-4"
            @click="$router.push('/servers')"
          >
            查看所有服务器
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  VaCard,
  VaCardTitle,
  VaCardContent,
  VaInput,
  VaButton,
  VaIcon,
  VaChip,
  VaProgressBar,
  VaInnerLoading,
  useToast
} from 'vuestic-ui'

const route = useRoute()
const router = useRouter()
const { init: notify } = useToast()

const snInput = ref('')
const server = ref(null)
const searched = ref(false)
const loading = ref(false)

// Mock 数据
const mockServers = {
  'SN123456789': {
    sn: 'SN123456789',
    hostname: 'prod-web-01',
    ip: '10.0.0.1',
    idc: 'LAX-DC-1',
    status: 'online',
    cpuUsage: 45,
    memoryUsage: 72,
    diskUsage: 58,
    uptime: 1234567
  },
  'SN123456790': {
    sn: 'SN123456790',
    hostname: 'prod-web-02',
    ip: '10.0.0.2',
    idc: 'LAX-DC-1',
    status: 'online',
    cpuUsage: 32,
    memoryUsage: 68,
    diskUsage: 43,
    uptime: 987654
  },
  'SN123456791': {
    sn: 'SN123456791',
    hostname: 'prod-db-01',
    ip: '10.0.0.3',
    idc: 'LAX-DC-2',
    status: 'online',
    cpuUsage: 78,
    memoryUsage: 89,
    diskUsage: 92,
    uptime: 2345678
  },
  'SN123456792': {
    sn: 'SN123456792',
    hostname: 'prod-db-02',
    ip: '10.0.0.4',
    idc: 'LAX-DC-2',
    status: 'offline'
  }
}

// Mock API 调用
const mockFetchServerBySn = async (snValue) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockServers[snValue] || null
}

const handleSearch = async () => {
  if (!snInput.value.trim()) {
    notify({
      message: '请输入服务器 SN',
      color: 'warning'
    })
    return
  }

  searched.value = false
  server.value = null
  loading.value = true

  try {
    const result = await mockFetchServerBySn(snInput.value.trim())
    server.value = result
    searched.value = true

    if (result) {
      // 更新 URL 参数
      if (route.params.sn !== result.sn) {
        router.replace({ name: 'ServerDetail', params: { sn: result.sn } })
      }
    } else {
      notify({
        message: '未找到该服务器',
        color: 'warning'
      })
    }
  } catch (error) {
    notify({
      message: '查询失败，请稍后重试',
      color: 'danger'
    })
  } finally {
    loading.value = false
  }
}

const getMetricColor = (value) => {
  if (!value) return 'success'
  if (value >= 80) return 'danger'
  if (value >= 60) return 'warning'
  return 'success'
}

const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days} 天 ${hours} 小时 ${minutes} 分钟`
}

// 如果路由参数包含 SN,自动查询
onMounted(() => {
  const sn = route.params.sn
  if (sn && sn !== 'search') {
    snInput.value = sn
    handleSearch()
  }
})

// 监听路由变化
watch(() => route.params.sn, (newSn) => {
  if (newSn && newSn !== 'search' && newSn !== snInput.value) {
    snInput.value = newSn
    handleSearch()
  }
})
</script>

<style scoped>
.server-detail-page {
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

.search-bar {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 1rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.title-icon {
  color: var(--va-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #111827;
  font-weight: 600;
}

.metrics-grid {
  display: grid;
  gap: 1.5rem;
}

.metric-card {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.metric-name {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.empty-text {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>

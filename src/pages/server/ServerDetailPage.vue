<!-- src/pages/machines/ServerDetailPage.vue -->
<template>
  <div class="server-detail-page">
    <h1 class="page-title">服务器详情</h1>

    <VaCard>
      <VaCardContent>
        <div class="sn-input-row">
          <VaInput 
            v-model="snInput" 
            label="服务器 SN" 
            placeholder="例如：SN123456789" 
            clearable 
            @keyup.enter="handleSearch"
          />
          <VaButton 
            class="ml-3" 
            color="primary" 
            :disabled="!snInput" 
            @click="handleSearch"
          >
            查询
          </VaButton>
          <VaButton 
            class="ml-2" 
            preset="secondary" 
            @click="$router.push('/machines')"
          >
            返回列表
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard v-if="loading" class="mt-4">
      <VaCardContent>
        <div class="loading-container">
          <VaProgressCircle indeterminate />
          <span class="ml-3">查询中...</span>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard v-else-if="server" class="mt-4">
      <VaCardTitle>
        服务器详情
      </VaCardTitle>

      <VaCardContent>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="label">SN：</span>
            <span class="value">{{ server.sn }}</span>
          </div>
          <div class="detail-row">
            <span class="label">主机名：</span>
            <span class="value">{{ server.hostname }}</span>
          </div>
          <div class="detail-row">
            <span class="label">IP 地址：</span>
            <span class="value">{{ server.ip }}</span>
          </div>
          <div class="detail-row">
            <span class="label">机房：</span>
            <span class="value">{{ server.idc }}</span>
          </div>
          <div class="detail-row">
            <span class="label">状态：</span>
            <VaChip :color="server.status === 'online' ? 'success' : 'danger'">
              {{ server.status === 'online' ? '在线' : '离线' }}
            </VaChip>
          </div>
        </div>

        <VaDivider class="my-4" />

        <div v-if="server.status === 'online'" class="metrics-section">
          <h3 class="section-title">资源使用情况</h3>
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-header">
                <span>CPU 使用率</span>
                <span class="metric-value">{{ server.cpuUsage || 0 }}%</span>
              </div>
              <VaProgressBar 
                :model-value="server.cpuUsage || 0" 
                :color="getProgressColor(server.cpuUsage || 0)"
              />
            </div>
            <div class="metric-item">
              <div class="metric-header">
                <span>内存使用率</span>
                <span class="metric-value">{{ server.memoryUsage || 0 }}%</span>
              </div>
              <VaProgressBar 
                :model-value="server.memoryUsage || 0" 
                :color="getProgressColor(server.memoryUsage || 0)"
              />
            </div>
            <div class="metric-item">
              <div class="metric-header">
                <span>磁盘使用率</span>
                <span class="metric-value">{{ server.diskUsage || 0 }}%</span>
              </div>
              <VaProgressBar 
                :model-value="server.diskUsage || 0" 
                :color="getProgressColor(server.diskUsage || 0)"
              />
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <VaAlert 
      v-else-if="searched" 
      class="mt-4" 
      color="warning" 
      title="未找到服务器"
    >
      没有找到 SN 为「{{ snInput }}」的服务器记录。
    </VaAlert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  VaCard, 
  VaCardTitle, 
  VaCardContent, 
  VaInput, 
  VaButton, 
  VaChip, 
  VaAlert,
  VaProgressCircle,
  VaDivider,
  VaProgressBar
} from 'vuestic-ui'
import type { ServerInfo } from '../../types'

const route = useRoute()
const router = useRouter()

const snInput = ref('')
const server = ref<ServerInfo | null>(null)
const searched = ref(false)
const loading = ref(false)

// Mock API 调用
const mockFetchServerBySn = async (snValue: string): Promise<ServerInfo | null> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const mockServers: Record<string, ServerInfo> = {
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
      diskUsage: 43
    },
    'SN123456791': {
      sn: 'SN123456791',
      hostname: 'prod-db-01',
      ip: '10.0.0.3',
      idc: 'LAX-DC-2',
      status: 'online',
      cpuUsage: 78,
      memoryUsage: 89,
      diskUsage: 92
    }
  }
  
  return mockServers[snValue] || null
}

const handleSearch = async () => {
  if (!snInput.value.trim()) return

  searched.value = false
  server.value = null
  loading.value = true

  try {
    const result = await mockFetchServerBySn(snInput.value.trim())
    server.value = result
    searched.value = true

    // 更新 URL 参数
    if (result && route.params.sn !== result.sn) {
      router.replace({ name: 'MachineDetail', params: { sn: result.sn } })
    }
  } finally {
    loading.value = false
  }
}

const getProgressColor = (value: number): string => {
  if (value >= 80) return 'danger'
  if (value >= 60) return 'warning'
  return 'success'
}

// 如果路由参数包含 SN，自动查询
onMounted(() => {
  const sn = route.params.sn as string
  if (sn && sn !== 'search') {
    snInput.value = sn
    handleSearch()
  }
})

// 监听路由变化
watch(() => route.params.sn, (newSn) => {
  if (newSn && newSn !== 'search' && newSn !== snInput.value) {
    snInput.value = newSn as string
    handleSearch()
  }
})
</script>

<style scoped>
.server-detail-page {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin-bottom: 1.5rem;
  font-size: 32px;
  font-weight: 700;
  line-height: 2.25rem;
  color: #111827;
}

.sn-input-row {
  display: flex;
  align-items: flex-end;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.detail-grid {
  display: grid;
  gap: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
}

.label {
  width: 100px;
  color: #6b7280;
  font-weight: 500;
}

.value {
  font-weight: 500;
  color: #111827;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.metrics-grid {
  display: grid;
  gap: 1.5rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
}

.metric-value {
  font-weight: 600;
  color: #111827;
}
</style>

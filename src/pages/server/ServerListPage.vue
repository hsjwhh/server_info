<!-- src/pages/machines/MachinesListPage.vue -->
<template>
  <div class="machines-list-page">
    <h1 class="page-title">服务器列表</h1>

    <VaCard>
      <VaCardContent>
        <div class="search-bar">
          <VaInput 
            v-model="searchQuery" 
            placeholder="搜索服务器 SN、主机名或 IP..." 
            clearable
          >
            <template #prepend>
              <VaIcon name="mdi-magnify" />
            </template>
          </VaInput>
          <VaButton 
            icon="mdi-refresh" 
            @click="loadServers"
          >
            刷新
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard class="mt-4">
      <VaCardContent>
        <VaDataTable
          :items="filteredServers"
          :columns="columns"
          hoverable
          clickable
          @row:click="handleRowClick"
        >
          <template #cell(status)="{ value }">
            <VaChip 
              :color="value === 'online' ? 'success' : 'danger'"
              size="small"
            >
              {{ value === 'online' ? '在线' : '离线' }}
            </VaChip>
          </template>

          <template #cell(actions)="{ rowData }">
            <VaButton 
              preset="plain" 
              icon="mdi-eye" 
              size="small"
              @click.stop="viewDetail(rowData.sn)"
            />
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { VaCard, VaCardContent, VaInput, VaButton, VaIcon, VaDataTable, VaChip } from 'vuestic-ui'
import type { ServerInfo } from '../../types'

const router = useRouter()
const searchQuery = ref('')

const columns = [
  { key: 'sn', label: 'SN', sortable: true },
  { key: 'hostname', label: '主机名', sortable: true },
  { key: 'ip', label: 'IP 地址', sortable: true },
  { key: 'idc', label: '机房', sortable: true },
  { key: 'status', label: '状态', sortable: true },
  { key: 'actions', label: '操作', width: 80 }
]

// Mock 数据
const servers = ref<ServerInfo[]>([
  { sn: 'SN123456789', hostname: 'prod-web-01', ip: '10.0.0.1', idc: 'LAX-DC-1', status: 'online' },
  { sn: 'SN123456790', hostname: 'prod-web-02', ip: '10.0.0.2', idc: 'LAX-DC-1', status: 'online' },
  { sn: 'SN123456791', hostname: 'prod-db-01', ip: '10.0.0.3', idc: 'LAX-DC-2', status: 'online' },
  { sn: 'SN123456792', hostname: 'prod-db-02', ip: '10.0.0.4', idc: 'LAX-DC-2', status: 'offline' },
  { sn: 'SN123456793', hostname: 'prod-cache-01', ip: '10.0.0.5', idc: 'LAX-DC-1', status: 'online' }
])

const filteredServers = computed(() => {
  if (!searchQuery.value) {
    return servers.value
  }
  const query = searchQuery.value.toLowerCase()
  return servers.value.filter(server => 
    server.sn.toLowerCase().includes(query) ||
    server.hostname.toLowerCase().includes(query) ||
    server.ip.toLowerCase().includes(query)
  )
})

const loadServers = () => {
  // TODO: 调用真实 API
  console.log('刷新服务器列表')
}

const handleRowClick = (event: { item: ServerInfo }) => {
  viewDetail(event.item.sn)
}

const viewDetail = (sn: string) => {
  router.push({ name: 'MachineDetail', params: { sn } })
}
</script>

<style scoped>
.machines-list-page {
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

.search-bar {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.search-bar .va-input {
  flex: 1;
}
</style>

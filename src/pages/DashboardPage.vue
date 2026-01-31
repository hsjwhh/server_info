<!-- src/pages/DashboardPage.vue -->
<template>
  <div class="dashboard-page">
    <h1 class="page-title">Dashboard</h1>
    
    <div class="stats-grid">
      <VaCard>
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="mdi-server" size="large" color="primary" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalServers }}</div>
              <div class="stat-label">总服务器数</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="mdi-check-circle" size="large" color="success" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.onlineServers }}</div>
              <div class="stat-label">在线服务器</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="mdi-alert-circle" size="large" color="warning" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.warningServers }}</div>
              <div class="stat-label">告警服务器</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="mdi-close-circle" size="large" color="danger" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.offlineServers }}</div>
              <div class="stat-label">离线服务器</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <VaCard class="mt-4">
      <VaCardTitle>快速操作</VaCardTitle>
      <VaCardContent>
        <div class="quick-actions">
          <VaButton @click="$router.push('/machines')">
            查看所有服务器
          </VaButton>
          <VaButton @click="$router.push({ name: 'MachineDetail', params: { sn: 'search' } })">
            SN 查询
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VaCard, VaCardContent, VaCardTitle, VaIcon, VaButton } from 'vuestic-ui'

const stats = ref({
  totalServers: 156,
  onlineServers: 142,
  warningServers: 8,
  offlineServers: 6
})
</script>

<style scoped>
.dashboard-page {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>

<!-- src/pages/DashboardPage.vue -->
<template>
  <div class="dashboard-page">
    <h1 class="page-title mb-6">仪表盘</h1>
    
    <div class="stats-grid mb-6">
      <VaCard class="hover-lift stat-card-primary">
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

      <VaCard class="hover-lift stat-card-success">
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

      <VaCard class="hover-lift stat-card-warning">
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

      <VaCard class="hover-lift stat-card-danger">
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

    <VaCard>
      <VaCardTitle>快速操作</VaCardTitle>
      <VaCardContent>
        <div class="quick-actions">
          <VaButton @click="$router.push('/servers')">
            查看所有服务器
          </VaButton>
          <VaButton @click="$router.push({ name: 'ServerDetail', params: { sn: 'search' } })">
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}

.stat-card-primary  { border-left: 4px solid var(--va-primary); }
.stat-card-success  { border-left: 4px solid var(--va-success); }
.stat-card-warning  { border-left: 4px solid var(--va-warning); }
.stat-card-danger   { border-left: 4px solid var(--va-danger); }

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
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.quick-actions {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}
</style>

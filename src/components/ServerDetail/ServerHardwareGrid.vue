<template>
  <div class="hardware-section">
    <h3 class="section-title">
      <VaIcon name="mdi-memory" class="mr-2" />
      硬件配置
    </h3>

    <div class="hardware-grid">
      <!-- 基础硬件 -->
      <VaCard class="hardware-card hover-lift">
        <VaCardTitle>
          <VaIcon name="mdi-inbox" class="mr-2" />
          基础配置
        </VaCardTitle>
        <VaCardContent>
          <div class="hardware-items">
            <div v-if="server.chassis" class="hardware-item">
              <span class="hw-label">机箱</span>
              <VaChip size="small" color="primary">{{ server.chassis }}</VaChip>
            </div>
            <div v-if="server.psu" class="hardware-item">
              <span class="hw-label">电源</span>
              <VaChip size="small" color="primary">{{ server.psu }}</VaChip>
            </div>
            <div v-if="server.mb" class="hardware-item">
              <span class="hw-label">主板</span>
              <VaChip size="small" color="primary">{{ server.mb }}</VaChip>
            </div>
            <div v-if="server.bmcpwd" class="hardware-item">
              <span class="hw-label">BMC密码</span>
              <VaChip size="small" color="warning">{{ server.bmcpwd }}</VaChip>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- 计算资源 -->
      <VaCard class="hardware-card hover-lift">
        <VaCardTitle>
          <VaIcon name="mdi-cpu-64-bit" class="mr-2" />
          计算资源
        </VaCardTitle>
        <VaCardContent>
          <div class="hardware-items">
            <div v-if="server.cpu" class="hardware-item">
              <span class="hw-label">CPU</span>
              <div class="hw-value-group">
                <VaChip size="small" color="success">{{ server.cpu }}</VaChip>
                <VaBadge v-if="server.cpun" :text="`x${server.cpun}`" color="success" />
              </div>
            </div>
            <div v-if="server.mem" class="hardware-item">
              <span class="hw-label">内存</span>
              <div class="hw-value-group">
                <VaChip color="success">{{ server.mem }}</VaChip>
                <VaBadge v-if="server.memn" :text="`x${server.memn}`" color="success" />
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- 存储设备 -->
      <VaCard class="hardware-card hover-lift">
        <VaCardTitle>
          <VaIcon name="mdi-harddisk" class="mr-2" />
          存储设备
        </VaCardTitle>
        <VaCardContent>
          <div class="hardware-items">
            <div v-if="server.m2" class="hardware-item">
              <span class="hw-label">M.2</span>
              <div class="hw-value-group">
                <VaChip size="small" color="info">{{ server.m2 }}</VaChip>
                <VaBadge v-if="server.m2n" :text="`x${server.m2n}`" color="info" />
              </div>
            </div>
            <div v-if="server.ssd" class="hardware-item">
              <span class="hw-label">SSD</span>
              <div class="hw-value-group">
                <VaChip color="info">{{ server.ssd }}</VaChip>
                <VaBadge v-if="server.ssdn" :text="`x${server.ssdn}`" color="info" />
              </div>
            </div>
            <div v-if="server.hdd" class="hardware-item">
              <span class="hw-label">HDD</span>
              <div class="hw-value-group">
                <VaChip color="info">{{ server.hdd }}</VaChip>
                <VaBadge v-if="server.hddn" :text="`x${server.hddn}`" color="info" />
              </div>
            </div>
            <div v-if="server.raid" class="hardware-item">
              <span class="hw-label">阵列卡</span>
              <div class="hw-value-group">
                <VaChip size="small" color="warning">{{ server.raid }}</VaChip>
                <VaBadge v-if="server.raidn" :text="`x${server.raidn}`" color="warning" />
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- 扩展设备 -->
      <VaCard class="hardware-card hover-lift">
        <VaCardTitle>
          <VaIcon name="mdi-expansion-card" class="mr-2" />
          扩展设备
        </VaCardTitle>
        <VaCardContent>
          <div class="hardware-items">
            <div v-if="server.lan" class="hardware-item">
              <span class="hw-label">网卡</span>
              <div class="hw-value-group">
                <VaChip size="small" color="primary">{{ server.lan }}</VaChip>
                <VaBadge v-if="server.lann" :text="`x${server.lann}`" color="primary" />
              </div>
            </div>
            <div v-if="server.gpu" class="hardware-item">
              <span class="hw-label">显卡</span>
              <div class="hw-value-group">
                <VaChip size="small" color="danger">{{ server.gpu }}</VaChip>
                <VaBadge v-if="server.gpun" :text="`x${server.gpun}`" color="danger" />
              </div>
            </div>
            <div v-if="server.os" class="hardware-item">
              <span class="hw-label">OS</span>
              <VaChip color="secondary">{{ server.os }}</VaChip>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </div>
</template>

<script setup>
import {
  VaCard,
  VaCardTitle,
  VaCardContent,
  VaIcon,
  VaChip,
  VaBadge
} from 'vuestic-ui'

const props = defineProps({
  server: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* FIX: Added margin-top to separate hardware section from the overview card */
/* FIX: Added margin-bottom to separate hardware section from the action buttons */
.hardware-section {
  margin-top: var(--space-6);
  margin-bottom: var(--space-6);
}

.section-title {
  display: flex;
  align-items: center;
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-4); /* FIX: Added gap between title and hardware grid */
  color: var(--color-text-primary);
}

.hardware-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.hardware-card {
  border-radius: var(--radius-lg);
}

.hardware-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.hardware-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-md);
}

.hw-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: #374151;
}

.hw-value-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

@media (max-width: 768px) {
  .hardware-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

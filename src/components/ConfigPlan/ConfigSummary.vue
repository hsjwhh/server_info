<!-- src/components/ConfigPlan/ConfigSummary.vue -->
<template>
  <VaCard>
    <VaCardTitle>
      <div class="card-title-with-action">
        <span>配置总览</span>
        <VaButton size="small" @click="exportConfig" :disabled="!selectedCpu">
          导出配置
        </VaButton>
      </div>
    </VaCardTitle>
    <VaCardContent>
      <div class="config-summary">

        <div v-if="!selectedCpu" class="empty-state">
          <VaIcon name="mdi-information-outline" size="large" color="secondary" />
          <p>请在左侧选择硬件配置</p>
        </div>

        <div v-else class="summary-list">
          <div class="summary-item">
            <div class="summary-label"><VaIcon name="mdi-chip" size="small" /><span>CPU</span></div>
            <div class="summary-value">{{ selectedCpu.cpu_short_name }} × {{ cpuCount }}</div>
          </div>

          <div v-if="selectedMotherboard" class="summary-item">
            <div class="summary-label"><VaIcon name="mdi-resistor-nodes" size="small" /><span>主板</span></div>
            <div class="summary-value">{{ selectedMotherboard }}</div>
          </div>

          <div v-if="memoryCount > 0" class="summary-item">
            <div class="summary-label"><VaIcon name="mdi-memory" size="small" /><span>内存</span></div>
            <div class="summary-value">{{ memoryType }} {{ memoryCapacity }} × {{ memoryCount }} ({{ totalMemory }}GB)</div>
          </div>

          <div v-for="item in m2Items" :key="item.id" class="summary-item">
            <div class="summary-label"><VaIcon name="mdi-harddisk" size="small" /><span>M.2 SSD</span></div>
            <div class="summary-value">{{ item.capacity }} × {{ item.count }}</div>
          </div>

          <div v-for="item in ssdItems" :key="item.id" class="summary-item">
            <div class="summary-label"><VaIcon name="mdi-harddisk" size="small" /><span>SATA SSD</span></div>
            <div class="summary-value">{{ item.capacity }} × {{ item.count }}</div>
          </div>

          <div v-for="item in hddItems" :key="item.id" class="summary-item">
            <div class="summary-label"><VaIcon name="mdi-harddisk" size="small" /><span>HDD</span></div>
            <div class="summary-value">{{ item.capacity }} × {{ item.count }}</div>
          </div>

          <div v-for="item in nicItems" :key="item.id" class="summary-item">
            <div class="summary-label"><VaIcon name="mdi-ethernet" size="small" /><span>网卡</span></div>
            <div class="summary-value">{{ item.model }} × {{ item.count }}</div>
          </div>

          <div v-for="item in gpuItems" :key="item.id" class="summary-item">
            <div class="summary-label"><VaIcon name="mdi-expansion-card" size="small" /><span>显卡</span></div>
            <div class="summary-value">{{ item.model }} × {{ item.count }}</div>
          </div>

          <div v-for="item in raidItems" :key="item.id" class="summary-item">
            <div class="summary-label"><VaIcon name="mdi-server" size="small" /><span>RAID 卡</span></div>
            <div class="summary-value">{{ item.model }} × {{ item.count }}</div>
          </div>
        </div>

      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup>
import { VaCard, VaCardTitle, VaCardContent, VaIcon, VaButton } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useConfigPlanStore } from '../../stores/configPlan'

const store = useConfigPlanStore()
const {
  selectedCpu, cpuCount,
  selectedMotherboard,
  memoryType, memoryCapacity, memoryCount, totalMemory,
  m2Items, ssdItems, hddItems,
  nicItems, gpuItems, raidItems
} = storeToRefs(store)

const { exportConfigData } = store

const exportConfig = () => {
  const config = exportConfigData()
  navigator.clipboard.writeText(JSON.stringify(config, null, 2))
  window.alert('配置已复制到剪贴板！')
}
</script>

<style scoped>
.card-title-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.config-summary { min-height: 200px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-5);
  color: var(--color-text-secondary);
  text-align: center;
}
.empty-state p { margin-top: var(--space-3); font-size: var(--text-sm); }

.summary-list { display: flex; flex-direction: column; gap: var(--space-3); }
.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-md);
}
.summary-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
.summary-value {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  text-align: right;
}
</style>

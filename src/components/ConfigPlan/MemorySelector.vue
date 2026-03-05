<!-- src/components/ConfigPlan/MemorySelector.vue -->
<template>
  <div class="form-section">
    <h3 class="section-title">
      <VaIcon name="mdi-memory" size="small" />
      内存
    </h3>

    <div v-if="!selectedCpu" class="empty-placeholder">
      <VaIcon name="mdi-memory" size="large" color="secondary" />
      <p>请先在上方选择 CPU 以确定可用内存类型</p>
    </div>

    <div v-else class="selector-content">
      <div class="controls-grid">
        <VaInput :model-value="memoryType" label="内存类型" readonly disabled class="ctrl-item" />

        <VaSelect v-model="memoryCapacity" label="单条容量" :options="memoryCapacityOptions" class="ctrl-item">
          <template #prependInner>
            <VaIcon name="mdi-database" size="small" />
          </template>
        </VaSelect>

        <VaCounter v-model="memoryCount" label="内存条数" :min="1" :max="maxMemorySlots" class="ctrl-item" />
      </div>

      <div class="memory-status mt-4">
        <div class="status-card">
          <span class="status-label">总内存容量</span>
          <span class="status-value highlight">{{ totalMemory }}GB</span>
        </div>
        <div class="status-card">
          <span class="status-label">预估运行功耗</span>
          <span class="status-value">{{ memoryPower }}W</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VaIcon, VaInput, VaSelect, VaCounter } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useConfigPlanStore } from '../../stores/configPlan'

const store = useConfigPlanStore()
const {
  selectedCpu,
  memoryType, memoryCapacity, memoryCount, memoryCapacityOptions, maxMemorySlots,
  totalMemory, memoryPower,
} = storeToRefs(store)
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
  background: var(--color-bg-page);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  text-align: center;
}

.empty-placeholder p {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
}

.controls-grid {
  display: grid;
  grid-template-columns: 120px 1fr 160px;
  gap: var(--space-4);
  align-items: flex-end;
}

.memory-status {
  display: flex;
  gap: var(--space-4);
}

.status-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-page);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
}

.status-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: 600;
}

.status-value {
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--color-text-primary);
}

.status-value.highlight {
  color: var(--va-primary);
}

@media (max-width: 640px) {
  .controls-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  .memory-status {
    flex-direction: column;
  }
}
</style>

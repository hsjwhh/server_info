<!-- src/components/ConfigPlan/MemorySelector.vue -->
<template>
  <div class="form-section">
    <h3 class="section-title">
      <VaIcon name="mdi-memory" size="small" />
      内存
    </h3>

    <VaAlert v-if="!selectedCpu" color="info" border="top">
      请先选择 CPU 型号
    </VaAlert>

    <div v-else class="form-group">
      <div class="controls-row">
        <VaInput :model-value="memoryType" label="内存类型" readonly disabled class="ctrl-item ctrl-type" />

        <VaSelect v-model="memoryCapacity" label="单条容量" :options="memoryCapacityOptions" class="ctrl-item ctrl-capacity">
          <template #prepend>
            <VaIcon name="mdi-database" size="small" />
          </template>
        </VaSelect>

        <VaCounter v-model="memoryCount" label="数量" :min="1" :max="maxMemorySlots" class="ctrl-item" />
      </div>

      <div class="memory-summary">
        <VaChip color="primary">总容量: {{ totalMemory }}GB</VaChip>
        <VaChip color="warning">预估功耗: {{ memoryPower }}W</VaChip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VaIcon, VaAlert, VaInput, VaSelect, VaCounter, VaChip } from 'vuestic-ui'
import { useConfigPlan } from '../../composables/useConfigPlan'

const {
  selectedCpu,
  memoryType, memoryCapacity, memoryCount, memoryCapacityOptions, maxMemorySlots,
  totalMemory, memoryPower,
} = useConfigPlan()
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: flex-end;
}
.ctrl-type {
  min-width: 120px;
  flex: 0 0 auto;
}
.ctrl-capacity {
  min-width: 140px;
  flex: 1 1 auto;
}
.ctrl-item {
  flex-shrink: 0;
}
.memory-summary {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
</style>

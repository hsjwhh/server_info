<!-- src/components/ConfigPlan/MotherboardSelector.vue -->
<template>
  <div class="form-section">
    <h3 class="section-title">
      <VaIcon name="mdi-resistor-nodes" size="small" />
      主板
    </h3>

    <VaAlert v-if="!selectedCpu" color="info" border="top">
      请先选择 CPU 型号
    </VaAlert>

    <div v-else>
      <VaSelect
        v-model="selectedMotherboard"
        label="选择主板"
        placeholder="选择兼容的主板..."
        :options="compatibleMotherboards"
        text-by="model"
        value-by="model"
        searchable
        clearable
      >
        <template #prepend>
          <VaIcon name="mdi-expansion-card" size="small" />
        </template>
      </VaSelect>

      <div v-if="selectedMotherboardDetail" class="selected-item mt-3">
        <div class="selected-header">
          <a
            v-if="selectedMotherboardDetail.url"
            :href="selectedMotherboardDetail.url"
            target="_blank"
            rel="noopener noreferrer"
            class="selected-name selected-link"
          >
            {{ selectedMotherboardDetail.model }}
            <VaIcon name="mdi-open-in-new" size="small" class="ml-1" />
          </a>
          <span v-else class="selected-name">{{ selectedMotherboardDetail.model }}</span>
        </div>

        <div class="selected-details">
          <div class="detail-row">
            <span class="label">支持 CPU 系列及数量:</span>
            <span>{{ selectedMotherboardDetail.cpu_number }} * {{ selectedMotherboardDetail.product_collection }}</span>
          </div>
          <div class="detail-row">
            <span class="label">CPU Max TDP:</span>
            <VaChip color="primary">{{ selectedMotherboardDetail.max_tdp }}</VaChip>
          </div>
          <div class="detail-row">
            <span class="label">内存数量:</span>
            <VaChip color="primary">{{ selectedMotherboardDetail.dimm_number }}</VaChip>
          </div>
          <div class="detail-row">
            <span class="label">内存类型:</span>
            <span>
              <div v-for="(item, index) in splitItems('memory_type')" :key="index">{{ item }}</div>
            </span>
          </div>
          <div class="detail-row">
            <span class="label">最大内存:</span>
            <span>{{ selectedMotherboardDetail.max_memory }}</span>
          </div>
          <div class="detail-row">
            <span class="label">PCIe 插槽:</span>
            <span>
              <div v-for="(item, index) in splitItems('pcie_list')" :key="index">{{ item }}</div>
            </span>
          </div>
          <div class="detail-row">
            <span class="label">存储:</span>
            <span>
              {{ selectedMotherboardDetail.m2 }}<br />
              <div v-for="(item, index) in splitItems('input')" :key="index">{{ item }}</div>
            </span>
          </div>
          <div class="detail-row">
            <span class="label">功耗:</span>
            <span class="highlight">{{ selectedMotherboardDetail.power || 50 }}W</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VaIcon, VaAlert, VaSelect, VaChip } from 'vuestic-ui'
import { useConfigPlan } from '../../composables/useConfigPlan'

const {
  selectedCpu,
  selectedMotherboard, compatibleMotherboards, selectedMotherboardDetail,
  splitItems,
} = useConfigPlan()
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.selected-item {
  padding: var(--space-4);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-subtle);
}
.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}
.selected-name {
  font-weight: 700;
  color: var(--color-text-primary);
  font-size: var(--text-lg);
}
.selected-link {
  color: var(--va-primary);
  text-decoration: none;
}
.selected-link:hover { text-decoration: underline; }

.selected-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}
.detail-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.detail-row .label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: 500;
}
.detail-row span:not(.label) {
  font-weight: 600;
  color: var(--color-text-primary);
}
.detail-row .highlight {
  color: var(--va-primary);
  font-size: var(--text-lg);
}
</style>

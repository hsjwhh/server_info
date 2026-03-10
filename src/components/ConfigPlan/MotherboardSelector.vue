<!-- src/components/ConfigPlan/MotherboardSelector.vue -->
<template>
  <div class="form-section">
    <h3 class="section-title">
      <VaIcon name="mdi-resistor-nodes" size="small" />
      主板
    </h3>

    <div v-if="!selectedCpu" class="empty-placeholder">
      <VaIcon name="mdi-cpu-64-bit" size="large" color="secondary" />
      <p>请先在上方选择 CPU 以匹配兼容主板</p>
    </div>

    <div v-else class="selector-content">
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
        <template #prependInner>
          <VaIcon name="mdi-expansion-card" size="small" />
        </template>
      </VaSelect>

      <div v-if="selectedMotherboardDetail" class="selected-item-card mt-3">
        <div class="card-header">
          <a
            v-if="selectedMotherboardDetail.url"
            :href="selectedMotherboardDetail.url"
            target="_blank"
            rel="noopener noreferrer"
            class="item-name item-link"
          >
            {{ selectedMotherboardDetail.model }}
            <VaIcon name="mdi-open-in-new" size="small" />
          </a>
          <span v-else class="item-name">{{ selectedMotherboardDetail.model }}</span>
        </div>

        <div class="item-details-grid">
          <div class="detail-tile">
            <span class="tile-label">CPU 支持</span>
            <span class="tile-value">{{ selectedMotherboardDetail.cpu_number }} × {{ selectedMotherboardDetail.product_collection }}</span>
          </div>
          <div class="detail-tile">
            <span class="tile-label">Max TDP</span>
            <VaChip size="small" color="primary">{{ selectedMotherboardDetail.max_tdp }}</VaChip>
          </div>
          <div class="detail-tile">
            <span class="tile-label">内存插槽</span>
            <span class="tile-value">{{ selectedMotherboardDetail.dimm_number }} Slots</span>
          </div>
          <div class="detail-tile">
            <span class="tile-label">最大内存</span>
            <span class="tile-value">{{ selectedMotherboardDetail.max_memory }}</span>
          </div>
          <div class="detail-tile full-width">
            <span class="tile-label">内存类型</span>
            <div class="tile-tags">
              <VaChip v-for="(item, index) in splitItems('memory_type')" :key="index" size="small" preset="outline">{{ item }}</VaChip>
            </div>
          </div>
          <div class="detail-tile full-width">
            <span class="tile-label">PCIe 配置</span>
            <div class="tile-list">
              <div v-for="(item, index) in splitItems('pcie_list')" :key="index" class="list-item">{{ item }}</div>
            </div>
          </div>
          <div class="detail-tile full-width">
            <span class="tile-label">存储接口</span>
            <div class="tile-list">
              <div class="list-item">{{ selectedMotherboardDetail.m2 }}</div>
              <div v-for="(item, index) in splitItems('input')" :key="index" class="list-item">{{ item }}</div>
            </div>
          </div>
          <div class="detail-tile highlight-tile">
            <span class="tile-label">预估板载功耗</span>
            <span class="tile-value-large">{{ selectedMotherboardDetail.power || 50 }}W</span>
          </div>
        </div>
      </div>
      <div v-else-if="compatibleMotherboards.length > 0" class="empty-placeholder-mini mt-3">
        <VaIcon name="mdi-selection-ellipse-arrow-inside" color="secondary" />
        <p>请从下拉菜单中选择一个主板型号</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VaIcon, VaSelect, VaChip } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useConfigPlanStore } from '../../stores/configPlan'

const store = useConfigPlanStore()
const {
  selectedCpu,
  selectedMotherboard, compatibleMotherboards, selectedMotherboardDetail
} = storeToRefs(store)

const { splitItems } = store
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

.empty-placeholder-mini {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: rgba(0,0,0,0.02);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.item-link {
  color: var(--va-primary);
  text-decoration: none;
}
.item-link:hover { text-decoration: underline; }

.tile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-1);
}

.tile-list {
  font-size: var(--text-xs);
  line-height: 1.4;
  color: var(--color-text-primary);
  font-weight: 500;
}
</style>

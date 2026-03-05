<!-- src/components/ConfigPlan/ExpansionSelector.vue -->
<template>
  <div class="form-section">
    <h3 class="section-title">
      <VaIcon name="mdi-expansion-card-variant" size="small" />
      扩展硬件
    </h3>

    <!-- 独立网卡 -->
    <div class="expansion-group">
      <div class="group-header">
        <span class="label">独立网卡</span>
        <VaButton preset="secondary" size="small" icon="mdi-plus" @click="addItem(nicItems, { model: 'Intel X550-T2', count: 1 })">
          添加
        </VaButton>
      </div>

      <div v-if="nicItems.length === 0" class="empty-text">未添加网卡</div>

      <div v-else class="config-table">
        <div class="config-table-header">
          <span class="col-model">型号</span>
          <span class="col-count">数量</span>
          <span class="col-action"></span>
        </div>
        <div class="config-table-body">
          <div v-for="item in nicItems" :key="item.id" class="expansion-config-row">
            <VaSelect
              v-model="item.model"
              :options="nicOptions"
              size="small"
              class="col-model"
            />
            <VaCounter v-model="item.count" :min="1" :max="4" size="small" class="col-count" />
            <div class="col-action">
              <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(nicItems, item.id)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 显卡 -->
    <div class="expansion-group">
      <div class="group-header">
        <span class="label">显卡 (GPU)</span>
        <VaButton preset="secondary" size="small" icon="mdi-plus" @click="addItem(gpuItems, { model: 'RTX 3060', count: 1 })">
          添加
        </VaButton>
      </div>

      <div v-if="gpuItems.length === 0" class="empty-text">未添加显卡</div>

      <div v-else class="config-table">
        <div class="config-table-header">
          <span class="col-model">型号</span>
          <span class="col-count">数量</span>
          <span class="col-action"></span>
        </div>
        <div class="config-table-body">
          <div v-for="item in gpuItems" :key="item.id" class="expansion-config-row">
            <VaSelect
              v-model="item.model"
              :options="gpuOptions"
              size="small"
              class="col-model"
            />
            <VaCounter v-model="item.count" :min="1" :max="4" size="small" class="col-count" />
            <div class="col-action">
              <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(gpuItems, item.id)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RAID 卡 -->
    <div class="expansion-group">
      <div class="group-header">
        <span class="label">RAID 卡</span>
        <VaButton preset="secondary" size="small" icon="mdi-plus" @click="addItem(raidItems, { model: '基础 RAID', count: 1 })">
          添加
        </VaButton>
      </div>

      <div v-if="raidItems.length === 0" class="empty-text">未添加 RAID 卡</div>

      <div v-else class="config-table">
        <div class="config-table-header">
          <span class="col-model">型号</span>
          <span class="col-count">数量</span>
          <span class="col-action"></span>
        </div>
        <div class="config-table-body">
          <div v-for="item in raidItems" :key="item.id" class="expansion-config-row">
            <VaSelect
              v-model="item.model"
              :options="['基础 RAID', 'HBA', '高级 RAID']"
              size="small"
              class="col-model"
            />
            <VaCounter v-model="item.count" :min="1" :max="4" size="small" class="col-count" />
            <div class="col-action">
              <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(raidItems, item.id)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="expansion-summary">
      <VaChip color="info">总预估扩展功耗: {{ expansionPower }}W</VaChip>
    </div>
  </div>
</template>

<script setup>
import { VaIcon, VaButton, VaSelect, VaCounter, VaChip } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useConfigPlanStore } from '../../stores/configPlan'

const store = useConfigPlanStore()
const {
  nicItems, nicOptions,
  gpuItems, gpuOptions,
  raidItems,
  expansionPower
} = storeToRefs(store)

const { addItem, removeItem } = store
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.expansion-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-bg-page);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.group-header .label {
  font-weight: 700;
  font-size: var(--text-sm);
  color: var(--va-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.config-table {
  background: white;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.config-table-header {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border-subtle);
  align-items: center;
}

.config-table-header span {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: 600;
  /* 对齐修正 */
  padding-left: 2px;
}

.config-table-body {
  padding: var(--space-1) 0;
}

.expansion-config-row {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-1) var(--space-3);
  transition: background 0.2s ease;
}

.expansion-config-row:not(:last-child) {
  border-bottom: 1px dashed var(--color-border-subtle);
}

.expansion-config-row:hover {
  background: var(--color-bg-hover);
}

.col-model {
  flex: 1;
}

.col-count {
  width: 140px;
  flex-shrink: 0;
}

.col-action {
  width: 32px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.empty-text {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  text-align: center;
  padding: var(--space-6);
  background: rgba(0,0,0,0.01);
  border-radius: var(--radius-sm);
  border: 1px dashed var(--color-border);
}

.expansion-summary {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-2);
}

@media (max-width: 640px) {
  .config-table-header {
    display: none;
  }
  .config-table-body {
    padding: var(--space-2);
  }
  .expansion-config-row {
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-3) 0;
    gap: var(--space-2);
  }
  .col-count {
    width: 100%;
  }
}
</style>

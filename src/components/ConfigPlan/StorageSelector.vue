<!-- src/components/ConfigPlan/StorageSelector.vue -->
<template>
  <div class="form-section">
    <div class="section-header">
      <h3 class="section-title">
        <VaIcon name="mdi-harddisk" size="small" />
        存储设备
      </h3>
    </div>

    <!-- M.2 SSD -->
    <div class="storage-group">
      <div class="group-header">
        <span class="label">M.2 SSD</span>
        <VaButton preset="secondary" size="small" icon="mdi-plus" @click="addItem(m2Items, { capacity: '512GB', count: 1 })">
          添加
        </VaButton>
      </div>
      
      <div v-if="m2Items.length === 0" class="empty-text">未添加 M.2 设备</div>
      
      <div v-else class="config-table">
        <div class="config-table-header">
          <span class="col-capacity">容量</span>
          <span class="col-count">数量</span>
          <span class="col-action"></span>
        </div>
        <div class="config-table-body">
          <div v-for="item in m2Items" :key="item.id" class="storage-config-row">
            <VaSelect v-model="item.capacity" :options="['256GB', '512GB', '1TB', '2TB']" size="small" class="col-capacity" />
            <VaCounter v-model="item.count" :min="1" :max="4" size="small" class="col-count" />
            <div class="col-action">
              <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(m2Items, item.id)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SATA SSD -->
    <div class="storage-group">
      <div class="group-header">
        <span class="label">SATA SSD</span>
        <VaButton preset="secondary" size="small" icon="mdi-plus" @click="addItem(ssdItems, { capacity: '960GB', count: 1 })">
          添加
        </VaButton>
      </div>

      <div v-if="ssdItems.length === 0" class="empty-text">未添加 SATA SSD</div>

      <div v-else class="config-table">
        <div class="config-table-header">
          <span class="col-capacity">容量</span>
          <span class="col-count">数量</span>
          <span class="col-action"></span>
        </div>
        <div class="config-table-body">
          <div v-for="item in ssdItems" :key="item.id" class="storage-config-row">
            <VaSelect v-model="item.capacity" :options="['480GB', '960GB', '1.92TB', '3.84TB']" size="small" class="col-capacity" />
            <VaCounter v-model="item.count" :min="1" :max="8" size="small" class="col-count" />
            <div class="col-action">
              <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(ssdItems, item.id)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- HDD -->
    <div class="storage-group">
      <div class="group-header">
        <span class="label">HDD 机械硬盘</span>
        <VaButton preset="secondary" size="small" icon="mdi-plus" @click="addItem(hddItems, { capacity: '4TB', count: 1 })">
          添加
        </VaButton>
      </div>

      <div v-if="hddItems.length === 0" class="empty-text">未添加 HDD 设备</div>

      <div v-else class="config-table">
        <div class="config-table-header">
          <span class="col-capacity">容量</span>
          <span class="col-count">数量</span>
          <span class="col-action"></span>
        </div>
        <div class="config-table-body">
          <div v-for="item in hddItems" :key="item.id" class="storage-config-row">
            <VaSelect v-model="item.capacity" :options="['2TB', '4TB', '8TB', '10TB', '12TB']" size="small" class="col-capacity" />
            <VaCounter v-model="item.count" :min="1" :max="12" size="small" class="col-count" />
            <div class="col-action">
              <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(hddItems, item.id)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="storage-summary">
      <VaChip color="info">总预估功耗: {{ storagePower }}W</VaChip>
    </div>
  </div>
</template>

<script setup>
import { VaIcon, VaButton, VaSelect, VaCounter, VaChip } from 'vuestic-ui'
import { useConfigPlan } from '../../composables/useConfigPlan'

const {
  m2Items, ssdItems, hddItems,
  storagePower, addItem, removeItem
} = useConfigPlan()
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.storage-group {
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
  /* 对齐修正：补偿 VaSelect/VaCounter 的内部 layout */
  padding-left: 2px;
}

.config-table-body {
  padding: var(--space-1) 0;
}

.storage-config-row {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-1) var(--space-3);
  transition: background 0.2s ease;
}

.storage-config-row:not(:last-child) {
  border-bottom: 1px dashed var(--color-border-subtle);
}

.storage-config-row:hover {
  background: var(--color-bg-hover);
}

.col-capacity {
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

.storage-summary {
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
  .storage-config-row {
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

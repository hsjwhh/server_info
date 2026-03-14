<!-- src/components/ConfigPlan/StorageSelector.vue -->
<template>
  <div class="form-section">
    <div class="section-header">
      <h3 class="section-title">
        <VaIcon name="mdi-harddisk" size="small" />
        存储设备
      </h3>
    </div>

    <div class="hw-group-box">
      <!-- M.2 系列 -->
      <div v-if="m2Items.length > 0" class="sub-group">
        <label class="group-label">M.2 SSD (NVMe)</label>
        <div v-for="item in m2Items" :key="item.id" class="hw-row mb-2">
          <VaSelect 
            v-model="item.capacity" 
            :options="['256GB', '512GB', '1TB', '2TB', '4TB']" 
            size="small" 
            class="f-grow" 
          />
          <VaCounter v-model="item.count" :min="1" :max="4" size="small" class="hw-counter" />
          <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(m2Items, item.id)" />
        </div>
      </div>

      <!-- SSD 系列 -->
      <div v-if="ssdItems.length > 0" class="sub-group mt-3">
        <label class="group-label">SATA/SAS SSD</label>
        <div v-for="item in ssdItems" :key="item.id" class="hw-row mb-2">
          <VaSelect 
            v-model="item.capacity" 
            :options="['480GB', '960GB', '1.92TB', '3.84TB', '7.68TB']" 
            size="small" 
            class="f-grow" 
          />
          <VaCounter v-model="item.count" :min="1" :max="12" size="small" class="hw-counter" />
          <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(ssdItems, item.id)" />
        </div>
      </div>

      <!-- HDD 系列 -->
      <div v-if="hddItems.length > 0" class="sub-group mt-3">
        <label class="group-label">HDD 机械硬盘</label>
        <div v-for="item in hddItems" :key="item.id" class="hw-row mb-2">
          <VaSelect 
            v-model="item.capacity" 
            :options="['2TB', '4TB', '8TB', '12TB', '16TB', '18TB']" 
            size="small" 
            class="f-grow" 
          />
          <VaCounter v-model="item.count" :min="1" :max="12" size="small" class="hw-counter" />
          <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(hddItems, item.id)" />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="m2Items.length === 0 && ssdItems.length === 0 && hddItems.length === 0" class="empty-placeholder">
        尚未配置任何存储设备
      </div>

      <!-- 统一底部操作栏 -->
      <div class="flex gap-2 mt-4 pt-3 border-t">
        <VaButton size="small" preset="secondary" @click="addItem(m2Items, { capacity: '512GB', count: 1 })">+ M.2</VaButton>
        <VaButton size="small" preset="secondary" @click="addItem(ssdItems, { capacity: '960GB', count: 1 })">+ SSD</VaButton>
        <VaButton size="small" preset="secondary" @click="addItem(hddItems, { capacity: '4TB', count: 1 })">+ HDD</VaButton>
      </div>
    </div>

    <div class="storage-summary">
      <VaChip color="info" outline size="small">总预估功耗: {{ storagePower }}W</VaChip>
    </div>
  </div>
</template>

<script setup>
import { VaIcon, VaButton, VaSelect, VaCounter, VaChip } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useConfigPlanStore } from '../../stores/configPlan'

const store = useConfigPlanStore()
const { m2Items, ssdItems, hddItems, storagePower } = storeToRefs(store)
const { addItem, removeItem } = store
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
}

.hw-group-box {
  padding: var(--space-2) 0;
}

.group-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--va-secondary);
  text-transform: uppercase;
  margin-bottom: var(--space-1);
  display: block;
  letter-spacing: 0.05em;
}

.hw-row {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.f-grow {
  flex-grow: 1;
}

.hw-counter {
  width: 110px;
}

.empty-placeholder {
  padding: var(--space-6);
  text-align: center;
  color: var(--va-secondary);
  font-size: var(--text-sm);
  background: var(--va-background-element);
  border-radius: var(--va-card-border-radius);
  border: 1px dashed var(--va-background-border);
}

.border-t {
  border-top: 1px solid var(--va-background-border);
}

.storage-summary {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-2);
}

.mt-3 { margin-top: var(--space-3); }
.mt-4 { margin-top: var(--space-4); }
.mb-2 { margin-bottom: var(--space-2); }
.pt-3 { padding-top: var(--space-3); }
</style>

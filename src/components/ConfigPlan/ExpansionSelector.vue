<!-- src/components/ConfigPlan/ExpansionSelector.vue -->
<template>
  <div class="form-section">
    <div class="section-header">
      <h3 class="section-title">
        <VaIcon name="mdi-expansion-card-variant" size="small" />
        扩展硬件
      </h3>
    </div>

    <div class="hw-group-box">
      <!-- 显卡 (GPU) -->
      <div v-if="gpuItems.length > 0" class="sub-group">
        <label class="group-label">显卡 (GPU / 加速卡)</label>
        <div v-for="item in gpuItems" :key="item.id" class="hw-row mb-2">
          <VaSelect v-model="item.model" :options="gpuOptions" size="small" class="f-grow" />
          <VaCounter v-model="item.count" :min="1" :max="4" size="small" class="hw-counter" />
          <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(gpuItems, item.id)" />
        </div>
      </div>

      <!-- 网卡 (LAN) -->
      <div v-if="nicItems.length > 0" class="sub-group mt-3">
        <label class="group-label">网络扩展 (NIC / LAN)</label>
        <div v-for="item in nicItems" :key="item.id" class="hw-row mb-2">
          <VaSelect v-model="item.model" :options="nicOptions" size="small" class="f-grow" />
          <VaCounter v-model="item.count" :min="1" :max="4" size="small" class="hw-counter" />
          <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(nicItems, item.id)" />
        </div>
      </div>

      <!-- RAID 卡 -->
      <div v-if="raidItems.length > 0" class="sub-group mt-3">
        <label class="group-label">存储控制 (RAID / HBA)</label>
        <div v-for="item in raidItems" :key="item.id" class="hw-row mb-2">
          <VaSelect v-model="item.model" :options="['基础 RAID', 'HBA', '高级 RAID']" size="small" class="f-grow" />
          <VaCounter v-model="item.count" :min="1" :max="4" size="small" class="hw-counter" />
          <VaButton preset="plain" icon="mdi-close" color="danger" size="small" @click="removeItem(raidItems, item.id)" />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="gpuItems.length === 0 && nicItems.length === 0 && raidItems.length === 0" class="empty-placeholder">
        未添加扩展硬件
      </div>

      <!-- 统一底部操作栏 -->
      <div class="flex gap-2 mt-4 pt-3 border-t">
        <VaButton size="small" preset="secondary" @click="addItem(gpuItems, { model: 'RTX 3060', count: 1 })">+ GPU</VaButton>
        <VaButton size="small" preset="secondary" @click="addItem(nicItems, { model: 'Intel X550-T2', count: 1 })">+ LAN</VaButton>
        <VaButton size="small" preset="secondary" @click="addItem(raidItems, { model: '基础 RAID', count: 1 })">+ RAID</VaButton>
      </div>
    </div>

    <div class="expansion-summary">
      <VaChip color="info" outline size="small">总预估功耗: {{ expansionPower }}W</VaChip>
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

.expansion-summary {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-2);
}

.mt-3 { margin-top: var(--space-3); }
.mt-4 { margin-top: var(--space-4); }
.mb-2 { margin-bottom: var(--space-2); }
.pt-3 { padding-top: var(--space-3); }
</style>

<!-- src/components/ConfigPlan/PowerAnalysis.vue -->
<template>
  <VaCard>
    <VaCardTitle>功耗分析</VaCardTitle>
    <VaCardContent>
      <div class="power-analysis">

        <div class="power-breakdown">
          <div class="power-item">
            <span class="power-label">CPU</span>
            <span class="power-value">{{ cpuPower }}W</span>
          </div>
          <div class="power-item">
            <span class="power-label">主板</span>
            <span class="power-value">{{ motherboardPower }}W</span>
          </div>
          <div class="power-item">
            <span class="power-label">内存</span>
            <span class="power-value">{{ memoryPower }}W</span>
          </div>
          <div class="power-item">
            <span class="power-label">存储</span>
            <span class="power-value">{{ storagePower }}W</span>
          </div>
          <div class="power-item">
            <span class="power-label">扩展设备</span>
            <span class="power-value">{{ expansionPower }}W</span>
          </div>
        </div>

        <VaDivider />

        <div class="power-total">
          <div class="total-row">
            <span class="total-label">预估总功耗</span>
            <span class="total-value">{{ totalPower }}W</span>
          </div>
          <div class="total-row">
            <span class="total-label">建议电源</span>
            <span class="total-value recommended">{{ recommendedPSU }}W</span>
          </div>
        </div>

        <VaProgressBar :model-value="(totalPower / recommendedPSU) * 100" :color="powerColor" class="mt-3">
          负载率: {{ Math.round((totalPower / recommendedPSU) * 100) }}%
        </VaProgressBar>

        <VaAlert v-if="totalPower / recommendedPSU > 0.85" color="warning" border="top" class="mt-3">
          功耗较高，建议选择更大功率电源或优化配置
        </VaAlert>

      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup>
import { VaCard, VaCardTitle, VaCardContent, VaDivider, VaProgressBar, VaAlert } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useConfigPlanStore } from '../../stores/configPlan'

const store = useConfigPlanStore()
const {
  cpuPower, motherboardPower, memoryPower, storagePower, expansionPower,
  totalPower, recommendedPSU, powerColor,
} = storeToRefs(store)
</script>

<style scoped>
.power-analysis { display: flex; flex-direction: column; gap: var(--space-4); }

.power-breakdown { display: flex; flex-direction: column; gap: var(--space-2); }
.power-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
}
.power-label { color: var(--color-text-secondary); }
.power-value { font-weight: 600; color: var(--color-text-primary); }

.power-total { display: flex; flex-direction: column; gap: var(--space-2); }
.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--color-stat-bg);
  border-radius: var(--radius-md);
}
.total-label { font-size: var(--text-base); font-weight: var(--font-weight-semibold); color: var(--color-stat-primary); }
.total-value { font-size: var(--text-xl); font-weight: var(--font-weight-bold); color: var(--color-stat-primary); }
.total-value.recommended { color: var(--color-stat-success); }
</style>

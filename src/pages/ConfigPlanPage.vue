<!-- src/pages/ConfigPlanPage.vue -->
<template>
  <div class="config-plan-page">
    <h1 class="page-title">服务器配置方案</h1>

    <div class="config-container">
      <!-- 左侧：硬件选择区 -->
      <VaCard class="selection-panel">
        <VaCardTitle>硬件选择</VaCardTitle>
        <VaCardContent>
          <div class="hardware-form">
            <CpuSelector />
            <VaDivider />
            <MotherboardSelector />
            <VaDivider />
            <MemorySelector />
            <VaDivider />
            <StorageSelector />
            <VaDivider />
            <ExpansionSelector />
          </div>
        </VaCardContent>
      </VaCard>

      <!-- 右侧：总览 + 功耗 + 兼容性 -->
      <div class="summary-panel">
        <ConfigSummary />
        <PowerAnalysis class="mt-4" />
        <CompatibilityAlert class="mt-4" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { VaCard, VaCardTitle, VaCardContent, VaDivider } from 'vuestic-ui'
import CpuSelector        from '../components/ConfigPlan/CpuSelector.vue'
import MotherboardSelector from '../components/ConfigPlan/MotherboardSelector.vue'
import MemorySelector     from '../components/ConfigPlan/MemorySelector.vue'
import StorageSelector    from '../components/ConfigPlan/StorageSelector.vue'
import ExpansionSelector  from '../components/ConfigPlan/ExpansionSelector.vue'
import ConfigSummary      from '../components/ConfigPlan/ConfigSummary.vue'
import PowerAnalysis      from '../components/ConfigPlan/PowerAnalysis.vue'
import CompatibilityAlert from '../components/ConfigPlan/CompatibilityAlert.vue'
</script>

<style scoped>
.config-plan-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.config-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-6);
  flex: 1;
  min-height: 0;
}

.selection-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 让 VaCard 内部的 VaCardContent 承担滚动 */
.selection-panel :deep(.va-card__content) {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.hardware-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding-bottom: var(--space-8);
}

.summary-panel {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: var(--space-4);
}

@media (max-width: 1280px) {
  .config-container {
    grid-template-columns: 1fr;
  }
  .summary-panel {
    position: static;
  }
}
</style>

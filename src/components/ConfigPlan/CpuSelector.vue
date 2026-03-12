<!-- src/components/ConfigPlan/CpuSelector.vue -->
<template>
  <div class="form-section">
    <h3 class="section-title">
      <VaIcon name="mdi-chip" size="small" />
      处理器 (CPU)
    </h3>
    <div class="input-wrapper relative">
      <!-- 整体容器 -->
      <div class="flex items-center w-full">
        <!-- 左半区 (50%)：包含核心数 + 型号搜索 -->
        <div class="flex gap-2 items-end" style="width: 50%;">
          <!-- 核心数下拉框 (严格锁定 120px) -->
          <VaSelect
            v-model="cpuCoresFilter"
            :options="[8, 16, 24, 32, 48, 64, 96, 128]"
            label="核心数"
            placeholder="核心"
            clearable
            style="width: 120px; min-width: 120px; flex: 0 0 120px;"
            @update:model-value="handleCpuSearch"
          />

          <!-- 型号输入框 (占据左半区所有剩余空间) -->
          <VaInput
            v-model="cpuKeyword"
            label="CPU 型号"
            placeholder="型号搜索..."
            clearable
            :loading="loadingCpuDetail"
            style="flex-grow: 1 !important;"
            @update:model-value="handleCpuSearch"
            @clear="clearCpu"
          >
            <template #prependInner>
              <VaIcon name="mdi-magnify" size="small" />
            </template>
          </VaInput>
        </div>

        <!-- 右半区 (50%)：留白 -->
        <div style="width: 50%;"></div>
      </div>
  <!-- 搜索建议列表 -->

      <!-- 搜索建议列表：移入 relative 容器内，防止覆盖输入框 -->
      <div v-if="cpuSuggestions.length > 0" class="suggestions-list">
        <div
          v-for="cpu in cpuSuggestions"
          :key="cpu.id"
          class="suggestion-item"
          @click="selectCpu(cpu)"
        >
          <div class="suggestion-main">
            <strong>{{ cpu.cpu_short_name }}</strong>
            <VaChip size="small" color="info">{{ cpu.tdp }}W</VaChip>
          </div>
          <div class="suggestion-sub">
            {{ cpu.cores }}C/{{ cpu.threads }}T · {{ cpu.base_freq }}
          </div>
        </div>
      </div>
    </div>

    <!-- 已选 CPU 详情 -->
    <div v-if="selectedCpu" class="selected-item-card mt-3">
      <div class="card-header">
        <span class="item-name">{{ selectedCpu.cpu_short_name }}</span>
        <VaButton preset="plain" icon="mdi-close" size="small" color="danger" @click="clearCpu" />
      </div>

      <div class="item-details-grid">
        <div class="detail-tile">
          <span class="tile-label">核心 / 线程</span>
          <span class="tile-value">{{ selectedCpu.cores }}C / {{ selectedCpu.threads }}T</span>
        </div>
        <div class="detail-tile">
          <span class="tile-label">主频 (Base/Turbo)</span>
          <span class="tile-value">{{ selectedCpu.base_freq }} / {{ selectedCpu.turbo_freq }}</span>
        </div>
        <div class="detail-tile">
          <span class="tile-label">封装接口 (Socket)</span>
          <span class="tile-value">{{ formattedSocket }}</span>
        </div>
        <div class="detail-tile highlight-tile">
          <span class="tile-label">TDP 功耗</span>
          <span class="tile-value-large">{{ selectedCpu.tdp }}W</span>
        </div>
        <div class="detail-tile full-width">
          <span class="tile-label">内存支持</span>
          <span class="tile-value">{{ selectedCpu.memory_speed }} {{ selectedCpu.max_memory_speed }}</span>
        </div>
      </div>

      <!-- CPU 数量控制 -->
      <div class="cpu-count-section mt-4">
        <div class="count-header">
          <span class="count-label">{{ cpuCountLabel }}</span>
          <VaChip size="small" preset="outline" color="secondary">
            {{ cpuScalability.max > 1 ? `支持双路/多路` : '仅支持单路' }}
          </VaChip>
        </div>
        <div class="count-stepper">
          <VaButton
            :disabled="cpuScalability.disabled || cpuCount <= cpuScalability.min"
            icon="mdi-minus"
            preset="secondary"
            size="small"
            @click="cpuCount--"
          />
          <VaInput
            v-model.number="cpuCount"
            :disabled="cpuScalability.disabled"
            inputmode="numeric"
            class="count-input"
            @blur="validateCpuCount"
          />
          <VaButton
            :disabled="cpuScalability.disabled || cpuCount >= cpuScalability.max"
            icon="mdi-plus"
            preset="secondary"
            size="small"
            @click="cpuCount++"
          />
        </div>
      </div>

      <VaAlert v-if="cpuScalability.max > 1" color="primary" border="left" class="mt-3" dense>
        当前 CPU 已开启多路并行计算支持
      </VaAlert>
    </div>
  </div>
</template>

<script setup>
import { VaInput, VaIcon, VaButton, VaChip, VaAlert, VaSelect } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useConfigPlanStore } from '../../stores/configPlan'

const store = useConfigPlanStore()
const {
  cpuKeyword, cpuCoresFilter, cpuSuggestions, selectedCpu, cpuCount, loadingCpuDetail,
  cpuScalability, cpuCountLabel, formattedSocket
} = storeToRefs(store)

const {
  handleCpuSearch, selectCpu, clearCpu, validateCpuCount
} = store
</script>

<style scoped>
.cpu-count-section {
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
}

.count-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.count-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.count-stepper {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-bg-page);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  width: fit-content;
}

.count-input {
  width: 60px;
}
.count-input :deep(input) {
  text-align: center;
  font-weight: 700;
  font-size: var(--text-md);
}
</style>

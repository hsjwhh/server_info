<!-- src/components/ConfigPlan/CpuSelector.vue -->
<template>
  <div class="form-section">
    <h3 class="section-title">
      <VaIcon name="mdi-chip" size="small" />
      处理器 (CPU)
    </h3>

    <div class="input-wrapper">
      <VaInput
        v-model="cpuKeyword"
        label="CPU 型号"
        placeholder="输入 CPU 关键字搜索..."
        clearable
        :loading="loadingCpuDetail"
        @input="handleCpuSearch"
        @clear="clearCpu"
      >
        <template #prependInner>
          <VaIcon name="mdi-magnify" size="small" />
        </template>
      </VaInput>
    </div>

    <!-- 搜索建议列表 -->
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

    <!-- 已选 CPU 详情 -->
    <div v-if="selectedCpu" class="selected-item">
      <div class="selected-header">
        <span class="selected-name">{{ selectedCpu.cpu_short_name }}</span>
        <VaButton preset="plain" icon="mdi-close" size="small" @click="clearCpu" />
      </div>

      <div class="selected-details">
        <div class="detail-row">
          <span class="label">核心/线程:</span>
          <span>{{ selectedCpu.cores }}C / {{ selectedCpu.threads }}T</span>
        </div>
        <div class="detail-row">
          <span class="label">基频/睿频:</span>
          <span>{{ selectedCpu.base_freq }} / {{ selectedCpu.turbo_freq }}</span>
        </div>
        <div class="detail-row">
          <span class="label">TDP:</span>
          <VaChip color="primary">{{ selectedCpu.tdp }} W</VaChip>
        </div>
        <div class="detail-row">
          <span class="label">支持内存:</span>
          <span>{{ selectedCpu.memory_speed }} {{ selectedCpu.max_memory_speed }}</span>
        </div>
        <div class="detail-row">
          <span class="label">封装接口:</span>
          <span>{{ formattedSocket }}</span>
        </div>
      </div>

      <!-- CPU 数量控制 -->
      <div class="cpu-count-control">
        <label class="va-input-label">{{ cpuCountLabel }}</label>
        <div class="count-input-group">
          <VaButton
            :disabled="cpuScalability.disabled || cpuCount <= cpuScalability.min"
            icon="mdi-minus"
            size="small"
            @click="cpuCount--"
          />
          <VaInput
            v-model.number="cpuCount"
            :disabled="cpuScalability.disabled"
            inputmode="numeric"
            style="width: 80px; text-align: center;"
            class="mx-2"
            @blur="validateCpuCount"
          />
          <VaButton
            :disabled="cpuScalability.disabled || cpuCount >= cpuScalability.max"
            icon="mdi-plus"
            size="small"
            @click="cpuCount++"
          />
        </div>
      </div>

      <VaAlert v-if="cpuScalability.max > 1" color="info" border="left" class="mt-2" dense>
        此 CPU 支持最多 {{ cpuScalability.max }} 路配置
      </VaAlert>
    </div>
  </div>
</template>

<script setup>
import { VaInput, VaIcon, VaButton, VaChip, VaAlert } from 'vuestic-ui'
import { useConfigPlan } from '../../composables/useConfigPlan'

const {
  cpuKeyword, cpuSuggestions, selectedCpu, cpuCount, loadingCpuDetail,
  cpuScalability, cpuCountLabel, formattedSocket,
  handleCpuSearch, selectCpu, clearCpu, validateCpuCount,
} = useConfigPlan()
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.input-wrapper {
  width: 100%;
  overflow: hidden;
}

.suggestions-list {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-top: calc(-1 * var(--space-4));
  z-index: 10;
  box-shadow: var(--shadow-md);
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  border-bottom: 1px solid var(--color-border-subtle);
  transition: background 0.2s;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: var(--color-bg-hover); }

.suggestion-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}
.suggestion-sub {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
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

.cpu-count-control { margin-top: var(--space-3); }
.cpu-count-control .va-input-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}
.count-input-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.count-input-group .va-input input { text-align: center; font-weight: 600; }
.count-input-group .va-input input::-webkit-outer-spin-button,
.count-input-group .va-input input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.count-input-group .va-input input[type=number] { -moz-appearance: textfield; }
</style>

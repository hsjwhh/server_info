<!-- src/components/ConfigPlan/CpuSelector.vue -->
<template>
  <div class="form-section">
    <h3 class="section-title">
      <VaIcon name="mdi-chip" size="small" />
      处理器 (CPU)
    </h3>
    <div ref="inputWrapperRef" class="input-wrapper relative">
      <!-- 整体容器 -->
      <div class="flex w-full gap-4">
        <!-- 左半区 (50%)：包含核心数 + 型号搜索 -->
        <div class="flex gap-2" style="width: 50%;">
          <!-- 核心数下拉框 -->
          <VaSelect
            v-model="cpuCoresFilter"
            :options="[8, 16, 24, 32, 48, 64, 96, 128]"
            label="核心数"
            placeholder="核心"
            clearable
            style="width: 100px; min-width: 100px;"
            @update:model-value="handleCoresChange"
          />

          <!-- 型号输入框 -->
          <VaInput
            v-model="cpuKeyword"
            label="CPU 型号"
            placeholder="型号搜索..."
            clearable
            :loading="loadingCpuDetail"
            class="flex-grow"
            @update:model-value="handleCpuSearch"
            @clear="clearCpu"
          >
            <template #prependInner>
              <VaIcon name="mdi-magnify" size="small" />
            </template>
          </VaInput>
        </div>

        <!-- 右半区 (50%)：采用占位符方案对齐按钮 -->
        <div style="width: 50%;">
          <div class="flex flex-col">
            <div style="height: 20px;"></div> <!-- Label 占位 -->
            <VaButton
              v-if="isAdmin"
              preset="secondary"
              icon="mdi-plus"
              class="add-hw-btn"
              @click="$emit('add-cpu')"
            >
              录入新 CPU 型号
            </VaButton>
          </div>
        </div>
      </div>

      <!-- 搜索建议列表 -->
      <div v-if="showSuggestions && cpuSuggestions.length > 0" class="suggestions-list">
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
        <div class="flex gap-2">
          <VaButton
            preset="plain"
            icon="mdi-pencil"
            size="small"
            title="修改 CPU 规格"
            @click="$emit('edit-cpu', selectedCpu)"
          />
          <VaButton preset="plain" icon="mdi-close" size="small" color="danger" @click="clearCpu" />
        </div>
      </div>

      <div class="item-details-grid">
        <div class="detail-tile">
          <span class="tile-label">核心 / 线程</span>
          <span class="tile-value">{{ selectedCpu.cores }}C / {{ selectedCpu.threads }}T</span>
        </div>
        <div class="detail-tile">
          <span class="tile-label">主频 (Base/Turbo)</span>
          <span class="tile-value">{{ selectedCpu.base_freq }} / {{ selectedCpu.max_turbo }}</span>
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
          <span class="tile-value">{{ selectedCpu.memory_speed }}（最高 {{ selectedCpu.max_memory_speed }}）· {{ selectedCpu.memory_channels }} 通道</span>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { VaInput, VaIcon, VaButton, VaChip, VaSelect } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useConfigPlanStore } from '../../stores/configPlan'
import { usePermission } from '../../composables/usePermission'

const store = useConfigPlanStore()
const {
  cpuKeyword, cpuCoresFilter, cpuSuggestions, showSuggestions, selectedCpu, cpuCount, loadingCpuDetail,
  cpuScalability, cpuCountLabel, formattedSocket
} = storeToRefs(store)

const { isAdmin } = usePermission()

const {
  handleCpuSearch, handleCoresChange, closeSuggestions, selectCpu, clearCpu, validateCpuCount
} = store

const inputWrapperRef = ref(null)

const handleClickOutside = (e) => {
  if (inputWrapperRef.value && !inputWrapperRef.value.contains(e.target)) {
    closeSuggestions()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.relative {
  position: relative;
}

.add-hw-btn {
  height: 36px;
  white-space: nowrap;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

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

<!-- src/components/ConfigPlan/MotherboardSelector.vue -->
<template>
  <div class="form-section">
    <h3 class="section-title">
      <VaIcon name="mdi-resistor-nodes" size="small" />
      主板
    </h3>

    <!-- 状态 A: 尚未选择 CPU -->
    <div v-if="!selectedCpu" class="empty-placeholder">
      <VaIcon name="mdi-cpu-64-bit" size="large" color="secondary" />
      <p>请先在上方选择 CPU 以匹配兼容主板</p>
    </div>

    <!-- 状态 B: 已选 CPU 但接口数据缺失 -->
    <div v-else-if="!selectedCpu.socket" class="empty-placeholder warning-border">
      <VaIcon name="mdi-alert-circle-outline" size="large" color="warning" />
      <p>当前 CPU ({{ selectedCpu.cpu_short_name }}) 接口信息缺失</p>
      <span class="text-xs text-gray-500 mt-1">无法自动匹配主板，请先修改 CPU 规格或手动录入主板</span>
    </div>

    <div v-else class="selector-content">
      <!-- 状态 C: 已选 CPU 且有接口数据 -->
      <div class="flex gap-4">
        <VaSelect
          v-model="selectedMotherboard"
          label="选择主板"
          :placeholder="compatibleMotherboards.length > 0 ? '选择兼容的主板...' : '库中暂无兼容主板'"
          :options="compatibleMotherboards"
          text-by="model"
          value-by="model"
          searchable
          clearable
          class="flex-grow"
          :disabled="compatibleMotherboards.length === 0"
        >
          <template #prependInner>
            <VaIcon name="mdi-expansion-card" size="small" />
          </template>
        </VaSelect>
        
        <div class="flex flex-col">
          <div style="height: 20px;"></div> <!-- Label 占位 -->
          <VaButton
            v-if="isAdmin"
            preset="secondary"
            icon="mdi-plus"
            class="add-hw-btn"
            @click="$emit('add-mb')"
          >
            录入新主板
          </VaButton>
        </div>
      </div>

      <!-- 搜索不到结果时的额外提示 -->
      <VaAlert
        v-if="compatibleMotherboards.length === 0"
        color="info"
        outline
        dense
        class="mt-3"
      >
        未找到兼容 {{ formattedSocket }} 的主板？点击右侧按钮手动补全。
      </VaAlert>

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
          
          <VaButton
            preset="plain"
            icon="mdi-pencil"
            size="small"
            title="修改主板规格"
            class="ml-2"
            @click="$emit('edit-mb', selectedMotherboardDetail)"
          />
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
import { VaIcon, VaSelect, VaChip, VaButton, VaAlert } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useConfigPlanStore } from '../../stores/configPlan'
import { usePermission } from '../../composables/usePermission'

const store = useConfigPlanStore()
const {
  selectedCpu,
  selectedMotherboard, compatibleMotherboards, selectedMotherboardDetail,
  formattedSocket
} = storeToRefs(store)

const { isAdmin } = usePermission()

const { splitItems } = store
</script>

<style scoped>
.add-hw-btn {
  height: 36px;
  white-space: nowrap;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

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

.warning-border {
  border-color: var(--va-warning);
  background: rgba(var(--va-warning-rgb), 0.05);
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

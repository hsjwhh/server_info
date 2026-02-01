<!-- src/pages/SnQuery.vue -->
<template>
  <div class="sn-query-page">
    <VaCard>
      <VaCardTitle>SN 查询</VaCardTitle>
      <VaCardContent>
        <!-- SN 输入框（自动补全） -->
        <div class="search-container">
          <VaInput
            v-model="sn"
            label="请输入 SN"
            placeholder="输入 SN 编号进行查询"
            clearable
            @keyup.enter="handleSearch"
            class="search-input"
          >
            <template #prepend>
              <VaIcon name="mdi-magnify" />
            </template>
          </VaInput>
          <VaButton
            @click="handleSearch"
            :disabled="!sn"
            class="search-button"
          >
            查询
          </VaButton>
        </div>

        <!-- 自动补全建议列表 -->
        <div v-if="suggestions.length > 0 && showSuggestions" class="suggestions-dropdown">
          <VaList>
            <VaListItem
              v-for="suggestion in suggestions"
              :key="suggestion"
              @click="selectSuggestion(suggestion)"
              clickable
            >
              <VaListItemSection icon>
                <VaIcon name="mdi-server" size="small" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>{{ suggestion }}</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
          </VaList>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- SN 详情卡片 -->
    <VaCard v-if="info" class="detail-card mt-4">
      <VaCardTitle>设备详情</VaCardTitle>
      <VaCardContent>
        <!-- 基本信息 -->
        <div class="section-title">基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">日期</span>
            <span class="info-value">{{ fullDate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">出机客户</span>
            <span class="info-value">{{ info.出机客户 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">业务</span>
            <span class="info-value">{{ info.业务 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">SN</span>
            <span class="info-value">{{ info.SN }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">数量</span>
            <span class="info-value">{{ info.数量 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">备注</span>
            <span class="info-value">{{ info.备注 || '-' }}</span>
          </div>
        </div>

        <VaDivider class="my-4" />

        <!-- 硬件配置 -->
        <div class="section-title">硬件配置</div>
        <VaDataTable
          :items="hardwareTableData"
          :columns="hardwareColumns"
          striped
          hoverable
        >
          <template #cell(model)="{ rowData }">
            <span class="hardware-model">{{ info[rowData.modelKey] || '-' }}</span>
          </template>
          <template #cell(count)="{ rowData }">
            <VaChip v-if="rowData.countKey && info[rowData.countKey]" size="small" color="primary">
              {{ info[rowData.countKey] }}
            </VaChip>
            <span v-else>-</span>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- 空状态提示 -->
    <VaCard v-else-if="searched && !info" class="mt-4">
      <VaCardContent>
        <VaInnerLoading :loading="false">
          <div class="empty-state">
            <VaIcon name="mdi-database-search" size="64px" color="secondary" />
            <p class="empty-text">未找到相关 SN 信息</p>
            <p class="empty-hint">请检查 SN 编号是否正确</p>
          </div>
        </VaInnerLoading>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import debounce from 'lodash.debounce'
import { searchSn, getSnDetail } from '../api/sn'
import {
  VaCard,
  VaCardTitle,
  VaCardContent,
  VaInput,
  VaButton,
  VaIcon,
  VaList,
  VaListItem,
  VaListItemSection,
  VaListItemLabel,
  VaDivider,
  VaDataTable,
  VaChip,
  VaInnerLoading,
  useToast
} from 'vuestic-ui'

const { init: notify } = useToast()

const sn = ref('')
const info = ref(null)
const suggestions = ref([])
const showSuggestions = ref(false)
const searched = ref(false)

/**
 * 硬件配置列定义
 */
const hardwareColumns = [
  { key: 'name', label: '硬件', sortable: false },
  { key: 'model', label: '型号', sortable: false },
  { key: 'count', label: '数量', sortable: false, width: 120 }
]

/**
 * 硬件配置表格数据
 */
const hardwareTableData = [
  { name: '机箱', modelKey: '机箱', countKey: '' },
  { name: '电源', modelKey: '电源', countKey: '' },
  { name: '主板', modelKey: '主板', countKey: '' },
  { name: 'BMC密码', modelKey: 'BMC密码', countKey: '' },
  { name: 'CPU', modelKey: 'CPU', countKey: 'CPU数量' },
  { name: '内存', modelKey: '内存', countKey: '内存数量' },
  { name: 'M.2', modelKey: 'M2', countKey: 'M2数量' },
  { name: 'SSD', modelKey: 'SSD', countKey: 'SSD数量' },
  { name: 'HDD', modelKey: 'HDD', countKey: 'HDD数量' },
  { name: '阵列卡', modelKey: '阵列卡', countKey: '阵列卡数量' },
  { name: '网卡', modelKey: '网卡', countKey: '网卡数量' },
  { name: '显卡', modelKey: '显卡', countKey: '显卡数量' },
  { name: '系统', modelKey: '系统', countKey: '' }
]

/**
 * 日期格式化
 */
const fullDate = computed(() => {
  if (!info.value) return ''
  const y = info.value.年份
  const m = String(info.value.月份).padStart(2, '0')
  const d = String(info.value.日期).padStart(2, '0')
  return `${y}-${m}-${d}`
})

/**
 * 自动补全搜索
 */
const fetchSuggestions = async (query) => {
  if (!query || query.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  try {
    const list = await searchSn(query)
    suggestions.value = list || []
    showSuggestions.value = true
  } catch (error) {
    console.error('搜索失败:', error)
    suggestions.value = []
    showSuggestions.value = false
  }
}

const debouncedFetchSuggestions = debounce(fetchSuggestions, 500)

/**
 * 监听输入变化，触发自动补全
 */
watch(sn, (newValue) => {
  if (newValue) {
    debouncedFetchSuggestions(newValue)
  } else {
    suggestions.value = []
    showSuggestions.value = false
  }
})

/**
 * 选择建议项
 */
const selectSuggestion = (suggestion) => {
  sn.value = suggestion
  showSuggestions.value = false
  handleSearch()
}

/**
 * 执行查询
 */
const handleSearch = async () => {
  if (!sn.value) {
    notify({
      message: '请输入 SN 编号',
      color: 'warning'
    })
    return
  }

  showSuggestions.value = false
  searched.value = true

  try {
    const res = await getSnDetail(sn.value)
    info.value = res

    if (!res) {
      notify({
        message: '未找到该 SN 信息',
        color: 'warning'
      })
    }
  } catch (error) {
    console.error('查询失败:', error)
    info.value = null
    notify({
      message: '查询失败，请稍后重试',
      color: 'danger'
    })
  }
}
</script>

<style scoped>
.sn-query-page {
  max-width: 1200px;
  margin: 0 auto;
}

.search-container {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.search-button {
  flex-shrink: 0;
}

.suggestions-dropdown {
  position: absolute;
  z-index: 100;
  margin-top: 0.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  max-height: 300px;
  overflow-y: auto;
}

.detail-card {
  border-radius: 0.75rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #111827;
  font-weight: 500;
}

.hardware-model {
  color: #374151;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-text {
  margin-top: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.empty-hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>

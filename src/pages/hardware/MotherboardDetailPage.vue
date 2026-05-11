<template>
  <div class="mb-detail-page">
    <div class="page-canvas">
      <!-- Breadcrumbs -->
      <div class="breadcrumbs mb-6">
        <span>Hardware Catalog</span>
        <VaIcon name="chevron_right" size="16px" class="mx-1" color="#94a3b8" />
        <span class="text-primary font-bold">Motherboard Details</span>
      </div>

      <!-- Search Section -->
      <div class="search-section mb-12">
        <div ref="searchContainerRef" class="search-input-container">
          <div class="search-input-wrapper">
            <VaIcon name="search" class="search-icon" color="#94a3b8" />
            <input 
              v-model="searchKeyword" 
              class="search-input" 
              placeholder="Search hardware model..." 
              type="text"
              @focus="showSuggestions = true"
            />
          </div>

          <!-- Autocomplete Dropdown -->
          <div v-if="showSuggestions && suggestions.length > 0" class="autocomplete-dropdown">
            <div class="suggestions-list">
              <div 
                v-for="item in suggestions" 
                :key="item.id || item.model" 
                class="suggestion-item group"
                @mousedown="selectResult(item)"
              >
                <div class="suggestion-icon">
                  <VaIcon name="developer_board" color="#154ec1" />
                </div>
                <div class="suggestion-info">
                  <p class="suggestion-name">{{ item.model }}</p>
                  <p class="suggestion-meta">
                    Socket {{ displayValue(item.sockets || item.socket) }} • {{ formatCpuNumber(item.cpu_number) }}
                  </p>
                </div>
                <div class="suggestion-badge" v-if="getMbId(item)">In Stock</div>
                <VaIcon name="arrow_forward" class="suggestion-arrow" color="#94a3b8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <VaInnerLoading :loading="loading">
        <div v-if="mb" class="bento-grid">
          <!-- Main Specs Card -->
          <div class="main-card col-span-8">
            <div class="card-header">
              <div>
                <span class="category-badge">MOTHERBOARD</span>
                <h2 class="display-title">{{ displayValue(mb.model) }}</h2>
                <p class="subtitle">{{ displayValue(mb.product_collection) }}</p>
              </div>
              <div class="header-actions">
                <VaButton 
                  v-if="mb.url" 
                  preset="secondary" 
                  border-color="#e2e8f0" 
                  class="action-btn" 
                  icon="open_in_new"
                  @click="openOfficialPage"
                >
                  Official Page
                </VaButton>
              </div>
            </div>

            <div class="specs-grid">
              <div class="spec-group">
                <p class="spec-label">Socket Type</p>
                <div class="spec-content">
                  <VaIcon name="developer_board" color="#154ec1" class="mr-2" />
                  <span class="spec-value">{{ displayValue(mb.sockets || mb.socket) }}</span>
                </div>
                <p class="spec-subtext">{{ formatCpuNumber(mb.cpu_number) }}</p>
              </div>
              <div class="spec-group">
                <p class="spec-label">Max TDP</p>
                <div class="spec-content">
                  <VaIcon name="speed" color="#154ec1" class="mr-2" />
                  <span class="spec-value">{{ formatWithUnit(mb.max_tdp, 'W') }}</span>
                </div>
              </div>
              <div class="spec-group">
                <p class="spec-label">Memory Slots</p>
                <div class="spec-content">
                  <VaIcon name="memory" color="#154ec1" class="mr-2" />
                  <span class="spec-value">{{ formatWithUnit(mb.dimm_number || mb.memory_slots, 'x DIMM') }}</span>
                </div>
                <p class="spec-subtext">{{ displayValue(mb.memory_type) }}</p>
              </div>
              <div class="spec-group full-width-spec">
                <p class="spec-label">PCIe Configuration{{ mb.pcie_number ? ` (${mb.pcie_number})` : '' }}</p>
                <div class="spec-tags mt-2">
                  <VaChip 
                    v-for="(pcie, idx) in splitSpecs(mb.pcie_list || mb.pcie_slots)" 
                    :key="idx"
                    size="small" 
                    preset="outline"
                    class="mr-2 mb-2"
                  >
                    {{ pcie }}
                  </VaChip>
                  <span v-if="splitSpecs(mb.pcie_list || mb.pcie_slots).length === 0" class="empty-value">-</span>
                </div>
              </div>
              <div class="spec-group full-width-spec">
                <p class="spec-label">Memory Capacity</p>
                <p class="spec-value text-sm mt-1">{{ displayValue(mb.max_memory) }}</p>
              </div>
            </div>
          </div>

          <!-- Visual Showcase Card -->
          <div class="visual-card col-span-4">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuArTcnjtFuNtveHsO3Qf_kgk6TnV4EqCfyyLpUqDd3dNVMwt5w2TVq0vJClTuHxAkzBcwQdPZgF-ySFhk8YbRgIKFDEbJyLrkDFnKTgx7GKvM7-pbEzGmaxjKk7BzqJbEJasOMpyJ1E-0fF70ZalTZIH5NU_ojMIlZ7_YCgppLbGrS1bAWWxP7xSxb3xgyQeDm9PdV6JJNMMn28_GktE2uolwa9eDn1rOwcrB_giOPMi2jSMoKsc_SXXSXrl8Q4moH9r-CsLJUhGJs" alt="Motherboard visual" class="visual-img" />
            <div class="visual-overlay">
              <h3 class="visual-title">Next-Gen Architecture</h3>
              <p class="visual-text">Optimized for high-performance computing and enterprise-grade data management.</p>
              <div class="certified-tag">
                <VaIcon name="verified" size="14px" class="mr-1" />
                Enterprise Validated
              </div>
            </div>
          </div>

          <!-- Detailed Info Section -->
          <div class="info-section col-span-6">
            <h4 class="info-title">Storage & M.2</h4>
            <div class="info-list">
              <div class="info-item" v-if="mb.m2">
                <div class="info-item-label">
                  <VaIcon name="storage" size="small" class="mr-2" /> M.2 Interface
                </div>
                <div class="info-item-value text-xs">
                  <div v-for="(item, idx) in splitSpecs(mb.m2)" :key="idx">{{ item }}</div>
                </div>
              </div>
              <div class="info-item border-none" v-if="mb.input">
                <div class="info-item-label">
                  <VaIcon name="settings_input_component" size="small" class="mr-2" /> I/O Controller
                </div>
                <div class="info-item-value text-xs">
                  <div v-for="(item, idx) in splitSpecs(mb.input)" :key="idx">{{ item }}</div>
                </div>
              </div>
              <div v-if="!mb.m2 && !mb.input" class="empty-value">-</div>
            </div>
          </div>

          <!-- API Field Summary -->
          <div class="info-section col-span-6">
            <h4 class="info-title">Field Summary</h4>
            <div class="lifecycle-grid">
              <div class="lifecycle-box">
                <p class="box-label">CPU Sockets</p>
                <p class="box-value">{{ displayValue(mb.cpu_number) }}</p>
              </div>
              <div class="lifecycle-box">
                <p class="box-label">PCIe Count</p>
                <p class="box-value">{{ displayValue(mb.pcie_number) }}</p>
              </div>
              <div class="lifecycle-box">
                <p class="box-label">DIMM Count</p>
                <p class="box-value">{{ displayValue(mb.dimm_number || mb.memory_slots) }}</p>
              </div>
              <div class="lifecycle-box">
                <p class="box-label">Socket</p>
                <p class="box-value">{{ displayValue(mb.sockets || mb.socket) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!loading" class="empty-state py-12 text-center">
          <VaIcon name="mdi-developer-board-off" size="64px" color="#94a3b8" />
          <h3 class="text-xl font-bold mt-4">未找到主板信息</h3>
          <p class="text-secondary mt-2">该型号可能已下架或不在数据库中</p>
          <VaButton class="mt-6" @click="$router.back()">返回上一页</VaButton>
        </div>
      </VaInnerLoading>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMotherboardDetail, searchMotherboard } from '../../api/configPlan'
import { VaButton, VaIcon, VaInnerLoading, VaChip } from 'vuestic-ui'
import debounce from 'lodash.debounce'

const route = useRoute()
const router = useRouter()
const mb = ref(null)
const loading = ref(false)
const searchKeyword = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
const searchContainerRef = ref(null)

const displayValue = (val) => {
  if (val === undefined || val === null || val === '') return '-'
  return String(val).replace(/[\r\n]+/g, ' ').trim() || '-'
}

const formatWithUnit = (val, unit) => {
  const value = displayValue(val)
  if (value === '-') return '-'
  const normalizedUnit = unit.trim()
  return value.toLowerCase().endsWith(normalizedUnit.toLowerCase())
    ? value
    : `${value}${unit.startsWith(' ') ? '' : ' '}${unit}`
}

const formatCpuNumber = (val) => {
  const value = displayValue(val)
  if (value === '-') return 'Processor Support'
  return /^\d+$/.test(value) ? `${value}x Processor Support` : `${value} Processor Support`
}

/**
 * 拆分规格字符串（如 PCIe 列表），清理多余标点
 */
const splitSpecs = (str) => {
  if (!str) return []
  return String(str).split(/[;；,\n\r]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

const getMbId = (item) => item?.hashId || item?.id

const debouncedSearch = debounce(async (query) => {
  if (!query) {
    suggestions.value = []
    return
  }

  try {
    const results = await searchMotherboard(query)
    // 鲁棒的数据提取：支持 .data, .list 或直接数组
    const data = results.data || results.list || (Array.isArray(results) ? results : [])
    suggestions.value = data
  } catch (error) {
    console.error('Search failed:', error)
  }
}, 300)

watch(searchKeyword, (newVal) => {
  showSuggestions.value = !!newVal
  debouncedSearch(newVal)
})

const selectResult = (item) => {
  const id = getMbId(item)
  if (!id) return

  showSuggestions.value = false
  suggestions.value = []
  searchKeyword.value = item.model
  router.push({ name: 'MotherboardDetail', params: { id } })
}

const openOfficialPage = () => {
  if (mb.value?.url) window.open(mb.value.url, '_blank', 'noopener,noreferrer')
}

const handleClickOutside = (e) => {
  if (searchContainerRef.value && !searchContainerRef.value.contains(e.target)) {
    showSuggestions.value = false
  }
}

const fetchDetail = async (id) => {
  if (!id) {
    mb.value = null
    return
  }
  
  loading.value = true
  try {
    const res = await getMotherboardDetail(id)
    mb.value = res.data || res
  } catch (error) {
    console.error('Failed to fetch MB detail:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  if (route.params.id) {
    fetchDetail(route.params.id)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(() => route.params.id, (newId) => {
  if (newId) fetchDetail(newId)
})
</script>

<style scoped>
.mb-detail-page {
  padding: 24px;
}

.page-canvas {
  max-width: 1280px;
  margin: 0 auto;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Search Section */
.search-section {
  position: relative;
  z-index: 20;
}

.search-input-container {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 20px;
}

.search-input {
  width: 100%;
  height: 56px;
  padding: 0 20px 0 56px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  border-color: #154ec1;
  box-shadow: 0 0 0 4px rgba(21, 78, 193, 0.1);
}

/* Autocomplete Dropdown */
.autocomplete-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  overflow: hidden;
}

.suggestions-list {
  position: static;
  inset: auto;
  padding: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f1f5f9;
}

.suggestion-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 8px;
}

.suggestion-info {
  flex: 1;
}

.suggestion-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.suggestion-meta {
  font-size: 12px;
  color: #64748b;
  margin: 2px 0 0;
}

.suggestion-badge {
  font-size: 11px;
  font-weight: 700;
  color: #154ec1;
  background: #dbe1ff;
  padding: 2px 8px;
  border-radius: 999px;
}

.suggestion-arrow {
  opacity: 0;
  transition: all 0.2s;
}

.suggestion-item:hover .suggestion-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* Bento Grid */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.col-span-8 { grid-column: span 8; }
.col-span-4 { grid-column: span 4; }
.col-span-6 { grid-column: span 6; }

.main-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
}

.category-badge {
  display: inline-block;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 12px;
}

.display-title {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1.1;
}

.subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  height: 40px;
  font-size: 12px;
  font-weight: 700;
}

.primary-btn {
  background-color: #154ec1 !important;
  color: #ffffff;
}

/* Specs */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  padding-top: 32px;
  border-top: 1px solid #f1f5f9;
}

.spec-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width-spec {
  grid-column: span 3;
}

.spec-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
}

.spec-content {
  display: flex;
  align-items: center;
}

.spec-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.spec-subtext {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
}

/* Visual Card */
.visual-card {
  position: relative;
  background: #154ec1;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.visual-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
}

.visual-overlay {
  position: absolute;
  inset: 0;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.visual-title {
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
}

.visual-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
  line-height: 1.5;
}

.certified-tag {
  display: inline-flex;
  align-items: center;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
}

/* Info Section */
.info-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.info-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  gap: 12px;
}

.info-item-label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.info-item-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  word-break: break-word;
}

/* Lifecycle */
.lifecycle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.lifecycle-box {
  padding: 16px;
  border-radius: 12px;
  border: 1px dashed #e2e8f0;
  text-align: center;
}

.box-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.box-value {
  font-size: 14px;
  font-weight: 700;
}

.text-success { color: #10b981; }
.text-primary { color: #154ec1; }

@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  .col-span-8, .col-span-4, .col-span-6 {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .specs-grid {
    grid-template-columns: 1fr;
  }
  .lifecycle-grid {
    grid-template-columns: 1fr;
  }
}
</style>

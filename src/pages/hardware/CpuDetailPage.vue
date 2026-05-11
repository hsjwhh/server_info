<template>
  <div class="cpu-detail-page">
    <div class="page-canvas">
      <!-- Search Section -->
      <div class="search-section mb-12">
        <label class="search-label">Quick Hardware Lookup</label>
        <div ref="searchContainerRef" class="search-input-container">
          <div class="search-input-wrapper">
            <VaIcon name="search" class="search-icon" color="#94a3b8" />
            <input 
              v-model="searchKeyword" 
              class="search-input" 
              placeholder="Search CPU model, socket, or generation..." 
              type="text"
              @focus="showSuggestions = true"
            />
          </div>

          <!-- Autocomplete Dropdown -->
          <div v-if="showSuggestions && suggestions.length > 0" class="autocomplete-dropdown">
            <div class="suggestions-list">
              <div 
                v-for="item in suggestions" 
                :key="item.id || item.cpu_short_name" 
                class="suggestion-item group"
                @mousedown="selectResult(item)"
              >
                <div class="suggestion-icon">
                  <VaIcon name="memory" color="#154ec1" />
                </div>
                <div class="suggestion-info">
                  <p class="suggestion-name">{{ item.cpu_short_name }}</p>
                  <p class="suggestion-meta">
                    {{ item.generation || item.series || 'Enterprise' }}, 
                    {{ item.cores }} Cores, 
                    {{ item.socket }}
                  </p>
                </div>
                <VaIcon name="arrow_forward" class="suggestion-arrow" color="#94a3b8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <VaInnerLoading :loading="loading">
        <div v-if="cpu" class="detail-container">
          <!-- Main Detail View -->
          <div class="main-content-card">
            <!-- Header -->
            <div class="detail-header">
              <div class="header-info">
                <div class="certified-badge">
                  <VaIcon name="verified" size="14px" class="mr-1" />
                  <span>Certified Component</span>
                </div>
                <h3 class="display-title">{{ cpu.cpu_short_name }}</h3>
                <p class="subtitle">{{ cpu.generation || cpu.series || 'Architecture' }} | Enterprise Tier</p>
              </div>
              <VaButton class="deploy-button" icon="mdi-plus-circle">
                Deploy
              </VaButton>
            </div>

            <!-- Specs Grid -->
            <div class="specs-grid">
              <div class="spec-item">
                <p class="spec-label">Socket</p>
                <p class="spec-value">{{ cpu.socket }}</p>
              </div>
              <div class="spec-item">
                <p class="spec-label">Cores/Threads</p>
                <div class="flex items-baseline gap-1">
                  <span class="spec-value">{{ cpu.cores }}</span>
                  <span v-if="cpu.threads" class="spec-subvalue">/ {{ cpu.threads }}</span>
                </div>
              </div>
              <div class="spec-item">
                <p class="spec-label">TDP</p>
                <p class="spec-value">{{ formatValue(cpu.tdp) }} W</p>
              </div>
              <div class="spec-item">
                <p class="spec-label">Base Freq.</p>
                <p class="spec-value">{{ formatValue(cpu.base_freq) }} GHz</p>
              </div>
              <div class="spec-item">
                <p class="spec-label">Turbo Freq.</p>
                <p class="spec-value text-primary">{{ formatValue(cpu.turbo_freq || cpu.max_turbo) }} GHz</p>
              </div>
              <div class="spec-item">
                <p class="spec-label">L3 Cache</p>
                <p class="spec-value">{{ formatValue(cpu.cache_l3 || cpu.cache) }} MB</p>
              </div>
            </div>
          </div>

          <!-- Side Cards -->
          <div class="side-content">
            <!-- Memory Support -->
            <div class="info-card">
              <div class="info-card-header">
                <h4 class="info-card-title">Memory Support</h4>
                <VaIcon name="storage" color="#154ec1" />
              </div>
              <div class="info-list">
                <div class="info-row">
                  <span class="info-label">Type/Speed</span>
                  <span class="info-value">{{ cpu.memory_speed || (cpu.memory_type + '-' + cpu.max_memory_speed) }}</span>
                </div>
                <div class="info-row" v-if="cpu.memory_channels">
                  <span class="info-label">Max Channels</span>
                  <span class="info-value">{{ cpu.memory_channels }}</span>
                </div>
                <div class="info-row" v-if="cpu.max_memory_capacity">
                  <span class="info-label">Max Capacity</span>
                  <span class="info-value">{{ cpu.max_memory_capacity }}</span>
                </div>
                <div class="info-row border-none">
                  <span class="info-label">ECC Support</span>
                  <span class="info-value text-primary">{{ cpu.ecc_support || 'Yes' }}</span>
                </div>
              </div>
            </div>

            <!-- Visual Card -->
            <div class="visual-card">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9eji9zDj9cSWp-0VzHDw7XvJ8dpIIsBvBoD4IukVV4P0MbNCAx_OYZr2HOHqS95ksaQaQxhbQLqPFAlr75IFfya_K5MQTdmJLt9qTcXOsSd-k7MUtaf3GQqu1o-rpJV8DRwCF0vtJGS4bCqTCGz2hhEAU4t6h13GxKGhIfc8XEMYqvzHqMqHPzz-6xe_lVXuwXlLupkcSCMP7etZD_4H3DKdMFMKPvjs383dLArVGuy9EkMR0TkLaF6OQ4EiPKb7XgnjAUyR3Hzw" alt="CPU visual" class="visual-img" />
              <div class="visual-overlay">
                <p class="visual-label">Architecture</p>
                <h4 class="visual-title">Enterprise Computing</h4>
              </div>
            </div>
          </div>

          <!-- Benchmark Section -->
          <div class="benchmark-section">
            <h4 class="section-title mb-6">Benchmark Performance</h4>
            <div class="benchmark-grid">
              <div class="benchmark-item">
                <p class="bench-label">Passmark Score</p>
                <p class="bench-value text-primary">42,881</p>
                <div class="progress-bg"><div class="progress-fill bg-primary" style="width: 85%"></div></div>
              </div>
              <div class="benchmark-item">
                <p class="bench-label">Single Thread</p>
                <p class="bench-value">2,341</p>
                <div class="progress-bg"><div class="progress-fill bg-secondary" style="width: 65%"></div></div>
              </div>
              <div class="benchmark-item">
                <p class="bench-label">Power Efficiency</p>
                <p class="bench-value">A+</p>
                <div class="progress-bg"><div class="progress-fill bg-primary" style="width: 95%"></div></div>
              </div>
              <div class="benchmark-item">
                <p class="bench-label">Heat Index</p>
                <p class="bench-value text-danger">78°C</p>
                <div class="progress-bg"><div class="progress-fill bg-danger" style="width: 78%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!loading" class="empty-state py-12 text-center">
          <VaIcon name="mdi-database-off-outline" size="64px" color="secondary" />
          <h3 class="text-xl font-bold mt-4">未找到处理器信息</h3>
          <p class="text-secondary mt-2">请尝试搜索其他型号或返回列表</p>
          <VaButton class="mt-6" @click="$router.back()">返回上一页</VaButton>
        </div>
      </VaInnerLoading>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCpuDetail, searchCpu } from '../../api/configPlan'
import { VaButton, VaIcon, VaInnerLoading } from 'vuestic-ui'
import debounce from 'lodash.debounce'

const route = useRoute()
const router = useRouter()
const cpu = ref(null)
const loading = ref(false)
const searchKeyword = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
const searchContainerRef = ref(null)

/**
 * 格式化数值：剥离单位并确保纯数字展示，防止重复单位
 */
const formatValue = (val) => {
  if (val === undefined || val === null || val === '') return '-'
  return String(val).replace(/[A-Za-z\s']+/g, '').trim()
}

const mainSpecs = computed(() => [
  { label: 'Cores / Threads', value: `${cpu.value?.cores}C / ${cpu.value?.threads}T`, icon: 'mdi-cpu-64-bit' },
  { label: 'Frequency', value: `${cpu.value?.base_freq} - ${cpu.value?.turbo_freq} GHz`, icon: 'mdi-speedometer' },
  { label: 'L3 Cache', value: `${cpu.value?.cache_l3} MB`, icon: 'mdi-cache' },
])

const debouncedSearch = debounce(async (query) => {
  if (!query) {
    suggestions.value = []
    return
  }

  try {
    const results = await searchCpu({ keyword: query })
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
  showSuggestions.value = false
  suggestions.value = []
  searchKeyword.value = item.cpu_short_name
  router.push({ name: 'CpuDetail', params: { id: item.id } })
}

const handleClickOutside = (e) => {
  if (searchContainerRef.value && !searchContainerRef.value.contains(e.target)) {
    showSuggestions.value = false
  }
}

const fetchDetail = async (id) => {
  if (!id) {
    cpu.value = null
    return
  }
  
  loading.value = true
  try {
    const res = await getCpuDetail(id)
    cpu.value = res.data || res
  } catch (error) {
    console.error('Failed to fetch CPU detail:', error)
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
.cpu-detail-page {
  padding: 24px;
}

.page-canvas {
  max-width: 1200px;
  margin: 0 auto;
}

/* Search Section */
.search-section {
  position: relative;
  z-index: 20;
}

.search-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  padding-left: 4px;
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
  left: 16px;
}

.search-input {
  width: 100%;
  height: 56px;
  padding: 0 16px 0 48px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  border-color: #154ec1;
  box-shadow: 0 0 0 3px rgba(21, 78, 193, 0.1);
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

.suggestion-arrow {
  opacity: 0;
  transition: all 0.2s;
}

.suggestion-item:hover .suggestion-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* Detail Layout */
.detail-container {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}

.main-content-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* Header */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.certified-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 16px;
}

.display-title {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1.1;
}

.subtitle {
  font-size: 16px;
  color: #64748b;
  margin-top: 8px;
}

.deploy-button {
  background-color: #154ec1 !important;
  color: #ffffff;
  height: 40px;
  font-weight: 600;
}

/* Specs Grid */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  padding-top: 32px;
  border-top: 1px solid #f1f5f9;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.spec-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.spec-subvalue {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* Side Cards */
.side-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.info-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.info-card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

/* Visual Card */
.visual-card {
  position: relative;
  background: #154ec1;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.visual-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}

.visual-title {
  font-size: 20px;
  color: #ffffff;
  font-weight: 900;
  margin: 0;
}

/* Benchmark */
.benchmark-section {
  grid-column: span 2;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.benchmark-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.benchmark-item {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bench-label {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.bench-value {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.progress-bg {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 999px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
}

.bg-primary { background-color: #154ec1; }
.bg-secondary { background-color: #64748b; }
.bg-danger { background-color: #ef4444; }

@media (max-width: 1024px) {
  .detail-container {
    grid-template-columns: 1fr;
  }
  .benchmark-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .specs-grid {
    grid-template-columns: 1fr;
  }
  .benchmark-grid {
    grid-template-columns: 1fr;
  }
}
</style>

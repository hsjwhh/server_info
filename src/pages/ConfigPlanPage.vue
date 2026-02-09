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
            <!-- CPU 选择 -->
            <div class="form-section">
              <h3 class="section-title">
                <VaIcon name="mdi-chip" size="small" />
                处理器 (CPU)
              </h3>
              <div class="form-row">
                <VaInput
                  v-model="cpuKeyword"
                  label="CPU 型号"
                  placeholder="输入 CPU 关键字搜索..."
                  clearable
                  @input="handleCpuSearch"
                >
                  <template #prependInner>
                    <VaIcon name="mdi-magnify" size="small" />
                  </template>
                </VaInput>
              </div>

              <!-- CPU 搜索结果下拉列表 -->
              <div v-if="cpuSuggestions.length > 0" class="suggestions-list">
                <div
                  v-for="cpu in cpuSuggestions"
                  :key="cpu.cpu_short_name"
                  class="suggestion-item"
                  @click="selectCpu(cpu)"
                >
                  <div class="suggestion-main">
                    <strong>{{ cpu.cpu_short_name }}</strong>
                    <VaChip size="small" color="info">{{ cpu.tdp }}W</VaChip>
                  </div>
                  <div class="suggestion-sub">
                    {{ cpu.cores }}C/{{ cpu.threads }}T · {{ cpu.base_freq }}GHz
                  </div>
                </div>
              </div>

              <!-- 已选择的 CPU -->
              <div v-if="selectedCpu" class="selected-item">
                <div class="selected-header">
                  <span class="selected-name">{{ selectedCpu.cpu_short_name }}</span>
                  <VaButton
                    preset="plain"
                    icon="mdi-close"
                    size="small"
                    @click="clearCpu"
                  />
                </div>
                <div class="selected-details">
                  <div class="detail-row">
                    <span class="label">核心/线程:</span>
                    <span>{{ selectedCpu.cores }}C / {{ selectedCpu.threads }}T</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">基频/睿频:</span>
                    <span>{{ selectedCpu.base_freq }}GHz / {{ selectedCpu.turbo_freq }}GHz</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">TDP:</span>
                    <span class="highlight">{{ selectedCpu.tdp }}W</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">支持内存:</span>
                    <span>{{ selectedCpu.memory_type }} {{ selectedCpu.max_memory_speed }}MHz</span>
                  </div>
                </div>

                <!-- CPU 数量 -->
                <VaCounter
                  v-model="cpuCount"
                  label="数量"
                  :min="1"
                  :max="8"
                  class="mt-3"
                />
              </div>
            </div>

            <VaDivider />

            <!-- 主板选择 -->
            <div class="form-section">
              <h3 class="section-title">
                <VaIcon name="mdi-resistor-nodes" size="small" />
                主板
              </h3>
              
              <VaAlert v-if="!selectedCpu" color="info" border="top">
                请先选择 CPU 型号
              </VaAlert>

              <div v-else>
                <!-- 主板搜索/选择 -->
                <VaSelect
                  v-model="selectedMotherboard"
                  label="选择主板"
                  placeholder="选择兼容的主板..."
                  :options="compatibleMotherboards"
                  text-by="model"
                  value-by="model"
                  searchable
                  clearable
                >
                  <template #prepend>
                    <VaIcon name="mdi-expansion-card" size="small" />
                  </template>
                </VaSelect>

                <!-- 已选主板详情 -->
                <div v-if="selectedMotherboardDetail" class="selected-item mt-3">
                  <div class="selected-header">
                    <span class="selected-name">{{ selectedMotherboardDetail.model }}</span>
                  </div>
                  <div class="selected-details">
                    <div class="detail-row">
                      <span class="label">芯片组:</span>
                      <span>{{ selectedMotherboardDetail.chipset }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">内存插槽:</span>
                      <span>{{ selectedMotherboardDetail.memory_slots }} × {{ selectedMotherboardDetail.memory_type }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">最大内存:</span>
                      <span>{{ selectedMotherboardDetail.max_memory }}GB</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">PCIe 插槽:</span>
                      <span>{{ selectedMotherboardDetail.pcie_slots }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">功耗:</span>
                      <span class="highlight">{{ selectedMotherboardDetail.power || 50 }}W</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <VaDivider />

            <!-- 内存选择 -->
            <div class="form-section">
              <h3 class="section-title">
                <VaIcon name="mdi-memory" size="small" />
                内存
              </h3>

              <VaAlert v-if="!selectedCpu" color="info" border="top">
                请先选择 CPU 型号
              </VaAlert>

              <div v-else class="form-group">
                <VaSelect
                  v-model="memoryType"
                  label="内存类型"
                  :options="memoryOptions"
                  :disabled="!!selectedCpu"
                >
                  <template #prepend>
                    <VaIcon name="mdi-chip" size="small" />
                  </template>
                </VaSelect>

                <VaSelect
                  v-model="memoryCapacity"
                  label="单条容量"
                  :options="memoryCapacityOptions"
                  class="mt-3"
                >
                  <template #prepend>
                    <VaIcon name="mdi-database" size="small" />
                  </template>
                </VaSelect>

                <VaCounter
                  v-model="memoryCount"
                  label="数量"
                  :min="1"
                  :max="maxMemorySlots"
                  class="mt-3"
                />

                <div class="memory-summary mt-3">
                  <VaChip color="primary">
                    总容量: {{ totalMemory }}GB
                  </VaChip>
                  <VaChip color="warning">
                    预估功耗: {{ memoryPower }}W
                  </VaChip>
                </div>
              </div>
            </div>

            <VaDivider />

            <!-- 存储选择 -->
            <div class="form-section">
              <h3 class="section-title">
                <VaIcon name="mdi-harddisk" size="small" />
                存储设备
              </h3>

              <!-- M.2 SSD -->
              <div class="storage-group">
                <VaCheckbox v-model="hasM2" label="M.2 NVMe SSD" />
                <div v-if="hasM2" class="storage-config">
                  <VaSelect
                    v-model="m2Capacity"
                    label="容量"
                    :options="['256GB', '512GB', '1TB', '2TB']"
                    size="small"
                  />
                  <VaCounter v-model="m2Count" :min="1" :max="4" size="small" />
                </div>
              </div>

              <!-- SATA SSD -->
              <div class="storage-group">
                <VaCheckbox v-model="hasSSD" label="SATA SSD" />
                <div v-if="hasSSD" class="storage-config">
                  <VaSelect
                    v-model="ssdCapacity"
                    label="容量"
                    :options="['480GB', '960GB', '1.92TB', '3.84TB']"
                    size="small"
                  />
                  <VaCounter v-model="ssdCount" :min="1" :max="8" size="small" />
                </div>
              </div>

              <!-- HDD -->
              <div class="storage-group">
                <VaCheckbox v-model="hasHDD" label="HDD 机械硬盘" />
                <div v-if="hasHDD" class="storage-config">
                  <VaSelect
                    v-model="hddCapacity"
                    label="容量"
                    :options="['2TB', '4TB', '8TB', '10TB', '12TB']"
                    size="small"
                  />
                  <VaCounter v-model="hddCount" :min="1" :max="12" size="small" />
                </div>
              </div>

              <div class="storage-summary mt-3">
                <VaChip color="info">
                  预估功耗: {{ storagePower }}W
                </VaChip>
              </div>
            </div>

            <VaDivider />

            <!-- 其他硬件 -->
            <div class="form-section">
              <h3 class="section-title">
                <VaIcon name="mdi-expansion-card-variant" size="small" />
                扩展硬件
              </h3>

              <!-- 网卡 -->
              <div class="form-row">
                <VaCheckbox v-model="hasNIC" label="独立网卡" />
                <VaCounter
                  v-if="hasNIC"
                  v-model="nicCount"
                  :min="1"
                  :max="4"
                  size="small"
                  class="ml-3"
                />
              </div>

              <!-- 显卡 -->
              <div class="form-row mt-2">
                <VaCheckbox v-model="hasGPU" label="显卡" />
                <VaSelect
                  v-if="hasGPU"
                  v-model="gpuModel"
                  :options="gpuOptions"
                  size="small"
                  class="ml-3"
                  style="width: 200px;"
                />
                <VaCounter
                  v-if="hasGPU"
                  v-model="gpuCount"
                  :min="1"
                  :max="4"
                  size="small"
                  class="ml-2"
                />
              </div>

              <!-- RAID 卡 -->
              <div class="form-row mt-2">
                <VaCheckbox v-model="hasRAID" label="RAID 卡" />
                <VaSelect
                  v-if="hasRAID"
                  v-model="raidModel"
                  :options="['基础 RAID', 'HBA', '高级 RAID']"
                  size="small"
                  class="ml-3"
                  style="width: 150px;"
                />
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- 右侧：配置总览和功耗计算 -->
      <div class="summary-panel">
        <!-- 配置总览 -->
        <VaCard class="mb-4">
          <VaCardTitle>
            <div class="card-title-with-action">
              <span>配置总览</span>
              <VaButton
                size="small"
                @click="exportConfig"
                :disabled="!selectedCpu"
              >
                导出配置
              </VaButton>
            </div>
          </VaCardTitle>
          <VaCardContent>
            <div class="config-summary">
              <div v-if="!selectedCpu" class="empty-state">
                <VaIcon name="mdi-information-outline" size="large" color="secondary" />
                <p>请在左侧选择硬件配置</p>
              </div>

              <div v-else class="summary-list">
                <!-- CPU -->
                <div class="summary-item">
                  <div class="summary-label">
                    <VaIcon name="mdi-chip" size="small" />
                    <span>CPU</span>
                  </div>
                  <div class="summary-value">
                    {{ selectedCpu.cpu_short_name }} × {{ cpuCount }}
                  </div>
                </div>

                <!-- 主板 -->
                <div v-if="selectedMotherboard" class="summary-item">
                  <div class="summary-label">
                    <VaIcon name="mdi-resistor-nodes" size="small" />
                    <span>主板</span>
                  </div>
                  <div class="summary-value">
                    {{ selectedMotherboard }}
                  </div>
                </div>

                <!-- 内存 -->
                <div v-if="memoryCount > 0" class="summary-item">
                  <div class="summary-label">
                    <VaIcon name="mdi-memory" size="small" />
                    <span>内存</span>
                  </div>
                  <div class="summary-value">
                    {{ memoryType }} {{ memoryCapacity }} × {{ memoryCount }} ({{ totalMemory }}GB)
                  </div>
                </div>

                <!-- 存储 -->
                <div v-if="hasM2" class="summary-item">
                  <div class="summary-label">
                    <VaIcon name="mdi-harddisk" size="small" />
                    <span>M.2 SSD</span>
                  </div>
                  <div class="summary-value">
                    {{ m2Capacity }} × {{ m2Count }}
                  </div>
                </div>

                <div v-if="hasSSD" class="summary-item">
                  <div class="summary-label">
                    <VaIcon name="mdi-harddisk" size="small" />
                    <span>SATA SSD</span>
                  </div>
                  <div class="summary-value">
                    {{ ssdCapacity }} × {{ ssdCount }}
                  </div>
                </div>

                <div v-if="hasHDD" class="summary-item">
                  <div class="summary-label">
                    <VaIcon name="mdi-harddisk" size="small" />
                    <span>HDD</span>
                  </div>
                  <div class="summary-value">
                    {{ hddCapacity }} × {{ hddCount }}
                  </div>
                </div>

                <!-- 扩展硬件 -->
                <div v-if="hasNIC" class="summary-item">
                  <div class="summary-label">
                    <VaIcon name="mdi-ethernet" size="small" />
                    <span>网卡</span>
                  </div>
                  <div class="summary-value">× {{ nicCount }}</div>
                </div>

                <div v-if="hasGPU" class="summary-item">
                  <div class="summary-label">
                    <VaIcon name="mdi-expansion-card" size="small" />
                    <span>显卡</span>
                  </div>
                  <div class="summary-value">
                    {{ gpuModel }} × {{ gpuCount }}
                  </div>
                </div>

                <div v-if="hasRAID" class="summary-item">
                  <div class="summary-label">
                    <VaIcon name="mdi-server" size="small" />
                    <span>RAID 卡</span>
                  </div>
                  <div class="summary-value">{{ raidModel }}</div>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- 功耗计算 -->
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

              <VaProgressBar
                :model-value="(totalPower / recommendedPSU) * 100"
                :color="powerColor"
                class="mt-3"
              >
                负载率: {{ Math.round((totalPower / recommendedPSU) * 100) }}%
              </VaProgressBar>

              <VaAlert
                v-if="totalPower / recommendedPSU > 0.85"
                color="warning"
                border="top"
                class="mt-3"
              >
                功耗较高,建议选择更大功率电源或优化配置
              </VaAlert>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- 兼容性提示 -->
        <VaCard v-if="compatibilityWarnings.length > 0" class="mt-4">
          <VaCardTitle>
            <VaIcon name="mdi-alert" color="warning" />
            兼容性提示
          </VaCardTitle>
          <VaCardContent>
            <VaAlert
              v-for="(warning, index) in compatibilityWarnings"
              :key="index"
              color="warning"
              border="left"
              class="mb-2"
            >
              {{ warning }}
            </VaAlert>
          </VaCardContent>
        </VaCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { debounce } from 'lodash'
import {
  VaCard,
  VaCardTitle,
  VaCardContent,
  VaInput,
  VaIcon,
  VaButton,
  VaChip,
  VaDivider,
  VaCounter,
  VaSelect,
  VaCheckbox,
  VaAlert,
  VaProgressBar,
  useToast
} from 'vuestic-ui'
import { searchCpu, getCompatibleMotherboards } from '../api/configPlan'

const { init: notify } = useToast()

// ==================== CPU 相关 ====================
const cpuKeyword = ref('')
const cpuSuggestions = ref<any[]>([])
const selectedCpu = ref<any>(null)
const cpuCount = ref(1)

// CPU 搜索
const handleCpuSearch = debounce(async () => {
  if (!cpuKeyword.value || cpuKeyword.value.length < 2) {
    cpuSuggestions.value = []
    return
  }

  try {
    const results = await searchCpu(cpuKeyword.value)
    cpuSuggestions.value = results
  } catch (err) {
    console.error('CPU 搜索失败:', err)
  }
}, 300)

const selectCpu = async (cpu: any) => {
  selectedCpu.value = cpu
  cpuKeyword.value = cpu.cpu_short_name
  cpuSuggestions.value = []

  // 自动设置内存类型
  memoryType.value = cpu.memory_type || 'DDR4'

  // 加载兼容主板
  await loadCompatibleMotherboards()
}

const clearCpu = () => {
  selectedCpu.value = null
  cpuKeyword.value = ''
  selectedMotherboard.value = null
  compatibleMotherboards.value = []
}

// ==================== 主板相关 ====================
const selectedMotherboard = ref<string | null>(null)
const compatibleMotherboards = ref<any[]>([])

const loadCompatibleMotherboards = async () => {
  if (!selectedCpu.value) return

  try {
    const boards = await getCompatibleMotherboards(selectedCpu.value.cpu_short_name)
    compatibleMotherboards.value = boards
  } catch (err) {
    console.error('加载兼容主板失败:', err)
  }
}

const selectedMotherboardDetail = computed(() => {
  if (!selectedMotherboard.value) return null
  return compatibleMotherboards.value.find(
    (board) => board.model === selectedMotherboard.value
  )
})

const maxMemorySlots = computed(() => {
  return selectedMotherboardDetail.value?.memory_slots || 8
})

// ==================== 内存相关 ====================
const memoryType = ref('DDR4')
const memoryCapacity = ref('32GB')
const memoryCount = ref(2)

const memoryOptions = computed(() => {
  if (!selectedCpu.value) return ['DDR4', 'DDR5']
  return [selectedCpu.value.memory_type || 'DDR4']
})

const memoryCapacityOptions = ['8GB', '16GB', '32GB', '64GB', '128GB']

const totalMemory = computed(() => {
  const capacity = parseInt(memoryCapacity.value)
  return capacity * memoryCount.value
})

const memoryPower = computed(() => {
  // DDR4: ~3W per stick, DDR5: ~5W per stick
  const powerPerStick = memoryType.value === 'DDR5' ? 5 : 3
  return powerPerStick * memoryCount.value
})

// ==================== 存储相关 ====================
const hasM2 = ref(false)
const m2Capacity = ref('512GB')
const m2Count = ref(1)

const hasSSD = ref(false)
const ssdCapacity = ref('960GB')
const ssdCount = ref(2)

const hasHDD = ref(false)
const hddCapacity = ref('4TB')
const hddCount = ref(4)

const storagePower = computed(() => {
  let power = 0
  if (hasM2.value) power += 5 * m2Count.value // M.2: ~5W each
  if (hasSSD.value) power += 5 * ssdCount.value // SSD: ~5W each
  if (hasHDD.value) power += 8 * hddCount.value // HDD: ~8W each
  return power
})

// ==================== 扩展硬件 ====================
const hasNIC = ref(false)
const nicCount = ref(1)

const hasGPU = ref(false)
const gpuModel = ref('GTX 1650')
const gpuCount = ref(1)
const gpuOptions = ['GTX 1650', 'RTX 3060', 'RTX 4090', 'A100', 'H100']

const hasRAID = ref(false)
const raidModel = ref('基础 RAID')

const expansionPower = computed(() => {
  let power = 0
  if (hasNIC.value) power += 10 * nicCount.value
  if (hasGPU.value) {
    const gpuPowerMap: Record<string, number> = {
      'GTX 1650': 75,
      'RTX 3060': 170,
      'RTX 4090': 450,
      'A100': 400,
      'H100': 700
    }
    power += (gpuPowerMap[gpuModel.value] || 100) * gpuCount.value
  }
  if (hasRAID.value) power += 25
  return power
})

// ==================== 功耗计算 ====================
const cpuPower = computed(() => {
  if (!selectedCpu.value) return 0
  return (selectedCpu.value.tdp || 0) * cpuCount.value
})

const motherboardPower = computed(() => {
  return selectedMotherboardDetail.value?.power || 50
})

const totalPower = computed(() => {
  return (
    cpuPower.value +
    motherboardPower.value +
    memoryPower.value +
    storagePower.value +
    expansionPower.value
  )
})

const recommendedPSU = computed(() => {
  // 1.3x safety margin
  const recommended = Math.ceil(totalPower.value * 1.3)
  // Round up to standard PSU sizes
  const standardSizes = [550, 650, 750, 850, 1000, 1200, 1600, 2000]
  return standardSizes.find((size) => size >= recommended) || 2000
})

const powerColor = computed(() => {
  const ratio = totalPower.value / recommendedPSU.value
  if (ratio > 0.85) return 'danger'
  if (ratio > 0.7) return 'warning'
  return 'success'
})

// ==================== 兼容性检查 ====================
const compatibilityWarnings = computed(() => {
  const warnings: string[] = []

  // 检查内存容量是否超过主板/CPU支持
  if (selectedMotherboardDetail.value) {
    const maxMemory = selectedMotherboardDetail.value.max_memory
    if (totalMemory.value > maxMemory) {
      warnings.push(`内存总容量 ${totalMemory.value}GB 超过主板最大支持 ${maxMemory}GB`)
    }
  }

  // 检查内存插槽数量
  if (memoryCount.value > maxMemorySlots.value) {
    warnings.push(`内存条数量 ${memoryCount.value} 超过主板插槽数 ${maxMemorySlots.value}`)
  }

  // 检查功耗
  if (totalPower.value / recommendedPSU.value > 0.9) {
    warnings.push('系统功耗接近电源上限，建议增加电源余量')
  }

  return warnings
})

// ==================== 导出配置 ====================
const exportConfig = () => {
  const config = {
    cpu: selectedCpu.value?.cpu_short_name,
    cpuCount: cpuCount.value,
    motherboard: selectedMotherboard.value,
    memory: {
      type: memoryType.value,
      capacity: memoryCapacity.value,
      count: memoryCount.value,
      total: `${totalMemory.value}GB`
    },
    storage: {
      m2: hasM2.value ? `${m2Capacity.value} × ${m2Count.value}` : null,
      ssd: hasSSD.value ? `${ssdCapacity.value} × ${ssdCount.value}` : null,
      hdd: hasHDD.value ? `${hddCapacity.value} × ${hddCount.value}` : null
    },
    expansion: {
      nic: hasNIC.value ? nicCount.value : 0,
      gpu: hasGPU.value ? `${gpuModel.value} × ${gpuCount.value}` : null,
      raid: hasRAID.value ? raidModel.value : null
    },
    power: {
      total: `${totalPower.value}W`,
      recommended: `${recommendedPSU.value}W`
    }
  }

  // 复制到剪贴板
  navigator.clipboard.writeText(JSON.stringify(config, null, 2))
  notify({
    message: '配置已复制到剪贴板',
    color: 'success'
  })
}
</script>

<style scoped>
.config-plan-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-title {
  margin-bottom: 1.5rem;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.config-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  flex: 1;
  overflow: hidden;
}

/* 左侧选择面板 */
.selection-panel {
  overflow-y: auto;
}

.hardware-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.form-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* CPU 搜索建议 */
.suggestions-list {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  background: #ffffff;
}

.suggestion-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: #f9fafb;
}

.suggestion-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.suggestion-sub {
  font-size: 13px;
  color: #6b7280;
}

/* 已选择项 */
.selected-item {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.selected-name {
  font-weight: 600;
  color: #111827;
  font-size: 15px;
}

.selected-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-row .label {
  color: #6b7280;
  font-weight: 500;
}

.detail-row .highlight {
  color: #2563eb;
  font-weight: 600;
}

/* 存储配置 */
.storage-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.storage-config {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-left: 28px;
}

.memory-summary,
.storage-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 右侧总览面板 */
.summary-panel {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.card-title-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.config-summary {
  min-height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: #9ca3af;
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.summary-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.summary-value {
  font-weight: 500;
  color: #111827;
  font-size: 14px;
}

/* 功耗分析 */
.power-analysis {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.power-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.power-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 14px;
}

.power-label {
  color: #6b7280;
}

.power-value {
  font-weight: 600;
  color: #111827;
}

.power-total {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
}

.total-label {
  font-size: 15px;
  font-weight: 600;
  color: #1e40af;
}

.total-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e40af;
}

.total-value.recommended {
  color: #059669;
}

/* 响应式 */
@media (max-width: 1280px) {
  .config-container {
    grid-template-columns: 1fr;
  }

  .summary-panel {
    max-height: none;
  }
}
</style>

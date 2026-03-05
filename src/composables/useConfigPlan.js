/**
 * useConfigPlan.js
 * src/composables/useConfigPlan.js
 *
 * 模块级单例：所有 ref/computed 在模块加载时只创建一次。
 * 所有子组件调用 useConfigPlan() 拿到的是同一份状态，联动正常。
 */

import { ref, computed, getCurrentInstance } from 'vue'
import debounce from 'lodash.debounce'
import { useToast } from 'vuestic-ui'
import { searchCpu, getCpuDetail, getMbBySocket } from '../api/configPlan'

// ─── 安全 notify ────────────────────────────────────────────
function useNotify() {
  const instance = getCurrentInstance()
  return instance
    ? useToast().init
    : (opts) => console.warn('[useConfigPlan]', opts?.message)
}

// ==================== 模块级状态（单例） ====================

// ── CPU ──────────────────────────────────────────────────────
const cpuKeyword = ref('')
const cpuSuggestions = ref([])
const selectedCpu = ref(null)
const cpuCount = ref(1)
const loadingCpuDetail = ref(false)

// ── 主板 ─────────────────────────────────────────────────────
const selectedMotherboard = ref(null)
const compatibleMotherboards = ref([])

// ── 内存 ─────────────────────────────────────────────────────
const memoryType = ref('')
const memoryCapacity = ref('32GB')
const memoryCount = ref(2)
const memoryCapacityOptions = ['8GB', '16GB', '32GB', '64GB', '128GB']

// ── 存储 ─────────────────────────────────────────────────────
const m2Items = ref([])
const ssdItems = ref([])
const hddItems = ref([])

// ── 扩展 ─────────────────────────────────────────────────────
const nicItems = ref([])
const gpuItems = ref([])
const raidItems = ref([])

const nicOptions = ['Intel X550-T2', 'Intel X710-DA2', 'Mellanox ConnectX-5', 'Broadcom BCM57416']
const gpuOptions = ['GTX 1650', 'RTX 3060', 'RTX 4090', 'A100', 'H100']
const gpuPowerMap = {
  'GTX 1650': 75, 'RTX 3060': 170, 'RTX 4090': 450, 'A100': 400, 'H100': 700
}

// ==================== 导出函数 ====================

export function useConfigPlan() {
  const notify = useNotify()

  // ── 通用工具 ──────────────────────────────────────────────
  const addItem = (list, defaults) => {
    const target = (list && list.value) ? list.value : list
    if (Array.isArray(target)) {
      target.push({
        id: Date.now() + Math.random(),
        ...defaults
      })
    }
  }

  const removeItem = (list, id) => {
    const target = (list && list.value) ? list.value : list
    if (Array.isArray(target)) {
      const idx = target.findIndex(item => item.id === id)
      if (idx !== -1) target.splice(idx, 1)
    }
  }

  // ── CPU computed ──────────────────────────────────────────
  const cpuScalability = computed(() => {
    if (!selectedCpu.value?.scalability) {
      return { min: 1, max: 1, default: 1, disabled: true }
    }
    const matches = selectedCpu.value.scalability.toUpperCase().match(/(\d+)[PS]/g)
    if (!matches) return { min: 1, max: 1, default: 1, disabled: true }
    const maxSockets = Math.max(...matches.map(m => parseInt(m.match(/\d+/)[0])))
    if (maxSockets === 1) return { min: 1, max: 1, default: 1, disabled: true }
    return { min: 1, max: maxSockets, default: maxSockets, disabled: false }
  })

  const cpuCountLabel = computed(() => {
    if (!selectedCpu.value) return '数量'
    return cpuScalability.value.disabled
      ? '数量 (单路CPU，固定1颗)'
      : `数量 (最多${cpuScalability.value.max}路)`
  })

  const formattedSocket = computed(() => {
    const s = selectedCpu.value?.socket
    if (s?.startsWith('FCLGA')) return s.replace(/^FCLGA(\d+)$/, 'LGA-$1')
    return s
  })

  // ── CPU actions ───────────────────────────────────────────
  const handleCpuSearch = debounce(async () => {
    if (!cpuKeyword.value || cpuKeyword.value.length < 2) {
      cpuSuggestions.value = []
      return
    }
    try {
      cpuSuggestions.value = await searchCpu(cpuKeyword.value)
    } catch (err) {
      console.error('CPU 搜索失败:', err)
    }
  }, 600)

  const selectCpu = async (cpuSummary) => {
    cpuKeyword.value = cpuSummary.cpu_short_name
    cpuSuggestions.value = []
    loadingCpuDetail.value = true
    try {
      const cpuDetail = await getCpuDetail(cpuSummary.id)
      selectedCpu.value = cpuDetail
      // 联动：根据 CPU 自动设置内存类型
      memoryType.value = extractMemoryTypes(cpuDetail.memory_speed)[0] || 'DDR4'
      // 联动：重置 CPU 数量
      cpuCount.value = cpuScalability.value.default
      // 联动：清空主板（CPU 变了，主板需要重新选）
      selectedMotherboard.value = null
      compatibleMotherboards.value = []
      await loadCompatibleMotherboards()
      notify({ message: `已选择 ${cpuDetail.cpu_short_name}`, color: 'success' })
    } catch (err) {
      console.error('加载 CPU 详情失败:', err)
      notify({ message: '加载 CPU 详情失败', color: 'danger' })
      selectedCpu.value = null
    } finally {
      loadingCpuDetail.value = false
    }
  }

  const clearCpu = () => {
    selectedCpu.value = null
    cpuKeyword.value = ''
    cpuCount.value = 1
    selectedMotherboard.value = null
    compatibleMotherboards.value = []
    memoryType.value = ''
  }

  const validateCpuCount = () => {
    const { min, max, disabled } = cpuScalability.value
    if (disabled) { cpuCount.value = 1; return }
    let v = Math.round(cpuCount.value)
    if (isNaN(v)) v = min
    cpuCount.value = Math.min(Math.max(v, min), max)
  }

  // ── 主板 computed & actions ───────────────────────────────
  const selectedMotherboardDetail = computed(() => {
    if (!selectedMotherboard.value) return null
    return compatibleMotherboards.value.find(b => b.model === selectedMotherboard.value) || null
  })

  const maxMemorySlots = computed(() => selectedMotherboardDetail.value?.memory_slots || 8)

  const loadCompatibleMotherboards = async () => {
    if (!selectedCpu.value) return
    try {
      compatibleMotherboards.value = await getMbBySocket(formattedSocket.value)
    } catch (err) {
      console.error('加载兼容主板失败:', err)
    }
  }

  const splitItems = (key) => {
    const val = selectedMotherboardDetail.value?.[key]
    if (!val) return []
    return val.split(';').map(s => s.trim()).filter(Boolean)
  }

  // ── 内存 computed ─────────────────────────────────────────
  const extractMemoryTypes = (memorySpeed) => {
    if (!memorySpeed) return []
    const matches = memorySpeed.match(/DDR\d+/gi)
    if (!matches) return []
    return Array.from(new Set(matches.map(m => m.toUpperCase())))
  }

  const memoryOptions = computed(() => {
    const types = extractMemoryTypes(selectedCpu.value?.memory_speed)
    return types.length ? types : ['DDR4']
  })

  const totalMemory = computed(() => parseInt(memoryCapacity.value) * memoryCount.value)

  const memoryPower = computed(() => {
    const perStick = memoryType.value === 'DDR5' ? 5 : 3
    return perStick * memoryCount.value
  })

  // ── 存储 computed ─────────────────────────────────────────
  const storagePower = computed(() => {
    let p = 0
    m2Items.value.forEach(it => p += 5 * it.count)
    ssdItems.value.forEach(it => p += 5 * it.count)
    hddItems.value.forEach(it => p += 8 * it.count)
    return p
  })

  // ── 扩展 computed ─────────────────────────────────────────
  const expansionPower = computed(() => {
    let p = 0
    nicItems.value.forEach(it => p += 10 * it.count)
    gpuItems.value.forEach(it => p += (gpuPowerMap[it.model] || 100) * it.count)
    raidItems.value.forEach(it => p += 25 * it.count)
    return p
  })

  // ── 功耗 computed ─────────────────────────────────────────
  const cpuPower = computed(() => (selectedCpu.value?.tdp || 0) * cpuCount.value)
  const motherboardPower = computed(() => selectedMotherboardDetail.value?.power || 50)

  const totalPower = computed(() =>
    cpuPower.value + motherboardPower.value + memoryPower.value +
    storagePower.value + expansionPower.value
  )

  const recommendedPSU = computed(() => {
    const recommended = Math.ceil(totalPower.value * 1.3)
    const sizes = [550, 650, 750, 850, 1000, 1200, 1600, 2000]
    return sizes.find(s => s >= recommended) || 2000
  })

  const powerColor = computed(() => {
    const ratio = totalPower.value / recommendedPSU.value
    if (ratio > 0.85) return 'danger'
    if (ratio > 0.7) return 'warning'
    return 'success'
  })

  // ── 兼容性 computed ───────────────────────────────────────
  const compatibilityWarnings = computed(() => {
    const warnings = []
    if (selectedMotherboardDetail.value) {
      const maxMem = selectedMotherboardDetail.value.max_memory
      if (totalMemory.value > maxMem)
        warnings.push(`内存总容量 ${totalMemory.value}GB 超过主板最大支持 ${maxMem}GB`)
    }
    if (memoryCount.value > maxMemorySlots.value)
      warnings.push(`内存条数量 ${memoryCount.value} 超过主板插槽数 ${maxMemorySlots.value}`)
    if (totalPower.value / recommendedPSU.value > 0.9)
      warnings.push('系统功耗接近电源上限，建议增加电源余量')
    return warnings
  })

  // ── 导出配置 ──────────────────────────────────────────────
  const exportConfig = () => {
    const config = {
      cpu: { id: selectedCpu.value?.id, name: selectedCpu.value?.cpu_short_name, count: cpuCount.value },
      motherboard: selectedMotherboard.value,
      memory: { type: memoryType.value, capacity: memoryCapacity.value, count: memoryCount.value, total: `${totalMemory.value}GB` },
      storage: {
        m2: m2Items.value.map(it => `${it.capacity} × ${it.count}`),
        ssd: ssdItems.value.map(it => `${it.capacity} × ${it.count}`),
        hdd: hddItems.value.map(it => `${it.capacity} × ${it.count}`),
      },
      expansion: {
        nic: nicItems.value.map(it => `${it.model} × ${it.count}`),
        gpu: gpuItems.value.map(it => `${it.model} × ${it.count}`),
        raid: raidItems.value.map(it => `${it.model} × ${it.count}`),
      },
      power: { total: `${totalPower.value}W`, recommended: `${recommendedPSU.value}W` }
    }
    navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    notify({ message: '配置已复制到剪贴板', color: 'success' })
  }

  return {
    // 通用
    addItem, removeItem,
    // CPU
    cpuKeyword, cpuSuggestions, selectedCpu, cpuCount, loadingCpuDetail,
    cpuScalability, cpuCountLabel, formattedSocket,
    handleCpuSearch, selectCpu, clearCpu, validateCpuCount,
    // 主板
    selectedMotherboard, compatibleMotherboards,
    selectedMotherboardDetail, maxMemorySlots, splitItems,
    // 内存
    memoryType, memoryCapacity, memoryCount, memoryCapacityOptions, memoryOptions,
    totalMemory, memoryPower,
    // 存储
    m2Items, ssdItems, hddItems,
    storagePower,
    // 扩展
    nicItems, gpuItems, raidItems, nicOptions, gpuOptions,
    expansionPower,
    // 功耗
    cpuPower, motherboardPower, totalPower, recommendedPSU, powerColor,
    // 兼容性
    compatibilityWarnings,
    // 导出
    exportConfig,
  }
}
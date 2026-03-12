import { defineStore } from 'pinia'
import { ref, computed, unref } from 'vue'
import debounce from 'lodash.debounce'
import { searchCpu, getCpuDetail, getMbBySocket } from '../api/configPlan'
import { validateConfig } from './configPlanValidation'
import { formatSocket } from '../utils/hardware'

/**
 * --- Constants & "Magic Numbers" Extraction ---
 * 将代码中原有的所有“魔法数字”(硬编码的变量)抽离到顶部的配置字典中。
 * 这样做的好处：
 * 1. 后续业务方需要调整任何硬件的基础功耗时，直接修改此处即可，不需要再看复杂的业务逻辑。
 * 2. 代码可读性和可维护性大幅上升。
 */
const CONFIG = {
    // 硬件基础功耗估算值 (单位: W)
    POWER: {
        M2: 5,
        SSD: 5,
        HDD: 8,
        NIC: 10,
        RAID: 25,
        MOTHERBOARD_DEFAULT: 50,
        MEMORY_DDR5: 5,
        MEMORY_OTHER: 3,
    },
    DEFAULT_MAX_MEMORY_SLOTS: 8, // 主板默认最大内存插槽数
    PSU_SIZES: [550, 650, 750, 850, 1000, 1200, 1600, 2000], // 推荐电源型号阶梯
    // 各型号显卡的预估功耗 (单位: W)
    GPU_POWER_MAP: {
        'GTX 1650': 75,
        'RTX 3060': 170,
        'RTX 4090': 450,
        'A100': 400,
        'H100': 700
    },
    // 内存容量下拉选项
    MEMORY_CAPACITIES: ['8GB', '16GB', '32GB', '64GB', '128GB'],
    // 独立网卡下拉选项
    NIC_OPTIONS: ['Intel X550-T2', 'Intel X710-DA2', 'Mellanox ConnectX-5', 'Broadcom BCM57416'],
    // 显卡下拉选项
    GPU_OPTIONS: ['GTX 1650', 'RTX 3060', 'RTX 4090', 'A100', 'H100']
}

const parsePositiveInt = (value) => {
    const num = typeof value === 'number' ? value : parseInt(String(value), 10)
    return Number.isFinite(num) && num > 0 ? num : null
}

/**
 * useConfigPlanStore 
 * 
 * 完整的 Pinia Setup Store 实现。
 * 相比于之前的 Composable (函数闭包)，Pinia 的优势在于：
 * 1. 彻底解决 SSR（服务端渲染）状态污染问题（不会跨请求共享内存）。
 * 2. 只有在真正使用时，Pinia 内部的 getter (即下面的 computed) 才会实例化，生命周期随 Store 清理，杜绝了内存泄漏。
 * 3. 完美兼容 Vue Devtools 时间旅行调试。
 */
export const useConfigPlanStore = defineStore('configPlan', () => {
    // ==================== 状态 State ====================
    // 定义所有的原始响应式状态，相当于 Option API 里的 data() 

    // ── CPU 相关 ──
    const cpuKeyword = ref('')            // CPU 搜索关键字
    const cpuCoresFilter = ref(null)      // CPU 核心数筛选
    const cpuSuggestions = ref([])        // CPU 搜索结果建议列表
    const selectedCpu = ref(null)         // 当前已选的 CPU 详细数据对象
    const cpuCount = ref(1)               // 选定 CPU 的配置路数 (颗数)
    const loadingCpuDetail = ref(false)   // 加载 CPU 详情的 loading 状态

    // ── 主板 相关 ──
    const selectedMotherboard = ref(null) // 已选的主板型号名称
    const compatibleMotherboards = ref([])// 当前 CPU 兼容的所有主板列表

    // ── 内存 相关 ──
    const memoryType = ref('')            // 内存类型 (如 DDR4, DDR5，基于 CPU 自动推导)
    const memoryCapacity = ref('32GB')    // 单条内存容量
    const memoryCount = ref(2)            // 配置的内存条数量
    const memoryCapacityOptions = ref(CONFIG.MEMORY_CAPACITIES)

    // ── 存储 相关 (数组化支持多型号组合) ──
    const m2Items = ref([])   // M.2 固态硬盘阵列: [{ id, capacity, count }]
    const ssdItems = ref([])  // SATA 固态硬盘阵列: [{ id, capacity, count }]
    const hddItems = ref([])  // 机械硬盘阵列: [{ id, capacity, count }]

    // ── 扩展 相关 (数组化支持多型号组合) ──
    const nicItems = ref([])  // 独立网卡阵列: [{ id, model, count }]
    const gpuItems = ref([])  // 显卡阵列: [{ id, model, count }]
    const raidItems = ref([]) // 阵列卡阵列: [{ id, model, count }]

    // 提供给选择器的下拉选项挂载
    const nicOptions = ref(CONFIG.NIC_OPTIONS)
    const gpuOptions = ref(CONFIG.GPU_OPTIONS)


    // ==================== Actions (方法) ====================
    // Store 内部的业务逻辑，相当于 Option API 里的 methods

    /**
     * 动态向指定硬件数组新增一条配置项
     * @param {Ref<Array>} listRef - 目标数组的 ref 引用 (如 m2Items)
     * @param {Object} defaults - 新增项的默认属性 (如容量、型号、初始数量)
     * 解耦改进：引入 unref 确保无论是传入 ref 还是 raw array 都能正确处理
     */
    const addItem = (listRef, defaults) => {
        const target = unref(listRef)
        if (Array.isArray(target)) {
            target.push({
                id: Date.now() + Math.random(), // 简单的唯一个体 ID，用于 Vue :key 渲染与删除标记
                ...defaults
            })
        }
    }

    /**
     * 动态从指定硬件数组中移除一条配置项
     */
    const removeItem = (listRef, id) => {
        const target = unref(listRef)
        if (Array.isArray(target)) {
            const idx = target.findIndex(item => item.id === id)
            if (idx !== -1) target.splice(idx, 1)
        }
    }

    /**
     * 搜索 CPU (防抖处理)
     * 架构优化：
     * 将 debounce 声明在 Store 生命周期内。这样确保全应用（不管多少个组件引发搜素）
     * 共享着唯一的闭包防抖实例，彻底解决了原 Composable 会诱发“多实例竞态搜索”的致命 Bug。
     */
    const handleCpuSearch = debounce(async () => {
        // 只要两个条件都为空，则清空建议并退出
        if (!cpuKeyword.value && !cpuCoresFilter.value) {
            cpuSuggestions.value = []
            return
        }

        try {
            // 构造传参
            const params = {}
            if (cpuKeyword.value) params.keyword = cpuKeyword.value
            if (cpuCoresFilter.value) params.cores = cpuCoresFilter.value

            cpuSuggestions.value = await searchCpu(params)
        } catch (err) {
            console.error('CPU 组合搜索失败:', err)
            throw err
        }
    }, 600)

    /**
     * 加载兼容的主板列表
     */
    const loadCompatibleMotherboards = async () => {
        if (!selectedCpu.value) return
        try {
            compatibleMotherboards.value = await getMbBySocket(formattedSocket.value)
        } catch (err) {
            console.error('加载兼容主板失败:', err)
            throw err
        }
    }

    /**
     * 选中某个 CPU 后的联动逻辑处理
     */
    const selectCpu = async (cpuSummary) => {
        cpuKeyword.value = cpuSummary.cpu_short_name
        cpuSuggestions.value = [] // 隐藏下拉建议框
        loadingCpuDetail.value = true
        try {
            const cpuDetail = await getCpuDetail(cpuSummary.id)
            selectedCpu.value = cpuDetail

            // -- 核心联动处理 --
            // 1. 根据 CPU 的参数自动萃取支持的内存类型 (降级回退 DDR4)
            memoryType.value = extractMemoryTypes(cpuDetail.memory_speed)[0] || 'DDR4'
            // 2. 将 CPU 颗数重置为其推荐默认配置（单路为1，双路为2等） 
            cpuCount.value = cpuScalability.value.default

            // 3. 强制清空之前选取的主板并重新请求当前 CPU 对应针脚的新主板
            selectedMotherboard.value = null
            compatibleMotherboards.value = []
            await loadCompatibleMotherboards()

            return cpuDetail // 返回完整对象供 UI 层派发 Toast 等纯视图交互
        } catch (err) {
            console.error('加载 CPU 详情失败:', err)
            selectedCpu.value = null
            throw err
        } finally {
            loadingCpuDetail.value = false
        }
    }

    /**
     * 清空所有与 CPU 绑定的环境状态
     */
    const clearCpu = () => {
        selectedCpu.value = null
        cpuKeyword.value = ''
        cpuCoresFilter.value = null
        cpuCount.value = 1
        selectedMotherboard.value = null
        compatibleMotherboards.value = []
        memoryType.value = ''
    }

    /**
     * 校准用户填写的 CPU 数量 (限制在主板及 CPU 自身支持的最大路数范围内)
     */
    const validateCpuCount = () => {
        const { min, max, disabled } = cpuScalability.value
        if (disabled) { cpuCount.value = 1; return }
        let v = Math.round(cpuCount.value)
        if (isNaN(v)) v = min
        cpuCount.value = Math.min(Math.max(v, min), max)
    }

    /**
     * 字符串分割工具：主板里多个接口/插槽的字符串通常用 `;` 隔开
     */
    const splitItems = (key) => {
        const val = selectedMotherboardDetail.value?.[key]
        if (!val) return []
        return val.split(';').map(s => s.trim()).filter(Boolean)
    }

    /**
     * 序列化整个方案配置给前端复制或下载
     */
    const exportConfigData = () => {
        return {
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
    }


    // ==================== Getters (计算属性) ====================
    // Store 的派生状态，相当于 Option API 的 computed。
    // 在 Pinia 中，这些 getter 会被自动缓存且仅在这个 Store 挂载期间维护一份实例。
    // 非常好地修复了原实现中每挂载一次组件就被系统重新 new 一堆 computed 闭包引发的垃圾回收停顿问题。

    // ── CPU 衍生 ──
    // 解析 CPU 的 scalability 字段 (如 1S, 2S)，推导 CPU 支持的物理堆叠路数限制
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

    // 动态构建数量标签用于 UI
    const cpuCountLabel = computed(() => {
        if (!selectedCpu.value) return '数量'
        return cpuScalability.value.disabled
            ? '数量 (单路CPU，固定1颗)'
            : `数量 (最多${cpuScalability.value.max}路)`
    })

    // 接口名称格式化 (把 FCLGAxxxx 美化成 LGA-xxxx，业界更为通用)
    const formattedSocket = computed(() => formatSocket(selectedCpu.value?.socket))

    // 核心解构器：从 CPU 的 memory_speed 字段中，挖掘支持哪些类型的内存条
    const extractMemoryTypes = (memorySpeed) => {
        if (!memorySpeed) return []
        const matches = memorySpeed.match(/DDR\d+/gi)
        if (!matches) return []
        return Array.from(new Set(matches.map(m => m.toUpperCase())))
    }

    // ── 主板 衍生 ──
    // 将下拉框纯粹的 string model(名称) 映射回完整的主板 detail JSON 对像
    const selectedMotherboardDetail = computed(() => {
        if (!selectedMotherboard.value) return null
        return compatibleMotherboards.value.find(b => b.model === selectedMotherboard.value) || null
    })

    // 动态判定这块板子有几条内存槽（数据库字段: dimm_number）
    const maxMemorySlots = computed(() => {
        const slots = parsePositiveInt(selectedMotherboardDetail.value?.dimm_number)
        return slots || CONFIG.DEFAULT_MAX_MEMORY_SLOTS
    })

    // ── 内存 衍生 ──
    const memoryOptions = computed(() => {
        const types = extractMemoryTypes(selectedCpu.value?.memory_speed)
        return types.length ? types : ['DDR4'] // 兜底返回 DDR4
    })

    // 直接求出总共的 GB 数量用于展示及效验
    const totalMemory = computed(() => parseInt(memoryCapacity.value) * memoryCount.value)

    // 内存功耗：DDR5 每根耗电更高
    const memoryPower = computed(() => {
        const perStick = memoryType.value === 'DDR5' ? CONFIG.POWER.MEMORY_DDR5 : CONFIG.POWER.MEMORY_OTHER
        return perStick * memoryCount.value
    })

    // ── 供电与功耗估算 ──

    // 累加所有存储设备的数量，匹配字典中的单位耗电算出子系统总负载
    const storagePower = computed(() => {
        let p = 0
        m2Items.value.forEach(it => p += CONFIG.POWER.M2 * it.count)
        ssdItems.value.forEach(it => p += CONFIG.POWER.SSD * it.count)
        hddItems.value.forEach(it => p += CONFIG.POWER.HDD * it.count)
        return p
    })

    // 累加扩展阵列负载 (显卡根据其型号去查表 GPU_POWER_MAP 获取实际 TGP)
    const expansionPower = computed(() => {
        let p = 0
        nicItems.value.forEach(it => p += CONFIG.POWER.NIC * it.count)
        gpuItems.value.forEach(it => p += (CONFIG.GPU_POWER_MAP[it.model] || 100) * it.count)
        raidItems.value.forEach(it => p += CONFIG.POWER.RAID * it.count)
        return p
    })

    const cpuPower = computed(() => (selectedCpu.value?.tdp || 0) * cpuCount.value)
    const motherboardPower = computed(() => selectedMotherboardDetail.value?.power || CONFIG.POWER.MOTHERBOARD_DEFAULT)

    // System Total Power
    const totalPower = computed(() =>
        cpuPower.value + motherboardPower.value + memoryPower.value +
        storagePower.value + expansionPower.value
    )

    // 电源建议算法：在最大功耗基础上拔高留出余量 (这里设为1.3倍冗余，约等于安全转化率)
    // 然后向上取整寻找最接近的阶梯标配电源瓦数
    const recommendedPSU = computed(() => {
        const recommended = Math.ceil(totalPower.value * 1.3)
        return CONFIG.PSU_SIZES.find(s => s >= recommended) || 2000
    })

    // 用于在 UI ProgressBar 上直观预警的高亮色块等级
    const powerColor = computed(() => {
        const ratio = totalPower.value / recommendedPSU.value
        if (ratio > 0.85) return 'danger'
        if (ratio > 0.7) return 'warning'
        return 'success'
    })

    // ── 安全与兼容性审计 (核心价值) ──
    // 统一调用独立校验模块，返回分级结果：blockers / warnings / infos。
    const validationResult = computed(() => validateConfig({
        selectedCpu: selectedCpu.value,
        selectedMotherboard: selectedMotherboard.value,
        selectedMotherboardDetail: selectedMotherboardDetail.value,
        formattedSocket: formattedSocket.value,
        totalMemory: totalMemory.value,
        memoryCount: memoryCount.value,
        maxMemorySlots: maxMemorySlots.value,
        totalPower: totalPower.value,
        recommendedPSU: recommendedPSU.value
    }))

    return {
        // ==== 导出 State ====
        cpuKeyword, cpuCoresFilter, cpuSuggestions, selectedCpu, cpuCount, loadingCpuDetail,
        selectedMotherboard, compatibleMotherboards,
        memoryType, memoryCapacity, memoryCount, memoryCapacityOptions,
        m2Items, ssdItems, hddItems,
        nicItems, gpuItems, raidItems, nicOptions, gpuOptions,

        // ==== 导出 Getters ====
        cpuScalability, cpuCountLabel, formattedSocket, memoryOptions, totalMemory, memoryPower,
        selectedMotherboardDetail, maxMemorySlots, storagePower, expansionPower,
        cpuPower, motherboardPower, totalPower, recommendedPSU, powerColor,
        validationResult,

        // ==== 导出 Actions ====
        addItem, removeItem, handleCpuSearch, selectCpu, clearCpu, validateCpuCount,
        splitItems, exportConfigData
    }
})

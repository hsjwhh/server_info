<template>
  <VaModal
    v-model="show"
    title="批量配置导入"
    size="large"
    fixed-layout
    :ok-text="confirmText"
    :cancel-text="'取消'"
    @ok="handleConfirm"
  >
    <div class="batch-import-container">
      <div v-if="step === 1" class="step-1">
        <p class="help-text mb-4">
          请从 Excel 或其他文档中复制服务器配置列表并粘贴到下方文本框。
          <br />
          格式建议：<strong>型号 [数量]</strong>（例如：Intel 4114 * 2 或 Supermicro X11DPi-N 1）
        </p>
        <VaTextarea
          v-model="rawText"
          placeholder="在此粘贴配置信息..."
          autosize
          :min-rows="8"
          :max-rows="20"
          class="w-full batch-textarea"
        />
        <div class="flex justify-end mt-4">
          <VaButton :disabled="!rawText.trim()" @click="processText">
            解析并匹配型号
          </VaButton>
        </div>
      </div>

      <div v-else-if="step === 2" class="step-2">
        <div class="results-header mb-3 flex justify-between items-center">
          <span class="text-sm text-gray-500">解析到 {{ parsedItems.length }} 条记录</span>
          <VaButton preset="secondary" size="small" @click="step = 1">
            重新输入
          </VaButton>
        </div>

        <div class="parsed-list">
          <div v-for="(item, index) in parsedItems" :key="index" class="parsed-item mb-4 p-3 border rounded">
            <div class="flex items-center justify-between mb-2">
              <div class="item-input-info">
                <span class="label">输入内容:</span>
                <span class="value font-mono">{{ item.rawLine }}</span>
              </div>
              <VaCounter v-model="item.quantity" :min="1" size="small" label="数量" />
            </div>

            <div class="match-section">
              <div v-if="item.matchStatus === 'loading'" class="flex items-center gap-2 text-info">
                <VaIcon name="loop" spin /> 正在匹配数据库型号...
              </div>

              <div v-else-if="item.matchStatus === 'ready'" class="flex items-center justify-between gap-2 p-2 bg-blue-50 rounded">
                <div class="flex items-center gap-2 text-primary">
                  <VaIcon name="info" />
                  <span>已识别为: <strong>{{ item.manualType }}</strong> - {{ item.rawModel }}</span>
                </div>
                <VaButton preset="plain" size="small" @click="item.matchStatus = 'none'">调整</VaButton>
              </div>
              
              <div v-else-if="item.matchStatus === 'matched'" class="flex items-center gap-2 text-success">
                <VaIcon name="check_circle" />
                <span>已自动匹配: <strong>{{ item.matchedModel }}</strong></span>
                <VaButton preset="plain" size="small" @click="resetMatch(item)">更改</VaButton>
              </div>

              <div v-else-if="item.matchStatus === 'ambiguous'" class="flex flex-col gap-2">
                <div class="flex items-center gap-2 text-warning">
                  <VaIcon name="warning" />
                  <span>找到多个相似型号，请选择:</span>
                </div>
                <div class="suggestions flex wrap gap-2">
                  <VaChip
                    v-for="s in item.suggestions"
                    :key="s.id"
                    clickable
                    size="small"
                    @click="selectMatch(item, s)"
                  >
                    {{ s.cpu_short_name || s.model }}
                  </VaChip>
                  <VaButton preset="plain" size="small" @click="markAsManual(item)">以上都不是</VaButton>
                </div>
              </div>

              <div v-else-if="item.matchStatus === 'none'" class="flex flex-col gap-2">
                <div v-if="['CPU', '主板'].includes(item.manualType) || item.matchStatus === 'none'" class="flex items-center gap-2 text-danger">
                  <VaIcon name="error" />
                  <span>未匹配到型号</span>
                </div>
                <div class="flex gap-2 items-end">
                  <VaSelect
                    v-model="item.manualType"
                    label="设备类型"
                    :options="['CPU', '主板', '内存', '存储', '阵列卡', '网卡', '机箱', '电源', '其他']"
                    class="type-select"
                  />
                  <VaInput
                    v-model="item.matchedModel"
                    label="型号调整"
                    :placeholder="item.rawModel"
                    class="flex-grow"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VaModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  VaModal, VaTextarea, VaButton, VaIcon, VaCounter, 
  VaChip, VaSelect, VaInput 
} from 'vuestic-ui'
import { searchCpu, searchMotherboard } from '../../api/configPlan'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue', 'imported'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const step = ref(1)
const rawText = ref('')
const parsedItems = ref([])
const confirmText = computed(() => step.value === 2 ? '确认并填充表单' : '关闭')

const processText = async () => {
  const lines = rawText.value.split('\n').filter(l => l.trim())
  parsedItems.value = lines.map(line => {
    // 1. 尝试剥离常见的中文前缀和冒号
    const prefixRegex = /^(主板|CPU|内存|硬盘|磁盘|存储|显卡|GPU|阵列卡|RAID|网卡|NIC|机箱|电源|散热器|风扇|配件|线缆|OS|系统)[:：\s]*/i
    const hasPrefix = prefixRegex.test(line)
    let cleanLine = line.replace(prefixRegex, '').trim()
    
    // 2. 识别设备类型 (基于前缀)
    let predictedType = '其他'
    if (/^主板/i.test(line)) predictedType = '主板'
    else if (/^CPU/i.test(line)) predictedType = 'CPU'
    else if (/^内存/i.test(line)) predictedType = '内存'
    else if (/^(硬盘|磁盘|存储|SSD|HDD)/i.test(line)) predictedType = '存储'
    else if (/^机箱/i.test(line)) predictedType = '机箱'
    else if (/^电源/i.test(line)) predictedType = '电源'
    else if (/^(阵列卡|RAID)/i.test(line)) predictedType = '阵列卡'
    else if (/^(网卡|NIC|LAN)/i.test(line)) predictedType = '网卡'
    else if (/^(散热器|风扇|配件|线缆)/i.test(line)) predictedType = '其他'

    // 3. 解析 型号 和 数量
    const qtyMatch = cleanLine.match(/(.*?)\s*[*xX]\s*(\d+)$/) || cleanLine.match(/(.*?)\s+(\d+)$/)
    let model = cleanLine
    let quantity = 1
    
    if (qtyMatch) {
      model = qtyMatch[1].trim()
      quantity = parseInt(qtyMatch[2])
    }

    return {
      rawLine: line,
      rawModel: model,
      quantity,
      matchStatus: 'loading',
      matchedModel: '',
      matchedId: null,
      suggestions: [],
      manualType: predictedType,
      hasPrefix // 记录是否有前缀，用于后续判断是否自动查库
    }
  })

  step.value = 2
  
  // 开始异步匹配
  for (const item of parsedItems.value) {
    // 自动查库逻辑：
    // 1. 明确是 CPU 或 主板
    // 2. 或者是没有前缀的“其他”项（可能是直接粘贴的型号，如 "4114"）
    const shouldSearch = ['CPU', '主板'].includes(item.manualType) || (item.manualType === '其他' && !item.hasPrefix)
    
    if (shouldSearch) {
      matchItem(item)
    } else {
      item.matchStatus = 'ready' 
    }
  }
}

const matchItem = async (item) => {
  item.matchStatus = 'loading'
  try {
    // 1. 预处理搜索词
    // CPU: 建议直接用数字去匹配，提高在混合命名下的命中率
    const cpuSearchKeyword = (item.rawModel.match(/\d+/) || [item.rawModel])[0]
    
    // 主板: 去除中文，保留型号核心部分 (如 "华硕 P3SHA" -> "P3SHA")
    const mbSearchKeyword = item.rawModel.replace(/[\u4e00-\u9fa5]/g, '').trim() || item.rawModel

    // 2. 根据类型分别请求接口
    const promises = []
    
    // 如果是 CPU 或 无法确定的项，搜索 CPU 库
    if (item.manualType === 'CPU' || item.manualType === '其他') {
      promises.push(searchCpu({ keyword: cpuSearchKeyword }).then(res => 
        res.map(r => ({ ...r, type: 'CPU', displayName: r.cpu_short_name }))
      ))
    }
    
    // 如果是 主板 或 无法确定的项，搜索 主板 库
    if (item.manualType === '主板' || item.manualType === '其他') {
      promises.push(searchMotherboard(mbSearchKeyword).catch(() => []).then(res => 
        res.map(r => ({ ...r, type: 'MB', displayName: r.model }))
      ))
    }

    const allResults = await Promise.all(promises)
    const results = allResults.flat()

    if (results.length === 0) {
      item.matchStatus = 'none'
    } else {
      // 3. 二次比对逻辑：将后端返回的所有型号也进行归一化，与输入值进行“包含”匹配
      const inputNorm = normalize(item.rawModel)
      
      // 优先找完全一致的（归一化后一致）
      const exactMatch = results.find(r => normalize(r.displayName) === inputNorm)
      
      if (exactMatch) {
        selectMatch(item, exactMatch)
      } else {
        // 其次找包含关系的（比如输入 4114 命中 Intel Xeon 4114）
        const fuzzyMatch = results.find(r => normalize(r.displayName).includes(inputNorm))
        if (fuzzyMatch && results.length === 1) {
          // 如果只有一个模糊结果，自动选中
          selectMatch(item, fuzzyMatch)
        } else {
          // 否则让用户手动选择
          item.matchStatus = 'ambiguous'
          item.suggestions = results.slice(0, 5)
        }
      }
    }
  } catch (err) {
    console.error('Match error:', err)
    item.matchStatus = 'none'
  }
}

const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '')

const selectMatch = (item, match) => {
  item.matchStatus = 'matched'
  item.matchedModel = match.displayName
  item.matchedId = match.id
  item.matchedType = match.type
}

const resetMatch = (item) => {
  item.matchStatus = 'ambiguous'
}

const markAsManual = (item) => {
  item.matchStatus = 'none'
}

const handleConfirm = () => {
  if (step.value === 1) {
    show.value = false
    return
  }

  // 整理数据发回父组件
  const result = {
    cpu: null,
    motherboard: null,
    memory: [],
    storage: [],
    gpu: [],
    raid: [],
    lan: [],
    others: [],
    chassis: '',
    psu: ''
  }

  parsedItems.value.forEach(item => {
    const model = item.matchedModel || item.rawModel
    const count = item.quantity
    const type = item.manualType

    if (item.matchedType === 'CPU' || type === 'CPU') {
      result.cpu = { model, count, id: item.matchedId }
    } else if (item.matchedType === 'MB' || type === '主板') {
      result.motherboard = { model, count, id: item.matchedId }
    } else if (type === '机箱') {
      result.chassis = model
    } else if (type === '电源') {
      result.psu = model
    } else if (type === '内存') {
      result.memory.push({ model, count })
    } else if (type === '存储') {
      result.storage.push({ model, count })
    } else if (type === '阵列卡') {
      result.raid.push({ model, count })
    } else if (type === '网卡') {
      result.lan.push({ model, count })
    } else {
      // 启发式判断剩余项
      const lModel = model.toLowerCase()
      if (lModel.includes('rtx') || lModel.includes('gtx') || lModel.includes('tesla') || lModel.includes('a100') || lModel.includes('h100')) {
        result.gpu.push({ model, count })
      } else {
        result.others.push({ model, count })
      }
    }
  })

  emit('imported', result)
  show.value = false
}
</script>

<style scoped>
.batch-import-container {
  min-height: 200px;
}

.batch-textarea {
  min-height: 200px;
}

.help-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.parsed-list {
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 8px;
}

.parsed-item {
  background-color: var(--color-bg-subtle);
}

.item-input-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.value {
  font-size: var(--text-sm);
  font-weight: 500;
}

.type-select {
  width: 120px;
}

.suggestions {
  margin-top: 4px;
}
</style>

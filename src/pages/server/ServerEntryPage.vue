<!-- src/pages/server/ServerEntryPage.vue -->
<template>
  <div class="server-entry-page">
    <h1 class="page-title flex items-center justify-between">
      <span>服务器入库录入</span>
      <VaButton preset="secondary" icon="mdi-import" @click="showBatchImport = true">
        批量粘贴配置
      </VaButton>
    </h1>

    <VaForm ref="formRef" @submit.prevent="handleSubmit">
      <div class="layout-container">
        
        <!-- 第一行：标识/归属 与 核心配置 (左右并排) -->
        <div class="card-row">
          <!-- 1. 标识与归属 -->
          <VaCard class="flex-1 shadow-sm">
            <VaCardTitle>标识与归属</VaCardTitle>
            <VaCardContent>
              <div class="vertical-form mt-2">
                <VaDateInput v-model="entryDate" label="入库日期 *" required class="w-full mb-3" />
                <VaInput v-model="form.sn" label="序列号 (SN) *" placeholder="唯一序列号" required class="w-full mb-3" />
                <VaCounter v-model="form.number" label="入库数量 *" :min="1" class="mb-3" />
                <VaInput v-model="form.customer" label="客户名称 *" required class="w-full mb-3" />
                <VaInput v-model="form.owner" label="所属者" class="w-full mb-3" />
                <VaInput v-model="form.agent" label="代理商" class="w-full" />
              </div>
            </VaCardContent>
          </VaCard>

          <!-- 2. 核心配置 -->
          <VaCard class="flex-1 shadow-sm">
            <VaCardTitle>核心配置</VaCardTitle>
            <VaCardContent class="relative">
              <div class="vertical-form mt-2">
                <div class="cpu-container mb-3">
                  <label class="va-input-label cpu-standalone-label">CPU 型号 *</label>
                  <div class="cpu-input-row">
                    <VaInput
                      v-model="cpuKeyword"
                      placeholder="输入型号搜索..."
                      required
                      clearable
                      :loading="searchingCpu"
                      class="f-grow"
                      @update:model-value="handleCpuSearch"
                      @clear="clearCpu"
                    >
                      <template #prependInner>
                        <VaIcon name="mdi-magnify" size="small" />
                      </template>
                    </VaInput>
                    <VaButton
                      preset="secondary"
                      icon="mdi-plus"
                      class="cpu-add-btn"
                      title="新增 CPU 到数据库"
                      @click="showCpuAddModal = true"
                    >
                      录入新型号
                    </VaButton>
                  </div>
                  
                  <div v-if="cpuSuggestions.length > 0" class="suggestions-list">
                    <div
                      v-for="cpu in cpuSuggestions"
                      :key="cpu.id"
                      class="suggestion-item"
                      @click="onCpuSelect(cpu)"
                    >
                      <div class="suggestion-main">
                        <strong>{{ cpu.cpu_short_name }}</strong>
                        <VaChip size="small" color="info">{{ cpu.tdp }}W</VaChip>
                      </div>
                      <div class="suggestion-sub">{{ cpu.cores }}C/{{ cpu.threads }}T · {{ cpu.socket }}</div>
                    </div>
                  </div>
                </div>

                <VaCounter v-model="form.cpun" label="CPU 数量" :min="1" class="mb-3" />
                
                <!-- 主板：改为搜索式，解除与 CPU 的联动 -->
                <div class="cpu-container mb-3">
                  <label class="va-input-label cpu-standalone-label">主板型号 *</label>
                  <VaInput
                    v-model="mbKeyword"
                    placeholder="输入主板型号搜索..."
                    required
                    clearable
                    :loading="loadingMbs"
                    class="w-full"
                    @update:model-value="handleMbSearch"
                    @clear="clearMb"
                  >
                    <template #prependInner>
                      <VaIcon name="mdi-magnify" size="small" />
                    </template>
                  </VaInput>
                  
                  <div v-if="mbSuggestions.length > 0" class="suggestions-list">
                    <div
                      v-for="mb in mbSuggestions"
                      :key="mb.id"
                      class="suggestion-item"
                      @click="onMbSelect(mb)"
                    >
                      <div class="suggestion-main">
                        <strong>{{ mb.model }}</strong>
                        <VaChip size="small" color="secondary">{{ mb.manufacturer }}</VaChip>
                      </div>
                      <div class="suggestion-sub">{{ mb.chipset }} · {{ mb.socket }}</div>
                    </div>
                  </div>
                </div>
                
                <VaInput v-model="form.bmcpwd" label="BMC 密码" class="w-full mb-3" />
                <VaInput v-model="form.chassis" label="机箱型号" class="w-full mb-3" />
                <VaInput v-model="form.psu" label="电源信息" class="w-full" />
              </div>
            </VaCardContent>
          </VaCard>
        </div>

        <!-- 第二行：内存存储 与 扩展等 (左右并排) -->
        <div class="card-row">
          <!-- 3. 内存与存储 -->
          <VaCard class="flex-1 shadow-sm">
            <VaCardTitle>内存与存储清单</VaCardTitle>
            <VaCardContent>
              <div class="vertical-form mt-2">
                <!-- 内存：固定单项 -->
                <div class="mb-4">
                  <label class="group-label">内存配置 (固定单种型号)</label>
                  <div class="hw-row">
                    <VaInput v-model="form.mem" label="型号" placeholder="DDR4 32GB" class="f-grow" />
                    <VaCounter v-model="form.memn" label="数量" :min="1" class="hw-counter" />
                    <div class="btn-placeholder"></div>
                  </div>
                </div>

                <!-- 硬盘系列：保持动态 -->
                <div class="hw-group-box mb-4 pt-3 border-t">
                  <label class="group-label">硬盘清单 (支持多型号)</label>
                  <!-- M.2 -->
                  <div v-for="(item, idx) in hwLists.m2" :key="idx" class="hw-row mb-2">
                    <VaInput v-model="item.model" placeholder="M.2 型号" class="f-grow" />
                    <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                    <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('m2', idx)" />
                  </div>
                  <!-- SSD -->
                  <div v-for="(item, idx) in hwLists.ssd" :key="idx" class="hw-row mb-2">
                    <VaInput v-model="item.model" placeholder="SSD 型号" class="f-grow" />
                    <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                    <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('ssd', idx)" />
                  </div>
                  <!-- HDD -->
                  <div v-for="(item, idx) in hwLists.hdd" :key="idx" class="hw-row mb-2">
                    <VaInput v-model="item.model" placeholder="HDD 型号" class="f-grow" />
                    <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                    <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('hdd', idx)" />
                  </div>
                  <div class="flex gap-2">
                    <VaButton size="small" preset="secondary" @click="addHw('m2')">+ M.2</VaButton>
                    <VaButton size="small" preset="secondary" @click="addHw('ssd')">+ SSD</VaButton>
                    <VaButton size="small" preset="secondary" @click="addHw('hdd')">+ HDD</VaButton>
                  </div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- 4. 扩展与系统 -->
          <VaCard class="flex-1 shadow-sm">
            <VaCardTitle>扩展、显卡与系统</VaCardTitle>
            <VaCardContent>
              <div class="vertical-form mt-2">
                <!-- 扩展件：保持动态 -->
                <div class="hw-group-box mb-4">
                  <label class="group-label">扩展设备清单</label>
                  <div v-for="(item, idx) in hwLists.gpu" :key="idx" class="hw-row mb-2">
                    <VaInput v-model="item.model" placeholder="显卡型号" class="f-grow" />
                    <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                    <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('gpu', idx)" />
                  </div>
                  <div v-for="(item, idx) in hwLists.lan" :key="idx" class="hw-row mb-2">
                    <VaInput v-model="item.model" placeholder="网卡型号" class="f-grow" />
                    <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                    <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('lan', idx)" />
                  </div>
                  <div v-for="(item, idx) in hwLists.raid" :key="idx" class="hw-row mb-2">
                    <VaInput v-model="item.model" placeholder="阵列卡型号" class="f-grow" />
                    <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                    <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('raid', idx)" />
                  </div>
                  <div class="flex gap-2">
                    <VaButton size="small" preset="secondary" @click="addHw('gpu')">+ GPU</VaButton>
                    <VaButton size="small" preset="secondary" @click="addHw('lan')">+ LAN</VaButton>
                    <VaButton size="small" preset="secondary" @click="addHw('raid')">+ RAID</VaButton>
                  </div>
                </div>

                <!-- 系统与备注 -->
                <div class="system-box border-t pt-3">
                  <VaInput v-model="form.os" label="操作系统" placeholder="例如: CentOS 7.9" class="w-full mb-3" />
                  <VaTextarea v-model="form.note" label="备注信息" :min-rows="2" class="w-full" />
                </div>
              </div>
            </VaCardContent>
          </VaCard>
        </div>

      </div>

      <div class="flex justify-center gap-4 mt-8 mb-12">
        <VaButton preset="secondary" @click="resetForm">
          重置表单
        </VaButton>
        <VaButton type="submit" :loading="loading" icon="mdi-content-save">
          保存服务器入库
        </VaButton>
      </div>
    </VaForm>

    <!-- CPU 新增弹窗 -->
    <CpuAddModal
      v-model="showCpuAddModal"
      @saved="onCpuSaved"
    />

    <!-- 批量导入弹窗 -->
    <BatchImportModal
      v-model="showBatchImport"
      @imported="handleImported"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import debounce from 'lodash.debounce'
import { 
  VaCard, VaCardTitle, VaCardContent, VaInput, VaForm, VaButton, VaChip,
  VaDateInput, VaCounter, VaIcon, VaTextarea, VaSelect, useToast 
} from 'vuestic-ui'
import { createServer } from '../../api/server'
import { searchCpu, getMbBySocket } from '../../api/configPlan'
import { formatSocket } from '../../utils/hardware'
import CpuAddModal from '../../components/ConfigPlan/CpuAddModal.vue'
import BatchImportModal from '../../components/ConfigPlan/BatchImportModal.vue'

const { init: notify } = useToast()
const formRef = ref(null)
const loading = ref(false)
const entryDate = ref(new Date())

const cpuKeyword = ref('')
const mbKeyword = ref('')
const cpuSuggestions = ref([])
const mbSuggestions = ref([])
const searchingCpu = ref(false)
const loadingMbs = ref(false)
const showCpuAddModal = ref(false)
const showBatchImport = ref(false)

const hwLists = reactive({
  m2: [],
  ssd: [],
  hdd: [],
  lan: [],
  gpu: [],
  raid: []
})

const initialForm = {
  y: null, m: null, d: null,
  owner: '', agent: '', sn: '', customer: '', number: 1,
  chassis: '', psu: '', mb: '', mb_id: null, bmcpwd: '',
  cpu: '', cpu_id: null, cpun: 1,
  mem: '', memn: 2,
  m2: '', m2n: '',
  ssd: '', ssdn: '',
  hdd: '', hddn: '',
  raid: '', raidn: '',
  lan: '', lann: '',
  gpu: '', gpun: '',
  os: '', note: ''
}

const form = reactive({ ...initialForm })

/**
 * 处理批量导入的数据
 */
const handleImported = (data) => {
  if (data.cpu) {
    cpuKeyword.value = data.cpu.model
    form.cpu = data.cpu.model
    form.cpu_id = data.cpu.id
    form.cpun = data.cpu.count
  }

  if (data.motherboard) {
    mbKeyword.value = data.motherboard.model
    form.mb = data.motherboard.model
    form.mb_id = data.motherboard.id
  }

  if (data.memory && data.memory.length > 0) {
    // 内存目前表单只支持单一型号
    form.mem = data.memory[0].model
    form.memn = data.memory[0].count
  }

  // 填充存储
  data.storage.forEach(s => {
    const model = s.model.toLowerCase()
    if (model.includes('m.2') || model.includes('nvme')) {
      hwLists.m2.push({ model: s.model, count: s.count })
    } else if (model.includes('ssd')) {
      hwLists.ssd.push({ model: s.model, count: s.count })
    } else {
      hwLists.hdd.push({ model: s.model, count: s.count })
    }
  })

  // 填充扩展件
  data.gpu.forEach(g => hwLists.gpu.push({ model: g.model, count: g.count }))
  data.raid.forEach(r => hwLists.raid.push({ model: r.model, count: r.count }))
  data.lan.forEach(l => hwLists.lan.push({ model: l.model, count: l.count }))
  
  const unhandledOthers = []
  data.others.forEach(o => {
    const model = o.model.toLowerCase()
    if (model.includes('nic') || model.includes('lan') || model.includes('网卡')) {
      hwLists.lan.push({ model: o.model, count: o.count })
    } else if (model.includes('raid') || model.includes('阵列')) {
      hwLists.raid.push({ model: o.model, count: o.count })
    } else if (model.includes('rtx') || model.includes('gtx') || model.includes('tesla') || model.includes('a100') || model.includes('h100')) {
      hwLists.gpu.push({ model: o.model, count: o.count })
    } else {
      unhandledOthers.push(`${o.model}${o.count > 1 ? ' x' + o.count : ''}`)
    }
  })

  if (unhandledOthers.length > 0) {
    const othersText = unhandledOthers.join('; ')
    form.note = form.note ? `${form.note}\n${othersText}` : othersText
  }

  if (data.psu) {
    form.psu = data.psu
  }

  if (data.chassis) {
    form.chassis = data.chassis
  }

  notify({ message: '配置已批量填充，请检查并完善其它信息', color: 'info' })
}

const handleCpuSearch = debounce(async () => {
  if (!cpuKeyword.value || cpuKeyword.value.length < 2) {
    cpuSuggestions.value = []
    return
  }
  searchingCpu.value = true
  try {
    cpuSuggestions.value = await searchCpu({ keyword: cpuKeyword.value })
  } finally {
    searchingCpu.value = false
  }
}, 600)

const onCpuSelect = (cpu) => {
  if (!cpu) return
  cpuKeyword.value = cpu.cpu_short_name
  form.cpu = cpu.cpu_short_name
  form.cpu_id = cpu.id
  cpuSuggestions.value = []
}

/**
 * 当成功新增 CPU 后的处理逻辑：自动选中该 CPU
 */
const onCpuSaved = (newCpu) => {
  notify({ message: '新 CPU 已成功录入数据库并自动选中', color: 'success' })
  // 触发自动选中逻辑
  if (newCpu) {
    onCpuSelect(newCpu)
  }
  showCpuAddModal.value = false
}

const clearCpu = () => {
  cpuKeyword.value = ''
  form.cpu = ''
  form.cpu_id = null
  cpuSuggestions.value = []
}

/**
 * 主板搜索和选择逻辑 (独立)
 */
const handleMbSearch = debounce(async () => {
  if (!mbKeyword.value || mbKeyword.value.length < 2) {
    mbSuggestions.value = []
    return
  }
  loadingMbs.value = true
  try {
    const { searchMotherboard } = await import('../../api/configPlan')
    mbSuggestions.value = await searchMotherboard(mbKeyword.value)
  } finally {
    loadingMbs.value = false
  }
}, 600)

const onMbSelect = (mb) => {
  if (!mb) return
  mbKeyword.value = mb.model
  form.mb = mb.model
  form.mb_id = mb.id
  mbSuggestions.value = []
}

const clearMb = () => {
  mbKeyword.value = ''
  form.mb = ''
  form.mb_id = null
  mbSuggestions.value = []
}

const addHw = (key) => hwLists[key].push({ model: '', count: 1 })
const removeHw = (key, idx) => hwLists[key].splice(idx, 1)

const resetForm = () => {
  Object.assign(form, initialForm)
  entryDate.value = new Date()
  cpuKeyword.value = ''
  mbKeyword.value = ''
  cpuSuggestions.value = []
  mbSuggestions.value = []
  Object.keys(hwLists).forEach(k => { hwLists[k] = [] })
}

const handleSubmit = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) return

  loading.value = true
  try {
    form.y = entryDate.value.getFullYear()
    form.m = entryDate.value.getMonth() + 1
    form.d = entryDate.value.getDate()

    Object.keys(hwLists).forEach(key => {
      const validItems = hwLists[key].filter(i => i.model && i.model.trim())
      form[key] = validItems.map(i => i.model.trim()).join(';')
      form[key + 'n'] = validItems.map(i => i.count).join(';')
    })

    await createServer(form)
    notify({ message: '服务器入库成功！', color: 'success' })
    form.sn = ''
  } catch (err) {
    console.error('保存失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.server-entry-page {
  /* height: 100% - Removed to avoid vertical centering issues */
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.layout-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.card-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6);
}

.flex-1 {
  flex: 1;
  min-width: 400px;
}

.vertical-form {
  display: flex;
  flex-direction: column;
}

.hw-group-box {
  display: flex;
  flex-direction: column;
}

.group-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  margin-bottom: var(--space-2);
  display: block;
}

.hw-row {
  display: flex;
  gap: var(--space-2);
  align-items: flex-end;
}

.hw-counter {
  width: 120px;
}

.btn-placeholder {
  width: 36px;
  flex-shrink: 0;
}

:deep(.va-card__title) {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--space-4) var(--space-5);
}

.cpu-container {
  position: relative;
  margin-bottom: var(--space-3);
}

.cpu-standalone-label {
  display: block;
  margin-bottom: 4px;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

/* input 与按钮同行，按钮高度跟随 input */
.cpu-input-row {
  display: flex;
  gap: var(--space-2);
  align-items: stretch;
}

.cpu-add-btn {
  white-space: nowrap;
  flex-shrink: 0;
}

.border-t { border-top: 1px solid var(--color-border-light); }
</style>

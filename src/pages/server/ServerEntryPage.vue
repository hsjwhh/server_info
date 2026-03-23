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
                <VaDateInput v-model="entryDate" label="入库日期 *" :rules="requiredRule" class="w-full mb-3" />
                <VaInput
                  v-model="form.sn"
                  label="序列号 (SN) *"
                  placeholder="唯一序列号"
                  :rules="snRules"
                  :loading="checkingSn"
                  class="w-full mb-3"
                />
                <VaCounter v-model="form.number" label="入库数量 *" :min="1" class="mb-3" />
                <VaInput v-model="form.customer" label="客户名称 *" :rules="requiredRule" class="w-full mb-3" />
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
                    <!-- 方案 1：隐藏校验字段，绑定真正的业务约束 (form.cpu_id) -->
                    <VaInput
                      :model-value="form.cpu_id ? 'selected' : ''"
                      :rules="[(v) => !!v || '请从搜索结果中选择 CPU 型号']"
                      style="display: none"
                      aria-hidden="true"
                    />
                    <div class="flex gap-1">
                      <VaButton
                        v-if="form.cpu_id"
                        preset="secondary"
                        icon="mdi-pencil"
                        title="修改当前 CPU 规格"
                        @click="handleEditCpu"
                      />
                      <VaButton
                        preset="secondary"
                        icon="mdi-plus"
                        class="cpu-add-btn"
                        title="新增 CPU 到数据库"
                        @click="handleAddNewCpu"
                      >
                        录入
                      </VaButton>
                    </div>
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
                  <div class="cpu-input-row">
                    <VaInput
                      v-model="mbKeyword"
                      placeholder="输入主板型号搜索..."
                      clearable
                      :loading="loadingMbs"
                      class="f-grow"
                      @update:model-value="handleMbSearch"
                      @clear="clearMb"
                    >
                      <template #prependInner>
                        <VaIcon name="mdi-magnify" size="small" />
                      </template>
                    </VaInput>
                    <!-- 方案 1：隐藏校验字段，绑定真正的业务约束 (form.mb_id) -->
                    <VaInput
                      :model-value="form.mb_id ? 'selected' : ''"
                      :rules="[(v) => !!v || '请从搜索结果中选择主板型号']"
                      style="display: none"
                      aria-hidden="true"
                    />
                    <div class="flex gap-1">
                      <VaButton
                        v-if="form.mb_id"
                        preset="secondary"
                        icon="mdi-pencil"
                        title="修改当前主板规格"
                        @click="handleEditMb"
                      />
                      <VaButton
                        preset="secondary"
                        icon="mdi-plus"
                        class="cpu-add-btn"
                        title="新增主板到数据库"
                        @click="handleAddNewMb"
                      >
                        录入
                      </VaButton>
                    </div>
                  </div>
                  
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
                  <label class="group-label mb-3">硬盘清单 (支持多型号)</label>
                  
                  <!-- M.2 -->
                  <div v-if="hwLists.m2.length > 0" class="sub-group mb-3">
                    <label class="sub-label">M.2 SSD (NVMe)</label>
                    <div v-for="(item, idx) in hwLists.m2" :key="idx" class="hw-row mb-2">
                      <VaInput v-model="item.model" placeholder="M.2 型号" class="f-grow" />
                      <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                      <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('m2', idx)" />
                    </div>
                  </div>

                  <!-- SSD -->
                  <div v-if="hwLists.ssd.length > 0" class="sub-group mb-3">
                    <label class="sub-label">SATA/SAS SSD</label>
                    <div v-for="(item, idx) in hwLists.ssd" :key="idx" class="hw-row mb-2">
                      <VaInput v-model="item.model" placeholder="SSD 型号" class="f-grow" />
                      <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                      <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('ssd', idx)" />
                    </div>
                  </div>

                  <!-- HDD -->
                  <div v-if="hwLists.hdd.length > 0" class="sub-group mb-3">
                    <label class="sub-label">HDD 机械硬盘</label>
                    <div v-for="(item, idx) in hwLists.hdd" :key="idx" class="hw-row mb-2">
                      <VaInput v-model="item.model" placeholder="HDD 型号" class="f-grow" />
                      <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                      <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('hdd', idx)" />
                    </div>
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
                  <label class="group-label mb-3">扩展设备清单</label>

                  <!-- GPU -->
                  <div v-if="hwLists.gpu.length > 0" class="sub-group mb-3">
                    <label class="sub-label">显卡 (GPU / 加速卡)</label>
                    <div v-for="(item, idx) in hwLists.gpu" :key="idx" class="hw-row mb-2">
                      <VaInput v-model="item.model" placeholder="显卡型号" class="f-grow" />
                      <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                      <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('gpu', idx)" />
                    </div>
                  </div>

                  <!-- LAN -->
                  <div v-if="hwLists.lan.length > 0" class="sub-group mb-3">
                    <label class="sub-label">网络扩展 (NIC / LAN)</label>
                    <div v-for="(item, idx) in hwLists.lan" :key="idx" class="hw-row mb-2">
                      <VaInput v-model="item.model" placeholder="网卡型号" class="f-grow" />
                      <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                      <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('lan', idx)" />
                    </div>
                  </div>

                  <!-- RAID -->
                  <div v-if="hwLists.raid.length > 0" class="sub-group mb-3">
                    <label class="sub-label">存储控制 (RAID / HBA)</label>
                    <div v-for="(item, idx) in hwLists.raid" :key="idx" class="hw-row mb-2">
                      <VaInput v-model="item.model" placeholder="阵列卡型号" class="f-grow" />
                      <VaCounter v-model="item.count" :min="1" class="hw-counter" />
                      <VaButton icon="mdi-close" preset="plain" color="danger" @click="removeHw('raid', idx)" />
                    </div>
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

    <!-- CPU 新增/修改弹窗 -->
    <CpuAddModal
      v-model="showCpuAddModal"
      :init-data="currentEditCpu"
      @saved="onCpuSaved"
    />

    <!-- 主板 新增/修改弹窗 -->
    <MotherboardAddModal
      v-model="showMbAddModal"
      :init-data="currentEditMb"
      @saved="onMbSaved"
    />

    <!-- 批量导入弹窗 -->
    <BatchImportModal
      v-model="showBatchImport"
      @imported="handleImported"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import debounce from 'lodash.debounce'
import { 
  VaCard, VaCardTitle, VaCardContent, VaInput, VaForm, VaButton, VaChip,
  VaDateInput, VaCounter, VaIcon, VaTextarea, VaSelect, useToast 
} from 'vuestic-ui'
import { createServer, checkSnUnique } from '../../api/server'
import { 
  searchCpu, getCpuDetail, searchMotherboard, getMotherboardDetail 
} from '../../api/configPlan'
import CpuAddModal from '../../components/ConfigPlan/CpuAddModal.vue'
import MotherboardAddModal from '../../components/ConfigPlan/MotherboardAddModal.vue'
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
const showMbAddModal = ref(false)
const showBatchImport = ref(false)
const checkingSn = ref(false)

const currentEditCpu = ref(null)
const currentEditMb = ref(null)

const selectedCpuRaw = ref(null)
const selectedMbRaw = ref(null)

const DRAFT_KEY = 'server_entry_draft'

const requiredRule = [(v) => !!v || '此项必填']

/**
 * SN 同步校验规则（唯一性检查移至 handleSubmit 手动 await）
 */
const snRules = [
  (v) => !!v || '序列号必填',
  (v) => v.length >= 4 || '序列号至少4位',
]

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
 * 自动保存草稿逻辑
 */
watch([form, hwLists, entryDate], () => {
  // 仅在非加载状态下保存草稿
  if (loading.value) return
  
  localStorage.setItem(DRAFT_KEY, JSON.stringify({
    form: { ...form, sn: '' }, // 不保存 SN，防止恢复时触发校验
    hwLists,
    entryDate: entryDate.value,
    cpuKeyword: cpuKeyword.value,
    mbKeyword: mbKeyword.value
  }))
}, { deep: true })

/**
 * 恢复草稿
 */
const restoreDraft = () => {
  const draft = localStorage.getItem(DRAFT_KEY)
  if (!draft) return

  try {
    const data = JSON.parse(draft)
    Object.assign(form, data.form)
    Object.assign(hwLists, data.hwLists)
    if (data.entryDate) entryDate.value = new Date(data.entryDate)
    if (data.cpuKeyword) cpuKeyword.value = data.cpuKeyword
    if (data.mbKeyword) mbKeyword.value = data.mbKeyword
    
    notify({ message: '已自动恢复上次填写的草稿', color: 'info', duration: 4000 })
  } catch (e) {
    console.error('恢复草稿失败:', e)
  }
}

onMounted(() => {
  restoreDraft()
})

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

  if (data.psu) form.psu = data.psu
  if (data.chassis) form.chassis = data.chassis
  if (data.os) form.os = data.os

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
  selectedCpuRaw.value = cpu
  cpuSuggestions.value = []
}

const handleAddNewCpu = () => {
  currentEditCpu.value = null
  showCpuAddModal.value = true
}

const handleEditCpu = async () => {
  if (!form.cpu_id) return
  if (selectedCpuRaw.value && selectedCpuRaw.value.id === form.cpu_id && selectedCpuRaw.value.cores) {
    currentEditCpu.value = selectedCpuRaw.value
  } else {
    try {
      currentEditCpu.value = await getCpuDetail(form.cpu_id)
    } catch (e) {
      notify({ message: '获取 CPU 详情失败', color: 'danger' })
      return
    }
  }
  showCpuAddModal.value = true
}

const onCpuSaved = (newCpu) => {
  notify({ message: 'CPU 信息已更新并自动选中', color: 'success' })
  if (newCpu) onCpuSelect(newCpu)
  showCpuAddModal.value = false
}

const clearCpu = () => {
  cpuKeyword.value = ''
  form.cpu = ''
  form.cpu_id = null
  selectedCpuRaw.value = null
  cpuSuggestions.value = []
}

const handleMbSearch = debounce(async () => {
  if (!mbKeyword.value || mbKeyword.value.length < 2) {
    mbSuggestions.value = []
    return
  }
  loadingMbs.value = true
  try {
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
  selectedMbRaw.value = mb
  mbSuggestions.value = []
}

const handleAddNewMb = () => {
  currentEditMb.value = null
  showMbAddModal.value = true
}

const handleEditMb = async () => {
  if (!form.mb_id) return
  // 统一通过详情接口获取最新数据，确保规格完整
  try {
    currentEditMb.value = await getMotherboardDetail(form.mb_id)
  } catch (e) {
    currentEditMb.value = selectedMbRaw.value
  }
  showMbAddModal.value = true
}

const onMbSaved = (newMb) => {
  notify({ message: '主板信息已更新并自动选中', color: 'success' })
  if (newMb) onMbSelect(newMb)
  showMbAddModal.value = false
}

const clearMb = () => {
  mbKeyword.value = ''
  form.mb = ''
  form.mb_id = null
  selectedMbRaw.value = null
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
  localStorage.removeItem(DRAFT_KEY)
}

const handleSubmit = async () => {
  console.log('[Entry] handleSubmit triggered');
  
  // 方案 2：前置同步校验，不依赖 Vuestic async rule 竞态
  const missing = []
  if (!entryDate.value)                 missing.push('入库日期')
  if (!form.sn || form.sn.length < 4)  missing.push('序列号（至少4位）')
  if (!form.customer)                   missing.push('客户名称')
  if (!form.cpu_id)                     missing.push('CPU 型号（需从搜索结果选中）')
  if (!form.mb_id)                      missing.push('主板型号（需从搜索结果选中）')

  if (missing.length > 0) {
    notify({ message: `必填项未完善：${missing.join('、')}`, color: 'warning' })
    return
  }

  try {
    // 1. 手动 await SN 唯一性（不走 Vuestic rules，避免竞态）
    loading.value = true
    checkingSn.value = true
    try {
      const res = await checkSnUnique(form.sn)
      if (res && res.unique === false) {
        notify({ message: '该序列号已在库中，请核对', color: 'warning' })
        return
      }
    } catch (snErr) {
      console.error('SN check failed:', snErr)
      notify({ message: '序列号唯一性校验服务暂不可用，请稍后重试', color: 'danger' })
      return
    } finally {
      checkingSn.value = false
    }

    // 2. Vuestic 校验剩余同步规则
    console.log('[Debug] Starting form validation...');
    const isValid = await formRef.value.validate();
    console.log('[Debug] Validation result:', isValid);

    if (!isValid) {
      notify({ message: '表单校验未通过，请检查红色标注项', color: 'warning' });
      return;
    }

    console.log('[Debug] Proceeding to data transformation...');

    // 2. 日期转换
    if (entryDate.value instanceof Date && !isNaN(entryDate.value)) {
      form.y = entryDate.value.getFullYear();
      form.m = entryDate.value.getMonth() + 1;
      form.d = entryDate.value.getDate();
    } else {
      throw new Error('入库日期无效');
    }

    // 3. 硬件清单转换
    Object.keys(hwLists).forEach(key => {
      const list = hwLists[key];
      if (!Array.isArray(list)) return; // 防护逻辑

      const validItems = list.filter(i => i && i.model && i.model.trim());
      if (validItems.length === 0) {
        form[key] = '';
        form[key + 'n'] = '';
      } else if (validItems.length === 1) {
        form[key] = validItems[0].model.trim();
        form[key + 'n'] = validItems[0].count;
      } else {
        // 多型号合并协议
        form[key] = validItems.map(i => `${i.model.trim()} * ${i.count}`).join(';');
        form[key + 'n'] = 0; // 强制设为 0 作为多项标记
      }
    });

    // 4. 发送写库请求
    console.log('[Debug] Calling createServer API with payload:', JSON.parse(JSON.stringify(form)));
    const response = await createServer(form);
    console.log('[Debug] Server response:', response);

    notify({ message: '服务器入库成功！', color: 'success' });
    
    // 成功后清理
    localStorage.removeItem(DRAFT_KEY);
    resetForm();
    
  } catch (err) {
    console.error('[Error] Critical failure in handleSubmit:', err);
    notify({ 
      message: `保存失败: ${err.response?.data?.message || err.message || '未知错误'}`, 
      color: 'danger' 
    });
  } finally {
    loading.value = false;
    console.log('[End] handleSubmit finished');
  }
}
</script>

<style scoped>
.server-entry-page { display: flex; flex-direction: column; gap: var(--space-6); }
.layout-container { display: flex; flex-direction: column; gap: var(--space-6); }
.card-row { display: flex; flex-wrap: wrap; gap: var(--space-6); }
.flex-1 { flex: 1; min-width: 400px; }
.vertical-form { display: flex; flex-direction: column; }
.hw-group-box { display: flex; flex-direction: column; }
.group-label { font-size: var(--text-xs); font-weight: var(--font-weight-bold); color: var(--color-text-secondary); text-transform: uppercase; margin-bottom: var(--space-2); display: block; }
.sub-label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--va-secondary); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em; }
.hw-row { display: flex; gap: var(--space-2); align-items: flex-end; }
.hw-counter { width: 120px; }
.btn-placeholder { width: 36px; flex-shrink: 0; }
:deep(.va-card__title) { font-size: var(--text-base); font-weight: var(--font-weight-semibold); border-bottom: 1px solid var(--color-border-light); padding: var(--space-4) var(--space-5); }
.cpu-container { position: relative; margin-bottom: var(--space-3); }
.cpu-standalone-label { display: block; margin-bottom: 4px; font-size: var(--text-sm); font-weight: var(--font-weight-medium); color: var(--color-text-primary); }
.cpu-input-row { display: flex; gap: var(--space-2); align-items: stretch; }
.cpu-add-btn { white-space: nowrap; flex-shrink: 0; }
.border-t { border-top: 1px solid var(--color-border-light); }
</style>

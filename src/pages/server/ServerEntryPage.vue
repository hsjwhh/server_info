<!-- src/pages/server/ServerEntryPage.vue -->
<template>
  <div class="server-entry-page">
    <!-- 页面标题区 -->
    <div class="page-header mb-6">
      <div class="flex items-center gap-3">
        <VaIcon name="mdi-database-plus" size="large" color="primary" />
        <div>
          <h1 class="va-h3 mb-0">服务器入库录入</h1>
          <p class="text-secondary va-text-sm">严格对照数据库字段录入，支持硬件联动与多项序列化存储</p>
        </div>
      </div>
    </div>

    <VaForm ref="formRef" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-6">
        
        <!-- 第一行：标识与核心硬件 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 1. 标识与归属 -->
          <VaCard class="shadow-sm">
            <VaCardTitle>
              <VaIcon name="mdi-identifier" class="mr-2" color="primary" />
              标识与归属
            </VaCardTitle>
            <VaCardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <VaDateInput v-model="entryDate" label="入库日期 *" class="w-full" required />
                <VaInput v-model="form.sn" label="序列号 (SN) *" placeholder="唯一序列号或起始 SN" required />
                <VaCounter v-model="form.number" label="入库数量 (Quantity) *" :min="1" />
                <VaInput v-model="form.customer" label="客户名称 *" placeholder="最终用户" required />
                <VaInput v-model="form.owner" label="所属者" />
                <VaInput v-model="form.agent" label="代理商" />
              </div>
            </VaCardContent>
          </VaCard>

          <!-- 2. 核心硬件配置 -->
          <VaCard class="shadow-sm">
            <VaCardTitle>
              <VaIcon name="mdi-cpu-64-bit" class="mr-2" color="primary" />
              核心硬件配置
            </VaCardTitle>
            <VaCardContent class="flex flex-col gap-4 mt-2 relative">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- CPU 搜索：对齐 ConfigPlan 逻辑，文本框 + 自动补全 -->
                <div class="cpu-search-container">
                  <VaInput
                    v-model="cpuKeyword"
                    label="CPU 型号 *"
                    placeholder="输入型号搜索 (如 2680)"
                    required
                    clearable
                    :loading="searchingCpu"
                    @input="handleCpuSearch"
                    @clear="clearCpu"
                  >
                    <template #prependInner>
                      <VaIcon name="mdi-magnify" size="small" />
                    </template>
                  </VaInput>
                  
                  <!-- 搜索建议列表 (对齐 CpuSelector.vue 样式) -->
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
                      <div class="suggestion-sub">
                        {{ cpu.cores }}C/{{ cpu.threads }}T · {{ cpu.socket }}
                      </div>
                    </div>
                  </div>
                </div>

                <VaCounter v-model="form.cpun" label="CPU 数量" :min="1" />
                
                <!-- 主板选择 -->
                <VaSelect
                  v-model="selectedMbObj"
                  label="主板型号 *"
                  placeholder="选择兼容主板"
                  searchable
                  text-by="model"
                  track-by="id"
                  :options="mbOptions"
                  :disabled="!form.cpu"
                  :loading="loadingMbs"
                  @update:model-value="onMbSelect"
                />
                <VaInput v-model="form.bmcpwd" label="BMC 密码" type="password" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VaInput v-model="form.chassis" label="机箱型号" />
                <VaInput v-model="form.psu" label="电源信息" />
              </div>
            </VaCardContent>
          </VaCard>
        </div>

        <!-- 第二行：内存与存储 (全宽) -->
        <VaCard class="shadow-sm">
          <VaCardTitle>
            <VaIcon name="mdi-database-outline" class="mr-2" color="primary" />
            内存与存储清单
          </VaCardTitle>
          <VaCardContent class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
            <!-- 内存 -->
            <div class="hw-group">
              <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">内存条 (RAM)</label>
              <div v-for="(item, idx) in hwLists.mem" :key="idx" class="flex gap-2 mb-2">
                <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                <VaCounter v-model="item.count" :min="1" style="width: 80px" />
                <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('mem', idx)" />
              </div>
              <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('mem')">添加项</VaButton>
            </div>

            <!-- M.2 -->
            <div class="hw-group">
              <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">M.2 固态</label>
              <div v-for="(item, idx) in hwLists.m2" :key="idx" class="flex gap-2 mb-2">
                <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                <VaCounter v-model="item.count" :min="1" style="width: 80px" />
                <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('m2', idx)" />
              </div>
              <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('m2')">添加项</VaButton>
            </div>

            <!-- SSD -->
            <div class="hw-group">
              <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">SATA SSD</label>
              <div v-for="(item, idx) in hwLists.ssd" :key="idx" class="flex gap-2 mb-2">
                <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                <VaCounter v-model="item.count" :min="1" style="width: 80px" />
                <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('ssd', idx)" />
              </div>
              <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('ssd')">添加项</VaButton>
            </div>

            <!-- HDD -->
            <div class="hw-group">
              <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">机械硬盘 (HDD)</label>
              <div v-for="(item, idx) in hwLists.hdd" :key="idx" class="flex gap-2 mb-2">
                <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                <VaCounter v-model="item.count" :min="1" style="width: 80px" />
                <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('hdd', idx)" />
              </div>
              <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('hdd')">添加项</VaButton>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- 第三行：扩展与显卡 (全宽) -->
        <VaCard class="shadow-sm">
          <VaCardTitle>
            <VaIcon name="mdi-expansion-card-variant" class="mr-2" color="primary" />
            扩展、显卡与系统
          </VaCardTitle>
          <VaCardContent>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2 mb-6">
              <!-- GPU -->
              <div class="hw-group">
                <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">显卡 (GPU)</label>
                <div v-for="(item, idx) in hwLists.gpu" :key="idx" class="flex gap-2 mb-2">
                  <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                  <VaCounter v-model="item.count" :min="1" style="width: 80px" />
                  <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('gpu', idx)" />
                </div>
                <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('gpu')">添加项</VaButton>
              </div>

              <!-- LAN -->
              <div class="hw-group">
                <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">独立网卡 (LAN)</label>
                <div v-for="(item, idx) in hwLists.lan" :key="idx" class="flex gap-2 mb-2">
                  <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                  <VaCounter v-model="item.count" :min="1" style="width: 80px" />
                  <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('lan', idx)" />
                </div>
                <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('lan')">添加项</VaButton>
              </div>

              <!-- RAID -->
              <div class="hw-group">
                <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">阵列卡 (RAID)</label>
                <div v-for="(item, idx) in hwLists.raid" :key="idx" class="flex gap-2 mb-2">
                  <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                  <VaCounter v-model="item.count" :min="1" style="width: 80px" />
                  <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('raid', idx)" />
                </div>
                <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('raid')">添加项</VaButton>
              </div>
            </div>

            <VaDivider class="my-4" />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VaInput v-model="form.os" label="操作系统" placeholder="例如: CentOS 7.9 / Win Server" />
              <VaTextarea v-model="form.note" label="备注信息" :min-rows="2" placeholder="额外记录..." />
            </div>
          </VaCardContent>
        </VaCard>

      </div>

      <!-- 操作区 -->
      <div class="flex justify-center gap-4 mt-8 mb-12">
        <VaButton preset="secondary" color="secondary" size="large" @click="resetForm">
          重置表单
        </VaButton>
        <VaButton type="submit" :loading="loading" size="large" icon="mdi-content-save">
          保存服务器入库
        </VaButton>
      </div>
    </VaForm>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import debounce from 'lodash.debounce'
import { 
  VaCard, VaCardTitle, VaCardContent, VaInput, VaForm, VaButton, VaDivider, VaChip,
  VaDateInput, VaCounter, VaIcon, VaTextarea, VaSelect, useToast 
} from 'vuestic-ui'
import { createServer } from '../../api/server'
import { searchCpu, getMbBySocket } from '../../api/configPlan'

const { init: notify } = useToast()
const formRef = ref(null)
const loading = ref(false)
const entryDate = ref(new Date())

// 联动状态
const cpuKeyword = ref('')
const selectedMbObj = ref(null)
const cpuSuggestions = ref([])
const mbOptions = ref([])
const searchingCpu = ref(false)
const loadingMbs = ref(false)

// 动态硬件清单列表
const hwLists = reactive({
  mem: [{ model: '', count: 2 }],
  m2: [],
  ssd: [],
  hdd: [],
  lan: [],
  gpu: [],
  raid: []
})

// 基础表单
const initialForm = {
  y: null, m: null, d: null,
  owner: '', agent: '', sn: '', customer: '', number: 1,
  chassis: '', psu: '', mb: '', mb_id: null, bmcpwd: '',
  cpu: '', cpu_id: null, cpun: 1,
  mem: '', memn: '',
  m2: '', m2n: '',
  ssd: '', ssdn: '',
  hdd: '', hddn: '',
  raid: '', raidn: '',
  lan: '', lann: '',
  gpu: '', gpun: '',
  os: '', note: ''
}

const form = reactive({ ...initialForm })

// --- 联动逻辑 ---

const handleCpuSearch = debounce(async () => {
  if (!cpuKeyword.value || cpuKeyword.value.length < 2) {
    cpuSuggestions.value = []
    return
  }
  searchingCpu.value = true
  try {
    cpuSuggestions.value = await searchCpu(cpuKeyword.value)
  } finally {
    searchingCpu.value = false
  }
}, 600)

const onCpuSelect = async (cpu) => {
  if (!cpu) return
  cpuKeyword.value = cpu.cpu_short_name
  form.cpu = cpu.cpu_short_name
  form.cpu_id = cpu.id
  cpuSuggestions.value = [] // 清空建议列表
  
  // 联动加载主板
  loadingMbs.value = true
  mbOptions.value = []
  form.mb = ''
  form.mb_id = null
  selectedMbObj.value = null
  try {
    const socket = cpu.socket.startsWith('FCLGA') ? cpu.socket.replace('FCLGA', 'LGA-') : cpu.socket
    mbOptions.value = await getMbBySocket(socket)
  } finally {
    loadingMbs.value = false
  }
}

const clearCpu = () => {
  cpuKeyword.value = ''
  form.cpu = ''
  form.cpu_id = null
  cpuSuggestions.value = []
  mbOptions.value = []
  selectedMbObj.value = null
}

const onMbSelect = (mb) => {
  if (!mb) return
  form.mb = mb.model
  form.mb_id = mb.id
}

// --- 动态硬件管理 ---

const addHw = (key) => hwLists[key].push({ model: '', count: 1 })
const removeHw = (key, idx) => hwLists[key].splice(idx, 1)

const resetForm = () => {
  Object.assign(form, initialForm)
  entryDate.value = new Date()
  cpuKeyword.value = ''
  cpuSuggestions.value = []
  selectedMbObj.value = null
  Object.keys(hwLists).forEach(k => { hwLists[k] = [] })
  hwLists.mem = [{ model: '', count: 2 }]
}

// --- 提交处理 ---

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
  width: 100%;
}

.text-secondary {
  color: var(--color-text-secondary);
}

:deep(.va-card) {
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
}

:deep(.va-card__title) {
  font-size: var(--text-base);
  font-weight: 600;
  border-bottom: 1px solid var(--color-border-light);
  padding: 1rem 1.25rem;
}

/* CPU 建议列表样式对齐 CpuSelector.vue */
.cpu-search-container {
  position: relative;
  width: 100%;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  z-index: 1000;
  box-shadow: var(--shadow-lg);
  max-height: 280px;
  overflow-y: auto;
  margin-top: 2px;
}

.suggestion-item {
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  border-bottom: 1px solid var(--color-border-subtle);
  transition: background 0.2s;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: var(--color-bg-hover); }

.suggestion-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.suggestion-main strong {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}
.suggestion-sub {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

/* 局部布局辅助类 */
.grid { display: grid; }
.flex { display: flex; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.mb-0 { margin-bottom: 0; }
.mb-6 { margin-bottom: 1.5rem; }
.my-4 { margin-top: 1rem; margin-bottom: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-8 { margin-top: 2rem; }
.mb-12 { margin-bottom: 3rem; }
.w-full { width: 100%; }
.flex-grow { flex-grow: 1; }
</style>

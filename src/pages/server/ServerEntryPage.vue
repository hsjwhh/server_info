<!-- src/pages/server/ServerEntryPage.vue -->
<template>
  <div class="server-entry-page">
    <!-- 页面标题区，保持与 ConfigPlan 对齐 -->
    <div class="page-header mb-6">
      <div class="flex items-center gap-3">
        <VaIcon name="mdi-database-plus" size="large" color="primary" />
        <div>
          <h1 class="va-h3 mb-0">服务器入库录入</h1>
          <p class="text-secondary va-text-sm">标准化服务器配置入库，支持多硬件组合录入</p>
        </div>
      </div>
    </div>

    <VaForm ref="formRef" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- 左侧：基础与核心配置 (占据 7/12) -->
        <div class="lg:col-span-7 flex flex-col gap-6">
          
          <!-- 1. 标识信息 -->
          <VaCard class="shadow-sm">
            <VaCardTitle>
              <VaIcon name="mdi-identifier" class="mr-2" color="primary" />
              标识与归属
            </VaCardTitle>
            <VaCardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <VaDateInput v-model="entryDate" label="入库日期 *" class="w-full" required />
                <VaInput v-model="form.sn" label="序列号 (SN) *" placeholder="唯一标识" required />
                <VaInput v-model="form.number" label="资产编号" placeholder="内部管理编号" />
                <VaInput v-model="form.customer" label="客户名称 *" placeholder="最终用户" required />
                <VaInput v-model="form.owner" label="所属者" />
                <VaInput v-model="form.agent" label="代理商" />
              </div>
            </VaCardContent>
          </VaCard>

          <!-- 2. 核心硬件（联动逻辑） -->
          <VaCard class="shadow-sm">
            <VaCardTitle>
              <VaIcon name="mdi-cpu-64-bit" class="mr-2" color="primary" />
              核心硬件配置
            </VaCardTitle>
            <VaCardContent class="flex flex-col gap-4 mt-2">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- CPU 搜索 -->
                <VaSelect
                  v-model="selectedCpuObj"
                  label="CPU 型号 *"
                  placeholder="搜索并选择 CPU"
                  searchable
                  text-by="cpu_short_name"
                  track-by="id"
                  :options="cpuSuggestions"
                  :loading="searchingCpu"
                  @update:model-value="onCpuSelect"
                  @search="handleCpuSearch"
                />
                <VaCounter v-model="form.cpun" label="CPU 数量" :min="1" />
                
                <!-- 主板选择（基于 CPU 联动） -->
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

          <!-- 3. 备注与系统 -->
          <VaCard class="shadow-sm">
            <VaCardTitle>
              <VaIcon name="mdi-cog-outline" class="mr-2" color="primary" />
              系统与备注
            </VaCardTitle>
            <VaCardContent class="flex flex-col gap-4 mt-2">
              <VaInput v-model="form.os" label="操作系统" />
              <VaTextarea v-model="form.note" label="备注" :min-rows="3" />
            </VaCardContent>
          </VaCard>
        </div>

        <!-- 右侧：动态硬件清单 (占据 5/12) -->
        <div class="lg:col-span-5 flex flex-col gap-6">
          
          <!-- 内存与存储 -->
          <VaCard class="shadow-sm">
            <VaCardTitle>
              <VaIcon name="mdi-database-outline" class="mr-2" color="primary" />
              内存与存储清单
            </VaCardTitle>
            <VaCardContent class="flex flex-col gap-6 mt-2">
              <!-- 内存 -->
              <div class="hw-group">
                <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">内存条 (RAM)</label>
                <div v-for="(item, idx) in hwLists.mem" :key="idx" class="flex gap-2 mb-2">
                  <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                  <VaCounter v-model="item.count" :min="1" style="width: 100px" />
                  <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('mem', idx)" />
                </div>
                <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('mem')">添加内存项</VaButton>
              </div>

              <!-- M.2 -->
              <div class="hw-group border-t pt-4">
                <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">M.2 固态硬盘</label>
                <div v-for="(item, idx) in hwLists.m2" :key="idx" class="flex gap-2 mb-2">
                  <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                  <VaCounter v-model="item.count" :min="1" style="width: 100px" />
                  <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('m2', idx)" />
                </div>
                <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('m2')">添加 M.2</VaButton>
              </div>

              <!-- SATA SSD -->
              <div class="hw-group border-t pt-4">
                <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">SATA SSD</label>
                <div v-for="(item, idx) in hwLists.ssd" :key="idx" class="flex gap-2 mb-2">
                  <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                  <VaCounter v-model="item.count" :min="1" style="width: 100px" />
                  <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('ssd', idx)" />
                </div>
                <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('ssd')">添加 SSD</VaButton>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- 扩展卡 -->
          <VaCard class="shadow-sm">
            <VaCardTitle>
              <VaIcon name="mdi-expansion-card-variant" class="mr-2" color="primary" />
              扩展与显卡
            </VaCardTitle>
            <VaCardContent class="flex flex-col gap-6 mt-2">
              <!-- GPU -->
              <div class="hw-group">
                <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">显卡 (GPU)</label>
                <div v-for="(item, idx) in hwLists.gpu" :key="idx" class="flex gap-2 mb-2">
                  <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                  <VaCounter v-model="item.count" :min="1" style="width: 100px" />
                  <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('gpu', idx)" />
                </div>
                <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('gpu')">添加 GPU</VaButton>
              </div>

              <!-- NIC -->
              <div class="hw-group border-t pt-4">
                <label class="va-text-xs font-bold text-secondary uppercase mb-2 block">网卡 (NIC)</label>
                <div v-for="(item, idx) in hwLists.lan" :key="idx" class="flex gap-2 mb-2">
                  <VaInput v-model="item.model" placeholder="型号" class="flex-grow" />
                  <VaCounter v-model="item.count" :min="1" style="width: 100px" />
                  <VaButton icon="mdi-close" preset="secondary" color="danger" @click="removeHw('lan', idx)" />
                </div>
                <VaButton size="small" preset="primary" icon="mdi-plus" @click="addHw('lan')">添加网卡</VaButton>
              </div>
            </VaCardContent>
          </VaCard>
        </div>
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
  VaCard, VaCardTitle, VaCardContent, VaInput, VaForm, VaButton, 
  VaDateInput, VaCounter, VaIcon, VaTextarea, VaSelect, useToast 
} from 'vuestic-ui'
import { createServer } from '../../api/server'
import { searchCpu, getMbBySocket } from '../../api/configPlan'

const { init: notify } = useToast()
const formRef = ref(null)
const loading = ref(false)
const entryDate = ref(new Date())

// 联动状态
const selectedCpuObj = ref(null)
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
  owner: '', agent: '', sn: '', customer: '', number: '',
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

const handleCpuSearch = debounce(async (query) => {
  if (!query || query.length < 2) return
  searchingCpu.value = true
  try {
    cpuSuggestions.value = await searchCpu(query)
  } finally {
    searchingCpu.value = false
  }
}, 500)

const onCpuSelect = async (cpu) => {
  if (!cpu) return
  form.cpu = cpu.cpu_short_name
  form.cpu_id = cpu.id
  
  // 加载主板
  loadingMbs.value = true
  mbOptions.value = []
  form.mb = ''
  form.mb_id = null
  selectedMbObj.value = null
  try {
    // 兼容格式转换
    const socket = cpu.socket.startsWith('FCLGA') ? cpu.socket.replace('FCLGA', 'LGA-') : cpu.socket
    mbOptions.value = await getMbBySocket(socket)
  } finally {
    loadingMbs.value = false
  }
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
  selectedCpuObj.value = null
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
    // 1. 日期处理
    form.y = entryDate.value.getFullYear()
    form.m = entryDate.value.getMonth() + 1
    form.d = entryDate.value.getDate()

    // 2. 序列化动态清单 (用分号分隔)
    Object.keys(hwLists).forEach(key => {
      const validItems = hwLists[key].filter(i => i.model.trim())
      form[key] = validItems.map(i => i.model).join(';')
      form[key + 'n'] = validItems.map(i => i.count).join(';')
    })

    await createServer(form)
    notify({ message: '服务器入库成功！', color: 'success' })
    
    // 清除唯一标识，保留大部分配置以便连录
    form.sn = ''
    form.number = ''
  } catch (err) {
    console.error('提交失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 移除 max-width，由 Layout 容器控制宽度 */
.server-entry-page {
  width: 100%;
}

.text-secondary {
  color: var(--color-text-secondary);
}

.hw-group {
  position: relative;
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

:deep(.va-input-wrapper__label) {
  font-weight: 500;
}

/* 兼容布局类 */
.grid { display: grid; }
.flex { display: flex; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-8 { margin-top: 2rem; }
.mb-12 { margin-bottom: 3rem; }
.w-full { width: 100%; }
.flex-grow { flex-grow: 1; }
</style>

<!-- src/pages/server/ServerEntryPage.vue -->
<template>
  <div class="server-entry-page p-4">
    <div class="mb-4">
      <h1 class="va-h3 mb-1">服务器入库录入</h1>
      <p class="text-secondary va-text-sm">请详细填写服务器各项配置信息，带 * 的为必填项</p>
    </div>

    <VaForm ref="formRef" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- 1. 基础信息 & 标识 -->
        <VaCard class="p-4 shadow-sm">
          <VaCardTitle class="px-0">
            <VaIcon name="mdi-identifier" class="mr-2" color="primary" />
            基础信息 & 标识
          </VaCardTitle>
          <VaCardContent class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <VaDateInput
              v-model="entryDate"
              label="入库日期 *"
              class="w-full"
              required
            />
            <VaInput
              v-model="form.sn"
              label="序列号 (SN) *"
              placeholder="请输入 SN"
              required
              :rules="[(v) => !!v || 'SN 必须填写']"
            />
            <VaInput v-model="form.number" label="资产编号" placeholder="请输入资产编号" />
            <VaInput v-model="form.customer" label="客户名称 *" placeholder="例如: 某某银行" required />
            <VaInput v-model="form.owner" label="所属者" placeholder="请输入所属者" />
            <VaInput v-model="form.agent" label="代理商" placeholder="请输入代理商" />
          </VaCardContent>
        </VaCard>

        <!-- 2. 核心硬件 -->
        <VaCard class="p-4 shadow-sm">
          <VaCardTitle class="px-0">
            <VaIcon name="mdi-cpu-64-bit" class="mr-2" color="primary" />
            核心硬件
          </VaCardTitle>
          <VaCardContent class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <VaInput v-model="form.mb" label="主板型号" placeholder="主板型号" />
            <VaInput v-model="form.psu" label="电源信息" placeholder="电源型号/功率" />
            <VaInput v-model="form.chassis" label="机箱型号" placeholder="机箱型号" />
            <VaInput
              v-model="form.bmcpwd"
              label="BMC 密码"
              type="password"
              placeholder="BMC 初始密码"
            />
            <div class="col-span-1 md:col-span-2 grid grid-cols-3 gap-2">
              <VaInput v-model="form.cpu" label="CPU 型号" class="col-span-2" />
              <VaCounter v-model="form.cpun" label="数量" :min="0" />
            </div>
          </VaCardContent>
        </VaCard>

        <!-- 3. 内存与存储 -->
        <VaCard class="p-4 shadow-sm">
          <VaCardTitle class="px-0">
            <VaIcon name="mdi-database-outline" class="mr-2" color="primary" />
            内存与存储
          </VaCardTitle>
          <VaCardContent class="flex flex-col gap-4 mt-2">
            <div class="grid grid-cols-4 gap-2">
              <VaInput v-model="form.mem" label="内存型号" class="col-span-3" />
              <VaCounter v-model="form.memn" label="数量" :min="0" />
            </div>
            <div class="grid grid-cols-4 gap-2 border-t pt-4">
              <VaInput v-model="form.m2" label="M.2 固态" class="col-span-3" />
              <VaCounter v-model="form.m2n" label="数量" :min="0" />
            </div>
            <div class="grid grid-cols-4 gap-2">
              <VaInput v-model="form.ssd" label="SATA 固态" class="col-span-3" />
              <VaCounter v-model="form.ssdn" label="数量" :min="0" />
            </div>
            <div class="grid grid-cols-4 gap-2">
              <VaInput v-model="form.hdd" label="机械硬盘" class="col-span-3" />
              <VaCounter v-model="form.hddn" label="数量" :min="0" />
            </div>
          </VaCardContent>
        </VaCard>

        <!-- 4. 扩展 & 系统 -->
        <VaCard class="p-4 shadow-sm">
          <VaCardTitle class="px-0">
            <VaIcon name="mdi-expansion-card-variant" class="mr-2" color="primary" />
            扩展 & 系统
          </VaCardTitle>
          <VaCardContent class="flex flex-col gap-4 mt-2">
            <div class="grid grid-cols-4 gap-2">
              <VaInput v-model="form.raid" label="RAID 卡" class="col-span-3" />
              <VaCounter v-model="form.raidn" label="数量" :min="0" />
            </div>
            <div class="grid grid-cols-4 gap-2">
              <VaInput v-model="form.lan" label="独立网卡" class="col-span-3" />
              <VaCounter v-model="form.lann" label="数量" :min="0" />
            </div>
            <div class="grid grid-cols-4 gap-2">
              <VaInput v-model="form.gpu" label="显卡型号" class="col-span-3" />
              <VaCounter v-model="form.gpun" label="数量" :min="0" />
            </div>
            <VaInput v-model="form.os" label="操作系统" placeholder="例如: CentOS 7.9 / Windows Server" />
            <VaTextarea v-model="form.note" label="备注信息" placeholder="其他需要记录的特殊事项" />
          </VaCardContent>
        </VaCard>

      </div>

      <!-- 操作区 -->
      <div class="flex justify-center gap-4 mt-8 mb-12">
        <VaButton preset="secondary" color="secondary" @click="resetForm">
          重置表单
        </VaButton>
        <VaButton type="submit" :loading="loading" icon="mdi-content-save">
          保存入库
        </VaButton>
      </div>
    </VaForm>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { 
  VaCard, VaCardTitle, VaCardContent, VaInput, VaForm, VaButton, 
  VaDateInput, VaCounter, VaIcon, VaTextarea, useToast 
} from 'vuestic-ui'
import { createServer } from '../../api/server'

const { init: notify } = useToast()
const formRef = ref(null)
const loading = ref(false)
const entryDate = ref(new Date())

// 初始化表单对象，完全对应后端数据库字段
const initialForm = {
  y: null, m: null, d: null,
  owner: '', agent: '', sn: '', customer: '', number: '',
  chassis: '', psu: '', mb: '', mb_id: null, bmcpwd: '',
  cpu: '', cpu_id: null, cpun: 1,
  mem: '', memn: 2,
  m2: '', m2n: 0,
  ssd: '', ssdn: 0,
  hdd: '', hddn: 0,
  raid: '', raidn: 0,
  lan: '', lann: 0,
  gpu: '', gpun: 0,
  os: '', note: ''
}

const form = reactive({ ...initialForm })

const resetForm = () => {
  Object.assign(form, initialForm)
  entryDate.value = new Date()
}

const handleSubmit = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) return

  loading.value = true
  try {
    // 自动拆分日期对象为 y, m, d
    if (entryDate.value) {
      form.y = entryDate.value.getFullYear()
      form.m = entryDate.value.getMonth() + 1
      form.d = entryDate.value.getDate()
    }

    await createServer(form)
    
    notify({ message: '服务器入库成功！', color: 'success' })
    // 如果需要连录多台，可以询问是否保留配置，这里默认重置主要标识
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
.server-entry-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* 局部微调 VaCard 的阴影和边框 */
:deep(.va-card) {
  border: 1px solid var(--color-border-light);
}

:deep(.va-card__title) {
  border-bottom: 1px solid var(--color-border-light);
  font-weight: 600;
}

/* 辅助文字颜色 */
.text-secondary {
  color: var(--color-text-secondary);
}

.grid {
  display: grid;
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-2 { gap: 0.5rem; }
.p-4 { padding: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-8 { margin-top: 2rem; }
.mb-12 { margin-bottom: 3rem; }
.w-full { width: 100%; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
</style>

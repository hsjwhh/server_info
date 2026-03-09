<!-- src/components/ConfigPlan/CpuAddModal.vue -->
<template>
  <VaModal
    v-model="show"
    title="新增 CPU 规格信息"
    ok-text="确认添加"
    cancel-text="取消"
    size="large"
    fixed-layout
    @ok="handleSave"
  >
    <VaForm ref="formRef" class="cpu-add-form p-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- 第一组：核心标识 -->
        <div class="col-span-2 section-divider">基础标识 (Identity)</div>
        <VaInput
          v-model="form.cpu_short_name"
          label="CPU 简称 *"
          placeholder="例如: Xeon Platinum 8480+"
          required
          :rules="[v => !!v || '简称必填']"
          @input="syncSName"
        />
        <VaInput
          v-model="form.cpu_name"
          label="全称 *"
          placeholder="例如: Intel Xeon Platinum 8480+ Processor"
          required
          :rules="[v => !!v || '全称必填']"
        />
        <VaInput
          v-model="form.socket"
          label="封装接口 (Socket) *"
          placeholder="例如: FCLGA4677"
          required
          :rules="[v => !!v || '接口必填']"
        />
        <VaInput v-model="form.release_date" label="发行日期/系列" placeholder="Q1'23 或 4th Gen" />

        <!-- 第二组：性能规格 -->
        <div class="col-span-2 section-divider mt-4">性能参数 (Performance)</div>
        <div class="grid grid-cols-2 gap-2">
          <VaInput v-model.number="form.cores" type="number" label="内核数" />
          <VaInput v-model="form.tdp" label="TDP 功耗" placeholder="例如: 350W" />
        </div>
        <VaInput v-model="form.base_freq" label="基础频率" placeholder="3.8 GHz" />
        <VaInput v-model="form.max_turbo" label="最大睿频" placeholder="5.1 GHz" />
        <VaInput v-model="form.cache" label="缓存信息" placeholder="105 MB L3" />

        <!-- 第三组：内存与连接 -->
        <div class="col-span-2 section-divider mt-4">内存与扩展性 (I/O)</div>
        <VaInput v-model.number="form.memory_channels" type="number" label="内存通道数" />
        <VaInput v-model="form.memory_speed" label="支持频率" placeholder="DDR5 4800 MT/s" />
        <VaInput v-model="form.max_memory_capacity" label="最大内存容量" placeholder="4 TB" />
        <VaSelect
          v-model="form.ecc_support"
          label="ECC 支持"
          :options="['Yes', 'No']"
        />
        <VaInput v-model="form.pci" label="PCIe 信息" placeholder="PCIe 5.0 x80" />
        <VaInput v-model="form.scalability" label="最大路数 (Scalability)" placeholder="2S / 4S / 8S" />

      </div>
    </VaForm>
  </VaModal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { VaModal, VaForm, VaInput, VaSelect } from 'vuestic-ui'
import { addCpu } from '../../api/configPlan'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:model-value', 'saved'])

const show = ref(false)
const formRef = ref(null)

const initialForm = {
  cpu_s_name: '',
  cpu_short_name: '',
  cpu_name: '',
  release_date: '',
  cores: null,
  max_turbo: '',
  base_freq: '',
  cache: '',
  tdp: '',
  memory_channels: null,
  memory_speed: '',
  max_memory_speed: '',
  max_memory_capacity: '',
  ecc_support: 'Yes',
  socket: '',
  pci: '',
  scalability: '1P'
}

const form = reactive({ ...initialForm })

watch(() => props.modelValue, (val) => { show.value = val })
watch(show, (val) => { emit('update:model-value', val) })

// 自动同步搜索用的简称
const syncSName = (val) => {
  form.cpu_s_name = val.toUpperCase().replace(/\s+/g, '')
}

const handleSave = async (e) => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    // 阻止 VaModal 自动关闭
    e.preventDefault()
    return
  }

  try {
    const response = await addCpu(form)
    // 假设后端返回新增的对象或 ID
    emit('saved', response) 
    resetForm()
  } catch (err) {
    console.error('Failed to save CPU:', err)
    e.preventDefault()
  }
}

const resetForm = () => {
  Object.assign(form, initialForm)
}
</script>

<style scoped>
.section-divider {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--va-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 4px;
}

.cpu-add-form {
  max-height: 70vh;
  overflow-y: auto;
}

/* 适配 Vuestic 默认没有的类 */
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gap-4 { gap: 1rem; }
.gap-2 { gap: 0.5rem; }
.col-span-2 { grid-column: span 2 / span 2; }
.mt-4 { margin-top: 1rem; }
.p-2 { padding: 0.5rem; }
</style>

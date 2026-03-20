<!-- src/components/ConfigPlan/CpuAddModal.vue -->
<template>
  <VaModal
    v-model="show"
    :title="isEdit ? '修改 CPU 规格信息' : '新增 CPU 规格信息'"
    hide-default-actions
    size="large"
    fixed-layout
  >
    <VaForm ref="formRef" class="cpu-add-form p-2">
      <div class="grid grid-cols-2 gap-4">
        
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
        <VaInput v-model="form.release_date" label="发行日期/系列" placeholder="例如: Q1'23 或 4th Gen" />

        <!-- 第二组：性能规格 -->
        <div class="col-span-2 section-divider mt-4">性能参数 (Performance)</div>
        <div class="grid grid-cols-2 gap-2">
          <VaInput v-model.number="form.cores" type="number" label="内核数" />
          <VaInput v-model="form.tdp" label="TDP 功耗" placeholder="例如: 350W" />
        </div>
        <VaInput v-model="form.base_freq" label="处理器基本频率" placeholder="例如: 3.8 GHz" />
        <VaInput v-model="form.max_turbo" label="最大睿频频率" placeholder="例如: 5.1 GHz" />
        <VaInput v-model="form.cache" label="缓存" placeholder="例如: 105 MB L3" />

        <!-- 第三组：内存与连接 -->
        <div class="col-span-2 section-divider mt-4">内存与扩展性 (I/O)</div>
        <VaInput v-model.number="form.memory_channels" type="number" label="内存通道数" />
        <VaInput v-model="form.memory_speed" label="内存频率支持" placeholder="例如: DDR5 4800 MT/s" />
        <VaInput v-model="form.max_memory_speed" label="最大内存频率" placeholder="例如: 3200 MHz" />
        <VaInput v-model="form.max_memory_capacity" label="最大内存容量" placeholder="例如: 4 TB" />
        <VaSelect
          v-model="form.ecc_support"
          label="ECC 支持"
          :options="['Yes', 'No']"
        />
        <VaInput v-model="form.pci" label="PCIe 信息" placeholder="例如: PCIe 5.0 x80" />
        <VaInput v-model="form.scalability" label="最大路数 (Scalability)" placeholder="例如: 1S / 2S / 4S" />

      </div>
    </VaForm>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <VaButton preset="secondary" color="secondary" @click="show = false">取消</VaButton>
        <VaButton :loading="saving" @click="handleSave">
          {{ isEdit ? '保存修改' : '确认添加' }}
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { VaModal, VaForm, VaInput, VaSelect, VaButton } from 'vuestic-ui'
import { addCpu, updateCpu } from '../../api/configPlan'

const props = defineProps({
  modelValue: Boolean,
  initData: {
    type: Object,
    default: () => null
  }
})
const emit = defineEmits(['update:model-value', 'saved'])

const show = ref(false)
const formRef = ref(null)
const saving = ref(false)
const isEdit = computed(() => !!(props.initData && (props.initData.id || props.initData.hashId)))

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
  scalability: '1S'
}

const form = reactive({ ...initialForm })

watch(() => props.modelValue, (val) => { 
  show.value = val 
  if (val && props.initData) {
    Object.assign(form, initialForm)
    Object.keys(initialForm).forEach(key => {
      if (props.initData[key] !== undefined) {
        form[key] = props.initData[key]
      }
    })
  } else if (val && !props.initData) {
    resetForm()
  }
})
watch(show, (val) => { emit('update:model-value', val) })

const syncSName = () => {
  form.cpu_s_name = (form.cpu_short_name || '').toUpperCase().replace(/\s+/g, '')
}

const handleSave = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) return

  saving.value = true
  try {
    let response
    if (isEdit.value) {
      const id = props.initData.id || props.initData.hashId
      response = await updateCpu(id, form)
    } else {
      response = await addCpu(form)
    }
    
    emit('saved', response)
    show.value = false
    resetForm()
  } catch (err) {
    console.error('Save failed:', err)
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  Object.assign(form, initialForm)
}
</script>

<style scoped>
.cpu-add-form {
  max-height: 70vh;
  overflow-y: auto;
}

/* 布局工具类 */
.grid         { display: grid; }
.grid-cols-2  { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gap-4        { gap: 1rem; }
.gap-2        { gap: 0.5rem; }
.col-span-2   { grid-column: span 2 / span 2; }
.mt-4         { margin-top: 1rem; }
.p-2          { padding: 0.5rem; }
</style>

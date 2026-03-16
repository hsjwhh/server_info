<!-- src/components/ConfigPlan/MotherboardAddModal.vue -->
<template>
  <VaModal
    v-model="show"
    title="新增主板信息"
    ok-text="确认添加"
    cancel-text="取消"
    size="large"
    fixed-layout
    @ok="handleSave"
  >
    <VaForm ref="formRef" class="mb-add-form p-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- 第一组：基础信息 -->
        <div class="col-span-2 section-divider">基础信息 (General)</div>
        <VaInput
          v-model="form.model"
          label="主板型号 *"
          placeholder="例如: X11DPi-N"
          required
          :rules="[v => !!v || '主板型号必填']"
        />
        <VaInput
          v-model="form.url"
          label="主板详情网址 *"
          placeholder="例如: https://www.supermicro.com/..."
          required
          :rules="[v => !!v || '详情网址必填']"
        />
        <VaInput
          v-model="form.product_collection"
          label="产品系列"
          placeholder="例如: 第 2 代 Intel® Xeon® 可扩展处理器"
          class="col-span-2"
        />

        <!-- 第二组：CPU 支持 -->
        <div class="col-span-2 section-divider mt-4">处理器支持 (CPU Support)</div>
        <VaInput
          v-model="form.sockets"
          label="插槽类型 (Sockets) *"
          placeholder="例如: LGA3647 / AM5"
          required
          :rules="[v => !!v || '插槽类型必填']"
        />
        <VaInput v-model="form.cpu_number" label="插槽数量" placeholder="例如: 2 / Single" />
        <VaInput v-model="form.max_tdp" label="支持最大 TDP" placeholder="例如: 205W" />

        <!-- 第三组：内存规格 -->
        <div class="col-span-2 section-divider mt-4">内存规格 (Memory)</div>
        <VaInput
          v-model="form.memory_type"
          label="内存类型支持"
          placeholder="例如: 2933/2666/2400/2133 MT/s ECC DDR4"
          class="col-span-2"
        />
        <VaInput v-model="form.dimm_number" label="插槽数量 (DIMMs)" placeholder="例如: 16" />
        <VaInput v-model="form.max_memory" label="最大容量" placeholder="例如: 4TB / 128GB" />

        <!-- 第四组：扩展与接口 -->
        <div class="col-span-2 section-divider mt-4">扩展能力 (I/O & Expansion)</div>
        <VaInput v-model="form.pcie_number" label="PCIe 数量" placeholder="例如: 4" />
        <VaInput v-model="form.pcie_list" label="PCIe 分布" placeholder="例如: 4 PCI-E 3.0 x16" />
        <VaInput v-model="form.m2" label="M.2 接口" placeholder="例如: 1 M.2 接口" />
        <VaInput v-model="form.input" label="其他接口" placeholder="例如: SATA 3.0" />

      </div>
    </VaForm>
  </VaModal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { VaModal, VaForm, VaInput } from 'vuestic-ui'
import { addMotherboard } from '../../api/configPlan'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:model-value', 'saved'])

const show = ref(false)
const formRef = ref(null)

const initialForm = {
  url: '',
  model: '',
  product_collection: '',
  sockets: '',
  cpu_number: '',
  max_tdp: '',
  memory_type: '',
  dimm_number: '',
  max_memory: '',
  pcie_number: '',
  pcie_list: '',
  m2: '',
  input: ''
}

const form = reactive({ ...initialForm })

watch(() => props.modelValue, (val) => { show.value = val })
watch(show, (val) => { emit('update:model-value', val) })

const handleSave = async (e) => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    e.preventDefault()
    return
  }

  try {
    const response = await addMotherboard(form)
    emit('saved', response)
    resetForm()
  } catch (err) {
    console.error('Failed to save motherboard:', err)
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

.mb-add-form {
  max-height: 70vh;
  overflow-y: auto;
}

/* Layout helpers */
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gap-4 { gap: 1rem; }
.col-span-2 { grid-column: span 2 / span 2; }
.mt-4 { margin-top: 1rem; }
.p-2 { padding: 0.5rem; }
</style>

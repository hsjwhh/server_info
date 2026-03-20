<!-- src/components/ConfigPlan/MotherboardAddModal.vue -->
<template>
  <VaModal
    v-model="show"
    :title="isEdit ? '修改主板信息' : '新增主板信息'"
    hide-default-actions
    size="large"
    fixed-layout
  >
    <VaForm ref="formRef" class="mb-add-form p-2">
      <div class="grid grid-cols-2 gap-4">

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

        <!-- PCIe：数量（窄）+ 分布（textarea）同行 -->
        <div class="col-span-2 pcie-row">
          <VaInput
            v-model.number="form.pcie_number"
            type="number"
            label="PCIe 数量"
            placeholder="例如: 4"
            class="pcie-number-input"
            :min="0"
            :max="99"
          />
          <VaTextarea
            v-model="form.pcie_list"
            label="PCIe 分布（每行一条）"
            placeholder="例如:&#10;4 PCI-E 3.0 x16&#10;2 PCI-E 3.0 x8"
            autosize
            :min-rows="2"
            :max-rows="6"
            class="pcie-list-textarea"
          />
        </div>

        <!-- M.2 接口：多行 -->
        <VaTextarea
          v-model="form.m2"
          label="M.2 接口（每行一条）"
          placeholder="例如:&#10;1 M.2 PCIe 4.0 x4&#10;1 M.2 SATA"
          autosize
          :min-rows="2"
          :max-rows="6"
          class="col-span-2"
        />

        <!-- 其他接口：多行 -->
        <VaTextarea
          v-model="form.input"
          label="其他接口（每行一条）"
          placeholder="例如:&#10;8x SATA 3.0&#10;2x USB 3.2 Gen2"
          autosize
          :min-rows="2"
          :max-rows="6"
          class="col-span-2"
        />

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
import { VaModal, VaForm, VaInput, VaTextarea, VaButton } from 'vuestic-ui'
import { addMotherboard, updateMotherboard } from '../../api/configPlan'

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

// 多行字段列表
const MULTILINE_FIELDS = ['pcie_list', 'm2', 'input']

// DB 存取转换：换行 <-> 中文分号
const toDb   = (str) => (str || '').split('\n').map(s => s.trim()).filter(Boolean).join('；')
const fromDb = (str) => (str || '').split('；').join('\n')

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
  pcie_number: null,
  pcie_list: '',
  m2: '',
  input: ''
}

const form = reactive({ ...initialForm })

watch(() => props.modelValue, (val) => {
  show.value = val
  if (val && props.initData) {
    console.log('[MbAddModal] Loading initData:', props.initData)
    Object.assign(form, initialForm)
    Object.keys(initialForm).forEach(key => {
      if (props.initData[key] !== undefined) {
        form[key] = MULTILINE_FIELDS.includes(key)
          ? fromDb(props.initData[key])
          : props.initData[key]
      }
    })
  } else if (val && !props.initData) {
    resetForm()
  }
})
watch(show, (val) => { emit('update:model-value', val) })

const handleSave = async () => {
  console.log('[MbAddModal] handleSave triggered')
  const isValid = await formRef.value.validate()
  if (!isValid) {
    console.warn('[MbAddModal] Form validation failed')
    return
  }

  saving.value = true
  // 构造提交数据
  const payload = { ...form }
  MULTILINE_FIELDS.forEach(key => {
    payload[key] = toDb(form[key])
  })

  try {
    let response
    if (isEdit.value) {
      const id = props.initData.id || props.initData.hashId
      console.log('[MbAddModal] Calling updateMotherboard API for ID:', id)
      response = await updateMotherboard(id, payload)
    } else {
      console.log('[MbAddModal] Calling addMotherboard API')
      response = await addMotherboard(payload)
    }
    emit('saved', response)
    show.value = false
    resetForm()
  } catch (err) {
    console.error('[MbAddModal] Save failed:', err)
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  Object.assign(form, initialForm)
}
</script>

<style scoped>
.mb-add-form {
  max-height: 70vh;
  overflow-y: auto;
}

.grid         { display: grid; }
.grid-cols-2  { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gap-4        { gap: 1rem; }
.col-span-2   { grid-column: span 2 / span 2; }
.mt-4         { margin-top: 1rem; }
.p-2          { padding: 0.5rem; }

.pcie-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}
.pcie-number-input {
  width: 90px;
  flex-shrink: 0;
}
.pcie-list-textarea {
  flex: 1;
}
</style>

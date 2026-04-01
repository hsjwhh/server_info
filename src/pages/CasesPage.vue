<!-- src/pages/CasesPage.vue -->
<template>
  <div class="cases-page">
    <div class="page-header mb-6 flex items-center justify-between">
      <h1 class="page-title">工单管理</h1>
    </div>

    <VaCard class="mb-6">
      <VaCardContent>
        <div class="flex flex-wrap gap-4 items-end">
          <div class="w-48">
            <div class="text-xs text-secondary mb-1">状态筛选</div>
            <VaSelect
              v-model="statusFilter"
              :options="STATUS_OPTIONS"
              value-by="value"
              text-by="text"
              placeholder="选择状态"
            />
          </div>
          <VaButton icon="mdi-magnify" @click="handleSearch">搜索</VaButton>
          <VaButton preset="secondary" @click="resetFilters">重置</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardContent>
        <VaDataTable
          :items="cases"
          :columns="columns"
          :loading="loading"
          hoverable
          class="cases-table"
        >
          <template #cell(status)="{ value }">
            <VaChip :color="getStatusColor(value)" size="small">
              {{ getStatusLabel(value) }}
            </VaChip>
          </template>

          <template #cell(created_at)="{ value }">
            {{ formatDate(value) }}
          </template>

          <template #cell(actions)="{ rowData }">
            <VaButton
              preset="plain"
              icon="mdi-pencil-outline"
              size="small"
              title="详情/编辑"
              @click="openEditModal(rowData)"
            />
          </template>
        </VaDataTable>

        <div class="flex justify-center mt-6">
          <VaPagination
            v-model="currentPage"
            :pages="totalPages"
            :visible-pages="5"
            buttons-preset="secondary"
            @update:model-value="fetchData"
          />
        </div>
      </VaCardContent>
    </VaCard>

    <!-- 编辑/详情弹窗 -->
    <VaModal
      v-model="showEditModal"
      title="工单详情"
      :ok-text="isAdmin ? '保存修改' : '关闭'"
      :cancel-text="isAdmin ? '取消' : ''"
      :hide-default-actions="!isAdmin"
      fixed-layout
      @ok="handleUpdate"
    >
      <div v-if="editingCase" class="flex flex-col gap-4 py-2" style="min-width: 400px;">
        <div class="grid grid-cols-2 gap-4">
          <VaInput label="工单号" v-model="editingCase.case_no" readonly />
          <VaInput label="服务器 SN" v-model="editingCase.sn" readonly />
        </div>
        
        <VaTextarea
          label="问题描述"
          v-model="editingCase.description"
          readonly
          autosize
          :min-rows="2"
        />

        <VaDivider />

        <div class="text-sm font-bold mb-1">处理操作</div>
        
        <VaSelect
          v-model="editForm.status"
          label="更新状态"
          :options="STATUS_OPTIONS.filter(o => o.value !== '')"
          value-by="value"
          text-by="text"
          :readonly="!isAdmin"
        />

        <VaTextarea
          label="解决方案"
          v-model="editForm.solution"
          placeholder="请填写解决方案..."
          :readonly="!isAdmin"
          autosize
          :min-rows="3"
        />
        
        <div v-if="!isAdmin" class="text-xs text-secondary italic">
          注：仅管理员可更新工单状态及方案。
        </div>
      </div>
      <template #footer v-if="!isAdmin">
        <VaButton @click="showEditModal = false">关闭</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import { getCases, updateCase } from '../api/cases'
import { usePermission } from '../composables/usePermission'

const { init: notify } = useToast()
const { isAdmin } = usePermission()

// 筛选与分页
const statusFilter = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 20

// 数据
const cases = ref([])
const loading = ref(false)

const STATUS_OPTIONS = [
  { text: '全部', value: '' },
  { text: '待处理', value: 'open' },
  { text: '处理中', value: 'processing' },
  { text: '已解决', value: 'resolved' },
  { text: '已关闭', value: 'closed' },
]

const columns = [
  { key: 'case_no', label: '工单号', sortable: true },
  { key: 'sn', label: '服务器 SN' },
  { key: 'customer', label: '客户' },
  { key: 'issue_type', label: '问题类型' },
  { key: 'status', label: '状态' },
  { key: 'created_by_name', label: '创建人' },
  { key: 'created_at', label: '创建时间', sortable: true },
  { key: 'actions', label: '操作', align: 'center' },
]

// 详情/编辑相关
const showEditModal = ref(false)
const editingCase = ref(null)
const editForm = reactive({
  status: '',
  solution: ''
})

const getStatusColor = (status) => {
  const map = {
    open: 'warning',
    processing: 'info',
    resolved: 'success',
    closed: 'secondary'
  }
  return map[status] || 'primary'
}

const getStatusLabel = (status) => {
  const option = STATUS_OPTIONS.find(o => o.value === status)
  return option ? option.text : status
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${m}-${d} ${h}:${min}`
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize,
      status: statusFilter.value || undefined
    }
    const res = await getCases(params)
    cases.value = res.list || []
    totalPages.value = Math.ceil((res.total || 0) / pageSize) || 1
  } catch (err) {
    notify({ message: '获取工单列表失败', color: 'danger' })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const resetFilters = () => {
  statusFilter.value = ''
  currentPage.value = 1
  fetchData()
}

const openEditModal = (rowData) => {
  editingCase.value = { ...rowData }
  editForm.status = rowData.status
  editForm.solution = rowData.solution || ''
  showEditModal.value = true
}

const handleUpdate = async () => {
  if (!isAdmin.value) return
  
  try {
    await updateCase(editingCase.value.id, {
      status: editForm.status,
      solution: editForm.solution
    })
    notify({ message: '工单更新成功', color: 'success' })
    fetchData()
  } catch (err) {
    notify({ message: '更新失败', color: 'danger' })
  }
}

onMounted(fetchData)
</script>

<style scoped>
.cases-table :deep(.va-data-table__table) {
  font-size: 0.9rem;
}
</style>

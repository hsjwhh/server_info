<!-- src/pages/CasesPage.vue -->
<template>
  <div class="cases-page">
    <div class="page-header mb-6">
      <h1 class="page-title">工单记录</h1>
    </div>

    <VaCard class="cases-filter-card">
      <VaCardContent>
        <div class="filters-toolbar">
          <div class="filter-field">
            <div class="filter-label">Filter Records</div>
            <VaSelect
              v-model="statusFilter"
              :options="STATUS_OPTIONS"
              value-by="value"
              text-by="text"
              placeholder="Select status"
            />
          </div>
          <div class="filter-field filter-field--stat">
            <div class="filter-label">Viewing</div>
            <div class="filter-inline-value">{{ totalCount }} work orders</div>
          </div>
          <div class="filter-actions">
            <VaButton
              class="filter-button filter-button--search"
              icon="mdi-magnify"
              @click="handleSearch"
            >
              Search
            </VaButton>
            <VaButton
              class="filter-button"
              preset="secondary"
              border-color="primary"
              @click="resetFilters"
            >
              Reset
            </VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <div v-if="loading" class="cases-loading">
      <VaProgressCircle indeterminate size="small" />
    </div>

    <div v-else-if="cases.length === 0" class="cases-empty">
      <VaIcon name="mdi-briefcase-remove-outline" size="40px" color="secondary" />
      <div class="cases-empty__title">暂无工单记录</div>
      <div class="cases-empty__desc">当前筛选条件下没有匹配结果。</div>
    </div>

    <div v-else class="cases-board">
      <CaseRecordCard
        v-for="caseItem in cases"
        :key="caseItem.id"
        :case-item="caseItem"
        :format-date="formatDate"
        action-label="Details"
        description-label="Problem Description"
        solution-label="Resolution Steps"
        :fields="getCaseFields(caseItem)"
        @action="openEditModal"
      />
    </div>

    <div class="cases-pagination">
      <VaPagination
        v-model="currentPage"
        :pages="totalPages"
        :visible-pages="5"
        buttons-preset="secondary"
        @update:model-value="fetchData"
      />
    </div>

    <!-- 编辑/详情弹窗 -->
    <VaModal
      v-model="showEditModal"
      :ok-text="isAdmin ? '保存修改' : '关闭'"
      :cancel-text="isAdmin ? '取消' : ''"
      :hide-default-actions="true"
      size="large"
      class="case-edit-modal"
      fixed-layout
    >
      <CaseFormPanel
        v-if="editingCase"
        eyebrow="Edit Work Order"
        title="编辑工单"
        :title-accent="editingCase.case_no"
        :subtitle="`最后更新时间 ${formatDate(editingCase.updated_at || editingCase.created_at)}`"
        :cancel-text="isAdmin ? '取消' : '关闭'"
        submit-text="保存修改"
        :show-submit="isAdmin"
        :general-fields="editGeneralFields"
        :description-model="descriptionModel"
        description-label="问题描述"
        :description-readonly="true"
        :description-rows="4"
        :resolution-model="resolutionModel"
        resolution-label="解决方案"
        resolution-placeholder="请填写解决方案..."
        :resolution-readonly="!isAdmin"
        :resolution-rows="5"
        :readonly-tip="!isAdmin ? '注：仅管理员可更新工单状态及方案。' : ''"
        @cancel="showEditModal = false"
        @submit="handleUpdate"
      />

      <VaCard v-if="editingCase" class="case-attachments-panel">
        <VaCollapse v-model="attachmentsExpanded" class="w-full">
          <template #header="{ value }">
            <div class="case-attachments-panel__header">
              <div class="case-attachments-panel__title-wrap">
                <VaIcon :name="value ? 'mdi-chevron-down' : 'mdi-chevron-right'" color="secondary" />
                <div>
                  <div class="case-attachments-panel__title">工单附件</div>
                  <div class="case-attachments-panel__meta">
                    {{ attachmentsLoading ? '附件加载中...' : `共 ${caseAttachments.length} 张图片，可上传故障截图和维修凭证` }}
                  </div>
                </div>
              </div>
            </div>
          </template>

          <div class="case-attachments-panel__body">
            <ServerImageGalleryPanel
              title="工单附件"
              upload-title="上传图片到工单附件区"
              upload-description="支持拖拽或点击选择，上传故障截图、维修照片和处理凭证。"
              entity-type="case"
              :entity-id="editingCase.id"
              :attachments="caseAttachments"
              :attachments-loading="attachmentsLoading"
              @uploaded="fetchCaseAttachments"
            />
          </div>
        </VaCollapse>
      </VaCard>
    </VaModal>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, toRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vuestic-ui'
import { getCaseDetail, getCases, updateCase } from '../api/cases'
import { getAttachments } from '../api/attachments'
import CaseFormPanel from '../components/CaseFormPanel.vue'
import CaseRecordCard from '../components/CaseRecordCard.vue'
import ServerImageGalleryPanel from '../components/ServerDetail/ServerImageGalleryPanel.vue'
import { usePermission } from '../composables/usePermission'
import { CASE_STATUS_OPTIONS, getCaseStatusLabel } from '../utils/caseStatus'

const route = useRoute()
const router = useRouter()
const { init: notify } = useToast()
const { isAdmin } = usePermission()

// 筛选与分页
const statusFilter = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const pageSize = 20

// 数据
const cases = ref([])
const loading = ref(false)

const STATUS_OPTIONS = CASE_STATUS_OPTIONS

// 详情/编辑相关
const showEditModal = ref(false)
const editingCase = ref(null)
const editForm = reactive({
  status: '',
  solution: ''
})
const caseAttachments = ref([])
const attachmentsLoading = ref(false)
const attachmentsExpanded = ref(false)

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${m}-${d} ${h}:${min}`
}

const getCaseFields = (caseItem) => [
  { label: 'Server SN', value: caseItem.sn || '-' },
  { label: 'Customer', value: caseItem.customer || '-' },
  { label: 'Issue Type', value: caseItem.issue_type || '未分类' },
  { label: 'Status', value: getCaseStatusLabel(caseItem.status) },
]

const editStatusModel = toRef(editForm, 'status')
const resolutionModel = toRef(editForm, 'solution')
const descriptionModel = computed({
  get: () => editingCase.value?.description || '',
  set: (value) => {
    if (editingCase.value) {
      editingCase.value.description = value
    }
  }
})

const editGeneralFields = computed(() => {
  if (!editingCase.value) return []

  return [
    { key: 'case_no', label: '工单号', value: editingCase.value.case_no, readonly: true },
    { key: 'created_at', label: '创建时间', value: formatDate(editingCase.value.created_at), readonly: true },
    { key: 'sn', label: '服务器 SN', value: editingCase.value.sn || '-', readonly: true },
    { key: 'creator', label: '创建人', value: editingCase.value.created_by_name || '-', readonly: true },
    { key: 'customer', label: '客户', value: editingCase.value.customer || '-', readonly: true },
    { key: 'issue_type', label: '问题类型', value: editingCase.value.issue_type || '未分类', readonly: true },
    {
      key: 'status',
      type: 'select',
      label: '状态',
      model: editStatusModel,
      options: STATUS_OPTIONS.filter((option) => option.value !== ''),
      readonly: !isAdmin.value
    },
  ]
})

const clearCaseQuery = async () => {
  if (!route.query.caseId) return
  const nextQuery = { ...route.query }
  delete nextQuery.caseId
  await router.replace({ query: nextQuery })
}

const openCaseFromQuery = async () => {
  const caseId = route.query.caseId
  if (!caseId || typeof caseId !== 'string') return

  const existingCase = cases.value.find((caseItem) => caseItem.id === caseId)
  if (existingCase) {
    openEditModal(existingCase)
    await clearCaseQuery()
    return
  }

  try {
    const detail = await getCaseDetail(caseId)
    if (detail?.id) {
      openEditModal(detail)
    } else {
      notify({ message: '未找到对应工单', color: 'warning' })
    }
  } catch {
    notify({ message: '打开工单详情失败', color: 'danger' })
  } finally {
    await clearCaseQuery()
  }
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
    totalCount.value = res.total || 0
    totalPages.value = Math.ceil((res.total || 0) / pageSize) || 1
    await openCaseFromQuery()
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
  attachmentsExpanded.value = false
  showEditModal.value = true
  fetchCaseAttachments()
}

const fetchCaseAttachments = async () => {
  if (!editingCase.value?.id) return

  attachmentsLoading.value = true
  caseAttachments.value = []
  try {
    caseAttachments.value = await getAttachments('case', editingCase.value.id)
  } catch {
    notify({ message: '获取工单附件失败', color: 'danger' })
  } finally {
    attachmentsLoading.value = false
  }
}

const handleUpdate = async () => {
  if (!isAdmin.value || !editingCase.value) return
  
  try {
    await updateCase(editingCase.value.id, {
      status: editForm.status,
      solution: editForm.solution
    })
    notify({ message: '工单更新成功', color: 'success' })
    showEditModal.value = false
    fetchData()
  } catch {
    notify({ message: '更新失败', color: 'danger' })
  }
}

onMounted(fetchData)
</script>

<style scoped>
.cases-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cases-filter-card {
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.filters-toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-field {
  width: 220px;
  max-width: 100%;
}

.filter-field--stat {
  width: 240px;
}

.filter-label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--va-text-secondary);
}

.filter-inline-value {
  display: flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.9);
  font-size: 14px;
  color: var(--va-text-primary);
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.filter-button {
  min-width: 96px;
}

.filter-button--search {
  box-shadow: none;
}

.cases-loading,
.cases-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  gap: 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
}

.cases-empty__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--va-text-primary);
}

.cases-empty__desc {
  color: var(--va-text-secondary);
}

.cases-board {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cases-pagination {
  display: flex;
  justify-content: center;
}

.case-edit-modal :deep(.va-modal__inner) {
  max-width: 1040px;
}

.case-attachments-panel {
  margin-top: 20px;
  overflow: hidden;
}

.case-attachments-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  cursor: pointer;
}

.case-attachments-panel__title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.case-attachments-panel__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--va-text-primary);
}

.case-attachments-panel__meta {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--va-text-secondary);
}

.case-attachments-panel__body {
  padding: 0 20px 20px;
}

@media (max-width: 768px) {
  .cases-page {
    gap: 18px;
  }

  .filters-toolbar {
    align-items: stretch;
  }

  .filter-field {
    width: 100%;
  }

  .filter-actions {
    width: 100%;
    margin-left: 0;
  }

  .filter-button {
    flex: 1;
  }

}
</style>

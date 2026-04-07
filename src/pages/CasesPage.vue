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
      <article
        v-for="caseItem in cases"
        :key="caseItem.id"
        class="case-record"
      >
        <div class="case-record__rail">
          <div class="case-record__dot" :class="`case-record__dot--${caseItem.status}`"></div>
        </div>

        <div class="case-record__body">
          <div class="case-record__header">
            <div class="case-record__header-main">
              <div class="case-record__title-row">
                <div class="case-record__case-no">{{ caseItem.case_no }}</div>
                <VaChip :color="getStatusColor(caseItem.status)" size="small" class="case-record__status-chip">
                  {{ getStatusLabel(caseItem.status) }}
                </VaChip>
                <span class="case-record__time">{{ formatDate(caseItem.created_at) }}</span>
              </div>
              <div class="case-record__meta-row">
                <span class="case-record__creator-label">创建人</span>
                <span class="case-record__creator-name">{{ caseItem.created_by_name || '-' }}</span>
              </div>
            </div>
            <VaButton
              preset="plain"
              icon="mdi-pencil-outline"
              size="small"
              class="case-record__detail-button"
              @click="openEditModal(caseItem)"
            >
              Details
            </VaButton>
          </div>

          <div class="case-record__grid">
            <div class="case-info">
              <div class="case-info__label">Server SN</div>
              <div class="case-info__value">{{ caseItem.sn || '-' }}</div>
            </div>
            <div class="case-info">
              <div class="case-info__label">Customer</div>
              <div class="case-info__value">{{ caseItem.customer || '-' }}</div>
            </div>
            <div class="case-info">
              <div class="case-info__label">Issue Type</div>
              <div class="case-info__value">{{ caseItem.issue_type || '未分类' }}</div>
            </div>
            <div class="case-info">
              <div class="case-info__label">Status</div>
              <div class="case-info__value">{{ getStatusLabel(caseItem.status) }}</div>
            </div>
          </div>

          <div class="case-section">
            <div class="case-section__label">Problem Description</div>
            <div class="case-section__content">{{ caseItem.description || '-' }}</div>
          </div>

          <div v-if="caseItem.solution" class="case-section">
            <div class="case-section__label">Resolution Steps</div>
            <div class="case-section__content case-section__content--secondary">{{ caseItem.solution }}</div>
          </div>
        </div>
      </article>
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
      <div v-if="editingCase" class="case-edit">
        <div class="case-edit__header">
          <div>
            <div class="case-edit__eyebrow">Edit Work Order</div>
            <h2 class="case-edit__title">
              编辑工单：<span>{{ editingCase.case_no }}</span>
            </h2>
            <p class="case-edit__subtitle">
              最后更新时间 {{ formatDate(editingCase.updated_at || editingCase.created_at) }}
            </p>
          </div>
          <div class="case-edit__header-actions">
            <VaButton preset="secondary" @click="showEditModal = false">
              {{ isAdmin ? '取消' : '关闭' }}
            </VaButton>
            <VaButton v-if="isAdmin" @click="handleUpdate">
              保存修改
            </VaButton>
          </div>
        </div>

        <section class="case-edit__card case-edit__card--main">
          <div class="case-edit__grid">
            <div class="case-edit__card-title">
              <span class="case-edit__accent"></span>
              <span>General Information</span>
            </div>
            <div class="case-edit__form-grid">
              <VaInput label="工单号" v-model="editingCase.case_no" readonly />
              <VaInput label="创建时间" :model-value="formatDate(editingCase.created_at)" readonly />
              <VaInput label="服务器 SN" v-model="editingCase.sn" readonly />
              <VaInput label="创建人" :model-value="editingCase.created_by_name || '-'" readonly />
              <VaInput label="客户" :model-value="editingCase.customer || '-'" readonly />
              <VaInput label="问题类型" :model-value="editingCase.issue_type || '未分类'" readonly />
              <VaSelect
                v-model="editForm.status"
                label="状态"
                :options="STATUS_OPTIONS.filter(o => o.value !== '')"
                value-by="value"
                text-by="text"
                :readonly="!isAdmin"
              />
            </div>
          </div>
        </section>

        <section class="case-edit__card">
          <div class="case-edit__card-title">
            <span class="case-edit__accent case-edit__accent--warm"></span>
            <span>Problem Details</span>
          </div>
          <VaTextarea
            label="问题描述"
            v-model="editingCase.description"
            readonly
            autosize
            :min-rows="4"
          />
        </section>

        <section class="case-edit__card">
          <div class="case-edit__card-title">
            <span class="case-edit__accent case-edit__accent--soft"></span>
            <span>Resolution Strategy</span>
          </div>
          <VaTextarea
            label="解决方案"
            v-model="editForm.solution"
            placeholder="请填写解决方案..."
            :readonly="!isAdmin"
            autosize
            :min-rows="5"
          />
          <div v-if="!isAdmin" class="case-edit__readonly-tip">
            注：仅管理员可更新工单状态及方案。
          </div>
        </section>
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'vuestic-ui'
import { getCases, updateCase } from '../api/cases'
import { usePermission } from '../composables/usePermission'

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

const STATUS_OPTIONS = [
  { text: '全部', value: '' },
  { text: '待处理', value: 'open' },
  { text: '处理中', value: 'processing' },
  { text: '已解决', value: 'resolved' },
  { text: '已关闭', value: 'closed' },
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
    totalCount.value = res.total || 0
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

.case-record {
  display: flex;
  gap: 16px;
}

.case-record__rail {
  position: relative;
  width: 18px;
  flex: 0 0 18px;
}

.case-record__rail::after {
  content: '';
  position: absolute;
  top: 16px;
  bottom: -16px;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: rgba(148, 163, 184, 0.26);
}

.case-record:last-child .case-record__rail::after {
  display: none;
}

.case-record__dot {
  position: relative;
  z-index: 1;
  width: 12px;
  height: 12px;
  margin-top: 10px;
  border-radius: 50%;
  background: var(--va-primary);
  box-shadow: 0 0 0 4px var(--va-background-primary);
}

.case-record__dot--open { background: var(--va-warning); }
.case-record__dot--processing { background: var(--va-info); }
.case-record__dot--resolved { background: var(--va-success); }
.case-record__dot--closed { background: var(--va-secondary); }

.case-record__body {
  flex: 1;
  min-width: 0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.case-record__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  background: #f2f4f6;
}

.case-record__header-main {
  flex: 1;
  min-width: 0;
}

.case-record__title-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.case-record__case-no {
  font-size: 1rem;
  font-weight: 700;
  color: #2356c9;
  font-family: Manrope, sans-serif;
  letter-spacing: 0.02em;
}

.case-record__meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.case-record__time {
  font-size: 12px;
  color: #667085;
  margin-left: auto;
}

.case-record__status-chip {
  flex-shrink: 0;
}

.case-record__creator-label {
  font-size: 12px;
  color: #98a2b3;
}

.case-record__creator-name {
  font-size: 12px;
  font-weight: 600;
  color: #344054;
}

.case-record__detail-button {
  color: #2356c9;
}

.case-record__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  padding: 24px 24px 0;
}

.case-info {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.case-info__label,
.case-section__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--va-text-secondary);
}

.case-info__value {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
  word-break: break-word;
}

.case-section {
  margin-top: 18px;
  padding: 0 24px 24px;
}

.case-section__content {
  margin-top: 6px;
  line-height: 1.7;
  color: var(--va-text-primary);
  word-break: break-word;
}

.case-section__content--secondary {
  color: var(--va-text-secondary);
}

.cases-pagination {
  display: flex;
  justify-content: center;
}

.case-edit {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: min(960px, 100%);
  padding: 6px 2px;
}

.case-edit__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.case-edit__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748b;
}

.case-edit__title {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  color: var(--va-text-primary);
}

.case-edit__title span {
  color: #154ec1;
}

.case-edit__subtitle {
  margin-top: 8px;
  font-size: 13px;
  color: var(--va-text-secondary);
}

.case-edit__header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.case-edit__card {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 32px -4px rgba(25, 28, 30, 0.06);
}

.case-edit__card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  font-size: 18px;
  font-weight: 700;
  color: var(--va-text-primary);
}

.case-edit__accent {
  width: 4px;
  height: 24px;
  border-radius: 999px;
  background: #2356c9;
}

.case-edit__accent--warm {
  background: #9a3600;
}

.case-edit__accent--soft {
  background: #465581;
}

.case-edit__form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.case-edit__readonly-tip {
  margin-top: 12px;
  font-size: 12px;
  color: var(--va-text-secondary);
  font-style: italic;
}

.case-edit-modal :deep(.va-modal__inner) {
  max-width: 1040px;
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

  .case-record__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .case-record__title-row {
    flex-wrap: wrap;
  }

  .case-record__time {
    margin-left: 0;
  }

  .case-record__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .case-edit {
    min-width: 0;
  }

  .case-edit__header {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .case-edit__form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .case-record__grid {
    grid-template-columns: 1fr;
  }
}
</style>

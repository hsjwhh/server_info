<!-- src/pages/server/ServerDetailPage.vue -->
<template>
  <div class="server-detail-page">
    <div class="page-header mb-6">
      <h1 class="page-title">服务器详情</h1>
    </div>

    <!-- 加载状态 -->
    <VaInnerLoading :loading="loading" class="loading-wrapper">
      <template v-if="!loading">
        <!-- 服务器详情 -->
        <div v-if="server" class="flex flex-col gap-6">
          <!-- 概览卡片 -->
          <ServerOverviewCard :server="server" />

          <!-- 硬件配置 -->
          <ServerHardwareGrid :server="server" />

          <!-- 工单记录 (折叠面板) -->
          <VaCard>
            <VaCollapse class="w-full">
              <template #header="{ value }">
                <div class="cases-header w-full cursor-pointer transition-colors">
                  <div class="cases-header__main">
                    <VaIcon :name="value ? 'mdi-chevron-down' : 'mdi-chevron-right'" color="secondary" />
                    <div class="cases-header__text">
                      <div class="cases-header__title">工单记录</div>
                      <div class="cases-header__meta">共 {{ cases.length }} 条关联记录</div>
                    </div>
                  </div>
                  <VaButton
                    class="cases-header__action"
                    size="small"
                    preset="secondary"
                    border-color="primary"
                    icon="mdi-plus"
                    @click.stop="openCreateCaseModal"
                  >
                    新建工单
                  </VaButton>
                </div>
              </template>
              <div class="cases-collapse-body border-t">
                <div class="p-4 pt-2 no-scrollbar">
                  <div v-if="casesLoading" class="text-center py-6">
                    <VaProgressCircle indeterminate size="small" />
                  </div>

                  <div v-else-if="cases.length === 0" class="text-secondary text-sm py-4 text-center">
                    暂无工单记录
                  </div>

                  <div v-else class="cases-board">
                    <div
                      v-for="c in cases"
                      :key="c.id"
                      class="case-record"
                    >
                      <div class="case-record__rail">
                        <div class="case-record__dot" :class="`case-record__dot--${c.status}`"></div>
                      </div>
                      <div class="case-record__body">
                        <div class="case-record__header">
                          <div class="case-record__header-main">
                            <div class="case-record__title-row">
                              <span class="case-record__case-no">{{ c.case_no }}</span>
                              <VaChip :color="statusColor(c.status)" size="small" class="case-record__status-chip">
                                {{ statusLabel(c.status) }}
                              </VaChip>
                              <span class="case-record__time">{{ formatDate(c.created_at) }}</span>
                            </div>
                            <div class="case-record__meta-row">
                              <span class="case-record__creator-label">创建人</span>
                              <span class="case-record__creator-name">{{ c.created_by_name || '-' }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="case-record__grid">
                          <div class="case-info">
                            <div class="case-info__label">服务器 SN</div>
                            <div class="case-info__value">{{ c.sn || server?.sn || '-' }}</div>
                          </div>
                          <div class="case-info">
                            <div class="case-info__label">问题类型</div>
                            <div class="case-info__value">{{ c.issue_type || '未分类' }}</div>
                          </div>
                          <div class="case-info">
                            <div class="case-info__label">报修人/联系方式</div>
                            <div class="case-info__value">{{ c.reporter_contact || '-' }}</div>
                          </div>
                          <div class="case-info">
                            <div class="case-info__label">状态</div>
                            <div class="case-info__value">{{ statusLabel(c.status) }}</div>
                          </div>
                        </div>

                        <div class="case-section">
                          <div class="case-section__label">问题描述</div>
                          <div class="case-section__content">{{ c.description || '-' }}</div>
                        </div>

                        <div v-if="c.solution" class="case-section">
                          <div class="case-section__label">处理结果</div>
                          <div class="case-section__content case-section__content--secondary">
                            {{ c.solution }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </VaCollapse>
          </VaCard>

          <ServerImageGalleryPanel
            v-if="server"
            title="附件图片"
            entity-type="server"
            :entity-id="server.id"
            :attachments="attachments"
            :attachments-loading="attachmentsLoading"
            @uploaded="fetchAttachments"
          />

          <!-- 操作按钮 -->
          <ServerActionsPanel />
        </div>

        <!-- 未找到 -->
        <VaCard v-else-if="searched" class="empty-card">
          <VaCardContent>
            <div class="empty-state">
              <VaIcon name="mdi-cloud-question" size="64px" color="secondary" />
              <h3 class="empty-title">未找到服务器</h3>
              <p class="empty-text">SN 编号「{{ snInput }}」不存在或已被删除</p>
              <div class="empty-actions mt-6">
                <VaButton preset="secondary" @click="$router.push('/servers')">
                  查看所有服务器
                </VaButton>
                <VaButton @click="snInput = ''; searched = false">
                  重新搜索
                </VaButton>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- 初始状态 -->
        <VaCard v-else class="empty-card">
          <VaCardContent>
            <div class="empty-state">
              <VaIcon name="mdi-magnify" size="64px" color="primary" />
              <h3 class="empty-title">请输入 SN 编号</h3>
              <p class="empty-text">在上方搜索框输入服务器 SN 编号以查看详细信息</p>
            </div>
          </VaCardContent>
        </VaCard>
      </template>
    </VaInnerLoading>

    <!-- 新建工单弹窗 -->
    <VaModal
      v-model="showCreateCaseModal"
      :hide-default-actions="true"
      size="large"
      class="case-create-modal"
      fixed-layout
    >
      <div class="case-edit">
        <div class="case-edit__header">
          <div>
            <div class="case-edit__eyebrow">Create Work Order</div>
            <h2 class="case-edit__title">新建工单：<span>{{ server?.sn || '-' }}</span></h2>
            <p class="case-edit__subtitle">为当前服务器创建新的处理记录。</p>
          </div>
          <div class="case-edit__header-actions">
            <VaButton preset="secondary" @click="showCreateCaseModal = false">
              取消
            </VaButton>
            <VaButton @click="handleCreateCase">
              提交
            </VaButton>
          </div>
        </div>

        <section class="case-edit__card case-edit__card--main">
          <div class="case-edit__card-title">
            <span class="case-edit__accent"></span>
            <span>General Information</span>
          </div>
          <div class="case-edit__form-grid">
            <VaInput
              :model-value="server?.sn"
              label="服务器 SN"
              readonly
            />
            <VaInput
              v-model="caseForm.reporter_contact"
              label="报修人/联系方式"
              placeholder="如：张三 / 138xxxx"
            />
            <VaInput
              v-model="caseForm.issue_type"
              label="问题类型"
              placeholder="如：硬件故障、系统报错"
            />
          </div>
        </section>

        <section class="case-edit__card">
          <div class="case-edit__card-title">
            <span class="case-edit__accent case-edit__accent--warm"></span>
            <span>Problem Details</span>
          </div>
          <VaTextarea
            v-model="caseForm.description"
            label="故障描述"
            placeholder="请详细描述问题..."
            :min-rows="5"
            autosize
          />
        </section>
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSnDetail } from '../../api/sn'
import { getCases, createCase } from '../../api/cases'
import { getAttachments } from '../../api/attachments'
import {
  VaCard,
  VaCardContent,
  VaCardTitle,
  VaButton,
  VaIcon,
  VaInnerLoading,
  VaProgressCircle,
  VaChip,
  VaTextarea,
  VaDivider,
  VaModal,
  VaInput,
  VaCollapse,
  useToast
} from 'vuestic-ui'

import ServerOverviewCard from '../../components/ServerDetail/ServerOverviewCard.vue'
import ServerHardwareGrid from '../../components/ServerDetail/ServerHardwareGrid.vue'
import ServerActionsPanel from '../../components/ServerDetail/ServerActionsPanel.vue'
import ServerImageGalleryPanel from '../../components/ServerDetail/ServerImageGalleryPanel.vue'

const route = useRoute()
const router = useRouter()
const { init: notify } = useToast()

const snInput = ref('')
const server = ref(null)
const searched = ref(false)
const loading = ref(false)

// 工单
const cases = ref([])
const casesLoading = ref(false)
const showCreateCaseModal = ref(false)
const caseForm = reactive({
  reporter_contact: '',
  issue_type: '',
  description: ''
})

const STATUS_COLOR = {
  open: 'warning',
  processing: 'info',
  resolved: 'success',
  closed: 'secondary'
}
const STATUS_LABEL = {
  open: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭'
}
const statusColor = (s) => STATUS_COLOR[s] || 'secondary'
const statusLabel = (s) => STATUS_LABEL[s] || s

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

const fetchCases = async (sn) => {
  if (!sn) return
  casesLoading.value = true
  try {
    const result = await getCases({ sn, limit: 50 })
    cases.value = result.list || []
  } catch {
    // 静默失败，不影响主页面
  } finally {
    casesLoading.value = false
  }
}

const openCreateCaseModal = () => {
  Object.assign(caseForm, { reporter_contact: '', issue_type: '', description: '' })
  showCreateCaseModal.value = true
}

const handleCreateCase = async () => {
  if (!caseForm.description) {
    notify({ message: '故障描述不能为空', color: 'warning' })
    return
  }
  try {
    await createCase({
      server_id: server.value?.id,
      reporter_contact: caseForm.reporter_contact || undefined,
      issue_type: caseForm.issue_type || undefined,
      description: caseForm.description
    })
    notify({ message: '工单已创建', color: 'success' })
    fetchCases(server.value?.sn)
  } catch {
    notify({ message: '创建工单失败', color: 'danger' })
  }
}

// 附件
const attachments = ref([])
const attachmentsLoading = ref(false)

const fetchAttachments = async () => {
  if (!server.value?.id) return
  attachmentsLoading.value = true
  try {
    attachments.value = await getAttachments('server', server.value.id)
  } catch {
    // 静默失败，不影响主页面
  } finally {
    attachmentsLoading.value = false
  }
}

/**
 * 查询服务器详情 - 从 SnQuery.vue 的 handleSearch 移植
 */
const handleSearch = async () => {
  if (!snInput.value) {
    notify({
      message: '请输入 SN 编号',
      color: 'warning'
    })
    return
  }

  searched.value = false
  server.value = null
  loading.value = true

  try {
    const res = await getSnDetail(snInput.value)

    // RESTful：res 就是 SN 对象
    server.value = res
    searched.value = true

    if (res) {
      // 加载关联数据
      fetchCases(server.value.sn)
      fetchAttachments()

      // 更新 URL 参数
      if (route.params.sn !== res.sn) {
        router.replace({ name: 'ServerDetail', params: { sn: res.sn } })
      }

      notify({
        message: '查询成功',
        color: 'success'
      })
    } else {
      notify({
        message: '未找到该 SN 信息',
        color: 'warning'
      })
    }
  } catch (error) {
    console.error('查询失败:', error)
    server.value = null
    searched.value = true
    // 错误提示由 axios 拦截器处理
  } finally {
    loading.value = false
  }
}

// 如果路由参数包含 SN，自动查询。
// 约定：'search' 是“仅打开查询页、不触发详情请求”的哨兵值。
onMounted(() => {
  const sn = route.params.sn
  if (sn && sn !== 'search') {
    snInput.value = sn
    handleSearch()
  }
})

// 监听路由变化并增量触发查询。
// 这里额外比较 newSn !== snInput.value 用于避免 handleSearch 内部 router.replace
// 造成的重复请求。
watch(() => route.params.sn, (newSn) => {
  if (newSn && newSn !== 'search' && newSn !== snInput.value) {
    snInput.value = newSn
    handleSearch()
  }
})
</script>

<style scoped>
.empty-actions {
  display: flex;
  gap: var(--space-4);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
}

.cases-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
}

.cases-header__main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.cases-header__text {
  min-width: 0;
}

.cases-header__title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--va-text-primary);
}

.cases-header__meta {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.3;
  color: var(--va-text-secondary);
}

.cases-header__action {
  flex-shrink: 0;
}

/* 为贯穿线提供定位上下文，并留出左侧空间 */
.cases-board {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.case-record {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.case-record__rail {
  position: relative;
  display: flex;
  justify-content: center;
  width: 18px;
  flex: 0 0 18px;
  align-self: stretch;
}

.case-record__rail::after {
  content: '';
  position: absolute;
  top: 14px;
  bottom: -18px;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: rgba(148, 163, 184, 0.28);
}

.case-record:last-child .case-record__rail::after {
  display: none;
}

.case-record__dot {
  position: relative;
  z-index: 1;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 10px;
  background-color: var(--va-primary);
  box-shadow: 0 0 0 4px var(--va-background-primary);
}

.case-record__dot--open       { background-color: var(--va-warning); }
.case-record__dot--processing { background-color: var(--va-info); }
.case-record__dot--resolved   { background-color: var(--va-success); }
.case-record__dot--closed     { background-color: var(--va-secondary); }

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
  flex-wrap: wrap;
}

.case-record__case-no {
  font-size: 1rem;
  font-weight: 700;
  color: #2356c9;
  font-family: Manrope, sans-serif;
  letter-spacing: 0.02em;
}

.case-record__status-chip {
  flex-shrink: 0;
}

.case-record__time {
  font-size: 12px;
  color: #667085;
  margin-left: auto;
}

.case-record__meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
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
  line-height: 1.6;
  color: var(--color-text-primary);
  word-break: break-word;
}

.case-section__content--secondary {
  color: var(--color-text-secondary);
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

.case-edit__form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.case-create-modal :deep(.va-modal__inner) {
  max-width: 1040px;
}

@media (max-width: 768px) {
  .cases-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .cases-header__action {
    width: 100%;
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
    white-space: normal;
  }

  .case-record__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .case-edit {
    min-width: 0;
  }

  .case-edit__header {
    flex-direction: column;
  }

  .case-edit__form-grid {
    grid-template-columns: 1fr;
  }
}

</style>

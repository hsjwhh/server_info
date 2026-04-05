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

                  <div v-else class="cases-timeline">
                    <div
                      v-for="c in cases"
                      :key="c.id"
                      class="case-item"
                    >
                      <div class="case-track">
                        <div class="case-dot" :class="`case-dot--${c.status}`"></div>
                      </div>
                      <div class="case-content">
                        <div class="case-header">
                          <div class="case-header__primary">
                            <span class="case-no font-mono text-sm">{{ c.case_no }}</span>
                            <VaChip :color="statusColor(c.status)" size="small">
                              {{ statusLabel(c.status) }}
                            </VaChip>
                          </div>
                          <span class="case-time text-xs text-secondary">{{ formatDate(c.created_at) }}</span>
                        </div>
                        <div class="case-section">
                          <div class="case-label">问题描述</div>
                          <div class="case-issue text-sm">{{ c.issue_type || '未分类' }} — {{ c.description }}</div>
                        </div>
                        <div v-if="c.solution" class="case-section">
                          <div class="case-label">处理结果</div>
                          <div class="case-solution text-sm text-secondary">
                            ✓ {{ c.solution }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </VaCollapse>
          </VaCard>

          <!-- 附件图片 -->
          <VaCard>
            <VaCardTitle>
              <div class="flex items-center justify-between w-full">
                <span>附件图片</span>
                <AttachmentUploader
                  v-if="server"
                  entity-type="server"
                  :entity-id="server.id"
                  @uploaded="fetchAttachments"
                />
              </div>
            </VaCardTitle>
            <VaCardContent>
              <div v-if="attachmentsLoading" class="text-center py-4">
                <VaProgressCircle indeterminate size="small" />
              </div>

              <div v-else-if="attachments.length === 0" class="text-secondary text-sm py-2 text-center">
                暂无附件
              </div>

              <div v-else class="attachments-grid">
                <div
                  v-for="a in attachments"
                  :key="a.id"
                  class="attachment-item"
                  @click="openImage(a.imgPath)"
                >
                  <img
                    :src="`${a.imgPath}?w=200`"
                    :alt="a.originalName"
                    class="attachment-img"
                  />
                  <div class="attachment-name text-xs text-secondary mt-1 text-center">
                    {{ a.originalName || '图片' }}
                  </div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

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
      title="新建工单"
      @ok="handleCreateCase"
      ok-text="提交"
      cancel-text="取消"
    >
      <div class="flex flex-col gap-4 py-2" style="min-width: 360px;">
        <VaInput
          :model-value="server?.sn"
          label="服务器 SN"
          readonly
        />
        <VaInput
          v-model="caseForm.reporter_contact"
          label="报修人/联系方式（选填）"
          placeholder="如：张三 / 138xxxx"
        />
        <VaInput
          v-model="caseForm.issue_type"
          label="问题类型（选填）"
          placeholder="如：硬件故障、系统报错"
        />
        <VaTextarea
          v-model="caseForm.description"
          label="故障描述 *"
          placeholder="请详细描述问题..."
          :min-rows="3"
        />
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSnDetail } from '../../api/sn'
import { getCases, createCase } from '../../api/cases'
import AttachmentUploader from '../../components/AttachmentUploader.vue'
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

const openImage = (imgPath) => {
  window.open(imgPath, '_blank')
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
.cases-timeline {
  position: relative;
  padding: 4px 4px 0;
}

.case-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.case-item:last-child {
  margin-bottom: 0;
}

.case-track {
  position: relative;
  display: flex;
  justify-content: center;
  width: 18px;
  flex: 0 0 18px;
  align-self: stretch;
}

.case-track::after {
  content: '';
  position: absolute;
  top: 14px;
  bottom: -18px;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: rgba(148, 163, 184, 0.28);
}

.case-item:last-child .case-track::after {
  display: none;
}

.case-dot {
  position: relative;
  z-index: 1;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 10px;
  background-color: var(--va-primary);
  box-shadow: 0 0 0 4px var(--va-background-primary);
}

.case-dot--open       { background-color: var(--va-warning); }
.case-dot--processing { background-color: var(--va-info); }
.case-dot--resolved   { background-color: var(--va-success); }
.case-dot--closed     { background-color: var(--va-secondary); }

.case-content {
  width: 100%;
  min-width: 0;
  padding: 16px 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(255, 255, 255, 1));
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.case-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.case-header__primary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  min-width: 0;
}

.case-time {
  flex-shrink: 0;
  white-space: nowrap;
}

.case-section {
  margin-top: 12px;
}

.case-label {
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--va-text-secondary);
}

.case-no {
  color: var(--color-text-primary);
  font-weight: 700;
}

.case-issue {
  color: var(--color-text-primary);
  line-height: 1.6;
  word-break: break-word;
}

.case-solution {
  color: var(--color-text-secondary);
  line-height: 1.6;
  word-break: break-word;
}

@media (max-width: 768px) {
  .cases-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .cases-header__action {
    width: 100%;
  }

  .case-item {
    gap: 12px;
  }

  .case-content {
    padding: 14px;
  }

  .case-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .case-time {
    white-space: normal;
  }
}

.attachments-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.attachment-item {
  width: 96px;
  cursor: pointer;
}

.attachment-img {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  transition: opacity 0.15s;
}

.attachment-img:hover {
  opacity: 0.85;
}

.attachment-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

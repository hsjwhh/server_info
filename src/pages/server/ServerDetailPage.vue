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
                <div class="flex items-center justify-between w-full p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div class="font-bold flex items-center gap-2">
                    <VaIcon :name="value ? 'mdi-chevron-down' : 'mdi-chevron-right'" color="secondary" />
                    关联工单记录 (共 {{ cases.length }} 条)
                  </div>
                  <VaButton
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
                      <div class="case-dot" :class="`case-dot--${c.status}`"></div>
                      <div class="case-content">
                        <div class="case-header">
                          <span class="case-no font-mono text-sm">{{ c.case_no }}</span>
                          <VaChip :color="statusColor(c.status)" size="small" class="ml-2">
                            {{ statusLabel(c.status) }}
                          </VaChip>
                          <span class="text-xs text-secondary ml-auto">{{ formatDate(c.created_at) }}</span>
                        </div>
                        <div class="case-issue mt-1 text-sm">{{ c.issue_type || '未分类' }} — {{ c.description }}</div>
                        <div v-if="c.solution" class="case-solution text-sm text-secondary mt-1">
                          ✓ {{ c.solution }}
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
                    :src="a.imgPath"
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

/* 为贯穿线提供定位上下文，并留出左侧空间 */
.cases-timeline {
  position: relative;
  padding-left: 28px; 
}

/* 使用伪元素绘制完美对齐的垂直贯穿线，使用 Vuestic 边框变量适配明暗主题 */
.cases-timeline::before {
  content: '';
  position: absolute;
  top: 8px; /* 距离顶部的合理下移，防止顶出 */
  bottom: 0;
  left: 9px; /* 极其精确的中轴对齐 (28px的合适比例) */
  width: 2px;
  background-color: var(--va-background-border);
}

.case-item {
  position: relative;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.case-item:last-child {
  margin-bottom: 0;
}

/* 精密重构的圆点：利用绝对定位拉回左侧中轴线，利用边框切断背后的贯穿线 */
.case-dot {
  position: absolute;
  left: -28px; /* 拉回到 .cases-timeline 留出的 padding 区域 */
  top: 4px; /* 基于 14px/16px 基础字号的视觉重心微调 */
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--va-primary);
  /* 核心技巧：用与卡片底色相同的粗边框，在视觉上"切断"贯穿线，显得非常干净 */
  border: 3px solid var(--va-background-primary); 
  box-sizing: content-box;
  z-index: 1;
}

.case-dot--open       { background-color: var(--va-warning); }
.case-dot--processing { background-color: var(--va-info); }
.case-dot--resolved   { background-color: var(--va-success); }
.case-dot--closed     { background-color: var(--va-secondary); }

.case-content {
  width: 100%;
}

.case-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.case-no {
  color: var(--color-text-primary);
}

.case-issue {
  color: var(--color-text-primary);
  line-height: 1.4;
}

.case-solution {
  color: var(--color-text-secondary);
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

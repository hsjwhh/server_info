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
                    <CaseRecordCard
                      v-for="caseItem in cases"
                      :key="caseItem.id"
                      :case-item="caseItem"
                      :format-date="formatDate"
                      description-label="问题描述"
                      solution-label="处理结果"
                      :server-sn="server?.sn || ''"
                    />
                  </div>
                </div>
              </div>
            </VaCollapse>
          </VaCard>

          <AttachmentGalleryPanel
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
      <CaseFormPanel
        eyebrow="Create Work Order"
        title="新建工单"
        :title-accent="server?.sn || '-'"
        subtitle="为当前服务器创建新的处理记录。"
        cancel-text="取消"
        submit-text="提交"
        :general-fields="createGeneralFields"
        :description-model="createDescriptionModel"
        description-label="故障描述"
        description-placeholder="请详细描述问题..."
        :description-rows="5"
        @cancel="showCreateCaseModal = false"
        @submit="handleCreateCase"
      />
    </VaModal>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, watch, toRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSnDetail } from '../../api/sn'
import { getCases, createCase } from '../../api/cases'
import { getAttachments } from '../../api/attachments'
import {
  VaCard,
  VaCardContent,
  VaButton,
  VaIcon,
  VaInnerLoading,
  VaProgressCircle,
  VaModal,
  VaCollapse,
  useToast
} from 'vuestic-ui'

import CaseFormPanel from '../../components/CaseFormPanel.vue'
import CaseRecordCard from '../../components/CaseRecordCard.vue'
import ServerOverviewCard from '../../components/ServerDetail/ServerOverviewCard.vue'
import ServerHardwareGrid from '../../components/ServerDetail/ServerHardwareGrid.vue'
import ServerActionsPanel from '../../components/ServerDetail/ServerActionsPanel.vue'
import AttachmentGalleryPanel from '../../components/AttachmentGalleryPanel.vue'

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

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

const createDescriptionModel = toRef(caseForm, 'description')

const createGeneralFields = computed(() => [
  { key: 'sn', label: '服务器 SN', value: server.value?.sn || '-', readonly: true },
  {
    key: 'reporter_contact',
    label: '报修人/联系方式',
    model: toRef(caseForm, 'reporter_contact'),
    placeholder: '如：张三 / 138xxxx',
  },
  {
    key: 'issue_type',
    label: '问题类型',
    model: toRef(caseForm, 'issue_type'),
    placeholder: '如：硬件故障、系统报错',
  },
])

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

const extractCaseId = (payload) => {
  if (!payload || typeof payload !== 'object') return ''

  if (typeof payload.id === 'string' && payload.id) return payload.id
  if (payload.data && typeof payload.data === 'object') {
    if (typeof payload.data.id === 'string' && payload.data.id) return payload.data.id
    if (payload.data.case && typeof payload.data.case.id === 'string' && payload.data.case.id) {
      return payload.data.case.id
    }
  }
  if (payload.case && typeof payload.case === 'object' && typeof payload.case.id === 'string' && payload.case.id) {
    return payload.case.id
  }

  return ''
}

const handleCreateCase = async () => {
  if (!caseForm.description) {
    notify({ message: '故障描述不能为空', color: 'warning' })
    return
  }
  try {
    const createdCase = await createCase({
      server_id: server.value?.id,
      reporter_contact: caseForm.reporter_contact || undefined,
      issue_type: caseForm.issue_type || undefined,
      description: caseForm.description
    })
    const createdCaseId = extractCaseId(createdCase)
    notify({ message: '工单已创建', color: 'success' })
    showCreateCaseModal.value = false
    fetchCases(server.value?.sn)
    if (createdCaseId) {
      router.push({ name: 'Cases', query: { caseId: createdCaseId } })
      return
    }
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

}

</style>

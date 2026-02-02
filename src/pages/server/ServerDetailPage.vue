<!-- src/pages/ServerDetailPage.vue -->
<template>
  <div class="server-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <!-- <VaBreadcrumbs color="secondary">
        <VaBreadcrumbsItem label="首页" to="/" />
        <VaBreadcrumbsItem label="服务器列表" to="/servers1" />
        <VaBreadcrumbsItem :label="server?.SN || 'SN 查询'" active />
      </VaBreadcrumbs> -->

      <!-- <VaButton
        preset="secondary"
        icon="mdi-arrow-left"
        @click="$router.push('/servers')"
      >
        返回列表
      </VaButton> -->
      <h1 class="page-title">服务器详情</h1>
    </div>

    <!-- 搜索卡片 -->
    <!-- <VaCard class="search-card">
      <VaCardContent>
        <div class="search-bar">
          <VaInput
            v-model="snInput"
            placeholder="输入 SN 编号查询服务器详情..."
            clearable
            @keyup.enter="handleSearch"
            class="search-input"
          >
            <template #prepend>
              <VaIcon name="mdi-magnify" />
            </template>
</VaInput>
<VaButton :disabled="!snInput" @click="handleSearch" :loading="loading" size="large">
  查询
</VaButton>
</div>
</VaCardContent>
</VaCard> -->

    <!-- 加载状态 -->
    <VaInnerLoading :loading="loading" class="loading-wrapper">
      <template v-if="!loading">
        <!-- 服务器详情 -->
        <template v-if="server">
          <!-- 概览卡片 -->
          <VaCard class="overview-card">
            <VaCardTitle class="card-title-custom">
              <div class="title-content">
                <VaIcon name="mdi-server" size="large" color="primary" />
                <div>
                  <h1 class="card-main-title">{{ server.SN }}</h1>
                </div>
              </div>
              <div class="title-actions">
                <VaButton preset="secondary" icon="mdi-pencil" size="small">
                  编辑
                </VaButton>
                <VaButton preset="secondary" icon="mdi-content-copy" size="small">
                  复制
                </VaButton>
              </div>
            </VaCardTitle>
            <VaCardContent>
              <div class="info-grid-3">
                <div class="info-card">
                  <div class="info-icon-wrapper success">
                    <VaIcon name="mdi-calendar" size="large" />
                  </div>
                  <div class="info-content">
                    <span class="info-label">出机日期</span>
                    <span class="info-value">{{ formatDate(server) }}</span>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-icon-wrapper primary">
                    <VaIcon name="mdi-account-tie" size="large" />
                  </div>
                  <div class="info-content">
                    <span class="info-label">出机客户</span>
                    <span class="info-value">{{ server.出机客户 }}</span>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-icon-wrapper warning">
                    <VaIcon name="mdi-briefcase" size="large" />
                  </div>
                  <div class="info-content">
                    <span class="info-label">业务类型</span>
                    <span class="info-value">{{ server.业务 }}</span>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-icon-wrapper info">
                    <VaIcon name="mdi-barcode" size="large" />
                  </div>
                  <div class="info-content">
                    <span class="info-label">SN 编号</span>
                    <span class="info-value">{{ server.SN }}</span>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-icon-wrapper danger">
                    <VaIcon name="mdi-counter" size="large" />
                  </div>
                  <div class="info-content">
                    <span class="info-label">数量</span>
                    <span class="info-value">{{ server.数量 }}</span>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-icon-wrapper secondary">
                    <VaIcon name="mdi-note-text" size="large" />
                  </div>
                  <div class="info-content">
                    <span class="info-label">备注</span>
                    <span class="info-value">{{ server.备注 || '-' }}</span>
                  </div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- 硬件配置 -->
          <div class="hardware-section">
            <h3 class="section-title">
              <VaIcon name="mdi-memory" class="mr-2" />
              硬件配置
            </h3>

            <div class="hardware-grid">
              <!-- 基础硬件 -->
              <VaCard class="hardware-card">
                <VaCardTitle>
                  <VaIcon name="mdi-inbox" class="mr-2" />
                  基础配置
                </VaCardTitle>
                <VaCardContent>
                  <div class="hardware-items">
                    <div v-if="server.机箱" class="hardware-item">
                      <span class="hw-label">机箱</span>
                      <VaChip size="small" color="primary">{{ server.机箱 }}</VaChip>
                    </div>
                    <div v-if="server.电源" class="hardware-item">
                      <span class="hw-label">电源</span>
                      <VaChip size="small" color="primary">{{ server.电源 }}</VaChip>
                    </div>
                    <div v-if="server.主板" class="hardware-item">
                      <span class="hw-label">主板</span>
                      <VaChip size="small" color="primary">{{ server.主板 }}</VaChip>
                    </div>
                    <div v-if="server.BMC密码" class="hardware-item">
                      <span class="hw-label">BMC密码</span>
                      <VaChip size="small" color="warning">{{ server.BMC密码 }}</VaChip>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- 计算资源 -->
              <VaCard class="hardware-card">
                <VaCardTitle>
                  <VaIcon name="mdi-cpu-64-bit" class="mr-2" />
                  计算资源
                </VaCardTitle>
                <VaCardContent>
                  <div class="hardware-items">
                    <div v-if="server.CPU" class="hardware-item">
                      <span class="hw-label">CPU</span>
                      <div class="hw-value-group">
                        <VaChip size="small" color="success">{{ server.CPU }}</VaChip>
                        <VaBadge v-if="server.CPU数量" :text="`x${server.CPU数量}`" color="success" />
                      </div>
                    </div>
                    <div v-if="server.内存" class="hardware-item">
                      <span class="hw-label">内存</span>
                      <div class="hw-value-group">
                        <VaChip size="small" color="success">{{ server.内存 }}</VaChip>
                        <VaBadge v-if="server.内存数量" :text="`x${server.内存数量}`" color="success" />
                      </div>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- 存储设备 -->
              <VaCard class="hardware-card">
                <VaCardTitle>
                  <VaIcon name="mdi-harddisk" class="mr-2" />
                  存储设备
                </VaCardTitle>
                <VaCardContent>
                  <div class="hardware-items">
                    <div v-if="server.M2" class="hardware-item">
                      <span class="hw-label">M.2</span>
                      <div class="hw-value-group">
                        <VaChip size="small" color="info">{{ server.M2 }}</VaChip>
                        <VaBadge v-if="server.M2数量" :text="`x${server.M2数量}`" color="info" />
                      </div>
                    </div>
                    <div v-if="server.SSD" class="hardware-item">
                      <span class="hw-label">SSD</span>
                      <div class="hw-value-group">
                        <VaChip size="small" color="info">{{ server.SSD }}</VaChip>
                        <VaBadge v-if="server.SSD数量" :text="`x${server.SSD数量}`" color="info" />
                      </div>
                    </div>
                    <div v-if="server.HDD" class="hardware-item">
                      <span class="hw-label">HDD</span>
                      <div class="hw-value-group">
                        <VaChip size="small" color="info">{{ server.HDD }}</VaChip>
                        <VaBadge v-if="server.HDD数量" :text="`x${server.HDD数量}`" color="info" />
                      </div>
                    </div>
                    <div v-if="server.阵列卡" class="hardware-item">
                      <span class="hw-label">阵列卡</span>
                      <div class="hw-value-group">
                        <VaChip size="small" color="warning">{{ server.阵列卡 }}</VaChip>
                        <VaBadge v-if="server.阵列卡数量" :text="`x${server.阵列卡数量}`" color="warning" />
                      </div>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- 扩展设备 -->
              <VaCard class="hardware-card">
                <VaCardTitle>
                  <VaIcon name="mdi-expansion-card" class="mr-2" />
                  扩展设备
                </VaCardTitle>
                <VaCardContent>
                  <div class="hardware-items">
                    <div v-if="server.网卡" class="hardware-item">
                      <span class="hw-label">网卡</span>
                      <div class="hw-value-group">
                        <VaChip size="small" color="primary">{{ server.网卡 }}</VaChip>
                        <VaBadge v-if="server.网卡数量" :text="`x${server.网卡数量}`" color="primary" />
                      </div>
                    </div>
                    <div v-if="server.显卡" class="hardware-item">
                      <span class="hw-label">显卡</span>
                      <div class="hw-value-group">
                        <VaChip size="small" color="danger">{{ server.显卡 }}</VaChip>
                        <VaBadge v-if="server.显卡数量" :text="`x${server.显卡数量}`" color="danger" />
                      </div>
                    </div>
                    <div v-if="server.系统" class="hardware-item">
                      <span class="hw-label">系统</span>
                      <VaChip size="small" color="secondary">{{ server.系统 }}</VaChip>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>
          </div>

          <!-- 操作按钮 -->
          <VaCard class="actions-card">
            <VaCardContent>
              <div class="action-buttons">
                <VaButton icon="mdi-refresh" preset="secondary">
                  刷新数据
                </VaButton>
                <VaButton icon="mdi-download" preset="secondary">
                  导出信息
                </VaButton>
                <VaButton icon="mdi-printer" preset="secondary">
                  打印
                </VaButton>
                <VaButton icon="mdi-share-variant" preset="secondary">
                  分享
                </VaButton>
                <VaSpacer />
                <VaButton icon="mdi-delete" color="danger">
                  删除服务器
                </VaButton>
              </div>
            </VaCardContent>
          </VaCard>
        </template>

        <!-- 未找到 -->
        <VaCard v-else-if="searched" class="empty-card">
          <VaCardContent>
            <div class="empty-state">
              <VaIcon name="mdi-cloud-question" size="96px" color="secondary" />
              <h3 class="empty-title">未找到服务器</h3>
              <p class="empty-text">SN 编号「{{ snInput }}」不存在或已被删除</p>
              <div class="empty-actions">
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
              <VaIcon name="mdi-magnify" size="96px" color="primary" />
              <h3 class="empty-title">请输入 SN 编号</h3>
              <p class="empty-text">在上方搜索框输入服务器 SN 编号以查看详细信息</p>
            </div>
          </VaCardContent>
        </VaCard>
      </template>
    </VaInnerLoading>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSnDetail } from '../../api/sn'
import {
  VaCard,
  VaCardTitle,
  VaCardContent,
  VaInput,
  VaButton,
  VaIcon,
  VaChip,
  VaBadge,
  VaInnerLoading,
  VaBreadcrumbs,
  VaBreadcrumbsItem,
  VaSpacer,
  useToast
} from 'vuestic-ui'

const route = useRoute()
const router = useRouter()
const { init: notify } = useToast()

const snInput = ref('')
const server = ref(null)
const searched = ref(false)
const loading = ref(false)

/**
 * 格式化日期 - 从 SnQuery.vue 移植
 */
const formatDate = (serverData) => {
  if (!serverData.年份) return '-'
  const y = serverData.年份
  const m = String(serverData.月份).padStart(2, '0')
  const d = String(serverData.日期).padStart(2, '0')
  return `${y}-${m}-${d}`
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
      // 更新 URL 参数
      if (route.params.sn !== res.SN) {
        router.replace({ name: 'ServerDetail', params: { sn: res.SN } })
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

// 如果路由参数包含 SN,自动查询
onMounted(() => {
  const sn = route.params.sn
  if (sn && sn !== 'search') {
    snInput.value = sn
    handleSearch()
  }
})

// 监听路由变化
watch(() => route.params.sn, (newSn) => {
  if (newSn && newSn !== 'search' && newSn !== snInput.value) {
    snInput.value = newSn
    handleSearch()
  }
})
</script>

<style scoped>
.server-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.search-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.search-card :deep(.va-card__content) {
  padding: 2rem;
}

.search-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 600px;
}

.loading-wrapper {
  min-height: 400px;
}

/* 概览卡片 */
.overview-card {
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-main-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.card-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.title-actions {
  display: flex;
  gap: 0.5rem;
}

.info-grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.info-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon-wrapper.primary {
  background: rgba(var(--va-primary-rgb), 0.1);
  color: var(--va-primary);
}

.info-icon-wrapper.success {
  background: rgba(var(--va-success-rgb), 0.1);
  color: var(--va-success);
}

.info-icon-wrapper.warning {
  background: rgba(var(--va-warning-rgb), 0.1);
  color: var(--va-warning);
}

.info-icon-wrapper.danger {
  background: rgba(var(--va-danger-rgb), 0.1);
  color: var(--va-danger);
}

.info-icon-wrapper.info {
  background: rgba(var(--va-info-rgb), 0.1);
  color: var(--va-info);
}

.info-icon-wrapper.secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #6b7280;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #111827;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 硬件配置 */
.hardware-section {
  margin-top: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.hardware-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.hardware-card {
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.hardware-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.hardware-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hardware-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.hw-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.hw-value-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 操作按钮 */
.actions-card {
  margin-top: 1rem;
  border-radius: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

/* 空状态 */
.empty-card {
  border-radius: 1rem;
  margin-top: 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-title {
  margin-top: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.empty-text {
  margin-top: 0.75rem;
  font-size: 1rem;
  color: #6b7280;
  max-width: 500px;
}

.empty-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: 100%;
  }

  .card-title-custom {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .info-grid-3 {
    grid-template-columns: 1fr;
  }

  .hardware-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons .va-spacer {
    display: none;
  }
}
</style>

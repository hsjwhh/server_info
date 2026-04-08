<template>
  <VaCard class="overview-card">
    <VaCardTitle class="card-title-custom">
      <div class="title-content">
        <VaIcon name="mdi-server" size="large" color="primary" />
        <div>
          <h1 class="card-main-title">{{ server.sn }}</h1>
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
        <div class="info-card hover-lift">
          <div class="info-icon-wrapper success">
            <VaIcon name="mdi-calendar" size="large" />
          </div>
          <div class="info-content">
            <span class="info-label">出机日期</span>
            <span class="info-value" :title="formatDate(server)">{{ formatDate(server) }}</span>
          </div>
        </div>

        <div class="info-card hover-lift">
          <div class="info-icon-wrapper primary">
            <VaIcon name="mdi-account-tie" size="large" />
          </div>
          <div class="info-content">
            <span class="info-label">出机客户</span>
            <span class="info-value" :title="server.customer">{{ server.customer }}</span>
          </div>
        </div>

        <div class="info-card hover-lift">
          <div class="info-icon-wrapper warning">
            <VaIcon name="mdi-briefcase" size="large" />
          </div>
          <div class="info-content">
            <span class="info-label">业务</span>
            <span class="info-value" :title="server.owner">{{ server.owner }}</span>
          </div>
        </div>

        <div class="info-card hover-lift">
          <div class="info-icon-wrapper info">
            <VaIcon name="mdi-barcode" size="large" />
          </div>
          <div class="info-content">
            <span class="info-label">SN 编号</span>
            <span class="info-value" :title="server.sn">{{ server.sn }}</span>
          </div>
        </div>

        <div class="info-card hover-lift">
          <div class="info-icon-wrapper danger">
            <VaIcon name="mdi-counter" size="large" />
          </div>
          <div class="info-content">
            <span class="info-label">数量</span>
            <span class="info-value" :title="server.number">{{ server.number }}</span>
          </div>
        </div>

        <div class="info-card hover-lift">
          <div class="info-icon-wrapper secondary">
            <VaIcon name="mdi-note-text" size="large" />
          </div>
          <div class="info-content">
            <span class="info-label">备注</span>
            <span class="info-value" :title="server.note">{{ server.note || '-' }}</span>
          </div>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup>
import {
  VaCard,
  VaCardTitle,
  VaCardContent,
  VaIcon,
  VaButton
} from 'vuestic-ui'

const props = defineProps({
  server: {
    type: Object,
    required: true
  }
})

// 格式化日期逻辑移动到组件内部
const formatDate = (serverData) => {
  if (!serverData.y) return '-'
  const y = serverData.y
  const m = String(serverData.m).padStart(2, '0')
  const d = String(serverData.d).padStart(2, '0')
  return `${y}-${m}-${d}`
}
</script>

<style scoped>
/* Overview Card Styling */
.overview-card {
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.title-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);

  /* 👇 新增：允许这个区域在 Flex 布局中被压缩，防止挤爆右侧操作区 */
  min-width: 0; 
  flex: 1; 
}

.card-main-title {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);

  /* 👇 新增：遇到超长 SN 码强制换行 */
  word-break: break-all;
  overflow-wrap: anywhere;
}

.title-actions {
  display: flex;
  gap: var(--space-2);
}

/* Info Cards */
.info-grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
  padding: var(--space-2) 0;
}

.info-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-lg);
}

.info-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon-wrapper.primary { background: rgba(var(--va-primary-rgb), 0.1); color: var(--va-primary); }
.info-icon-wrapper.success { background: rgba(var(--va-success-rgb), 0.1); color: var(--va-success); }
.info-icon-wrapper.warning { background: rgba(var(--va-warning-rgb), 0.1); color: var(--va-warning); }
.info-icon-wrapper.danger { background: rgba(var(--va-danger-rgb), 0.1); color: var(--va-danger); }
.info-icon-wrapper.info { background: rgba(var(--va-info-rgb), 0.1); color: var(--va-info); }
.info-icon-wrapper.secondary { background: rgba(0, 0, 0, 0.05); color: var(--color-text-secondary); }

.info-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.info-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: var(--text-base);
  color: var(--color-text-primary);
  font-weight: 600;

  /* 👇 修改：单行截断并显示省略号，防止撑高区块 */
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

@media (max-width: 768px) {
  .card-title-custom {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .info-grid-3 {
    /* 👇 核心修复：锁死最大宽度 */
    grid-template-columns: minmax(0, 1fr); 
  }
}
</style>

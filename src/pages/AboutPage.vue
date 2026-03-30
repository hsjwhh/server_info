<template>
  <div class="about-page">
    <h1 class="page-title">关于</h1>
    
    <div class="about-container">
      <div class="logo-wrapper">
        <img src="/logo.svg" alt="Logo" class="about-logo" />
        <h2>ServerInfo 仪表盘</h2>
      </div>
      
      <VaCard class="mb-4">
        <VaCardTitle>基础信息</VaCardTitle>
        <VaCardContent>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">系统版本</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">项目简介</span>
              <span class="info-value">一个前后端分离的服务器资产与状态管理面板</span>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardTitle>技术栈</VaCardTitle>
        <VaCardContent>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">前端核心依赖</span>
              <span class="info-value">Vue 3 + Vuestic UI + Vite + Vue Router + Pinia</span>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </div>
</template>

<script setup>
import { VaCard, VaCardTitle, VaCardContent } from 'vuestic-ui'
</script>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
}

.about-page :deep(.page-title) {
  margin-bottom: var(--space-6) !important;
}

.about-container {
  max-width: 800px;
}

.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-6);
  gap: var(--space-3);
}

.about-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.logo-wrapper h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.info-value {
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>

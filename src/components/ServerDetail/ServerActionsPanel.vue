<template>
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

<script setup>
import {
  VaCard,
  VaCardContent,
  VaButton,
  VaSpacer
} from 'vuestic-ui'
</script>

<style scoped>
.actions-card {
  border-radius: var(--radius-xl);
  /* FIX: Explicitly ensure there's layout separation from elements above it */
  margin-top: 0;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap; /* Prevent button overflow on medium screens */
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  /* Make all spacing equal in column mode */
  .va-spacer {
    display: none;
  }
}
</style>

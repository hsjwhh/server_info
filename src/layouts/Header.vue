<!-- src/layouts/Header.vue -->
<template>
  <header class="header">
    <!-- 右侧操作区 -->
    <div class="header-actions">
      <VaButton preset="plain" icon="mdi-bell-outline" class="action-btn" />
      <VaButton preset="plain" icon="mdi-cog-outline" class="action-btn" @click="goToSettings" />
      <VaAvatar size="32px" color="primary" class="avatar">
        M
      </VaAvatar>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { VaButton, VaAvatar } from 'vuestic-ui'

const router = useRouter()

/**
 * 跳转到设置页面
 */
const goToSettings = () => {
  router.push('/settings')
}
</script>

<style scoped>
.header {
  height: 56px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  gap: 1rem;
}

/* 右侧操作区 */
.header-actions {
  margin-left: auto; /* 👈 靠右显示 */
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 图标按钮 */
.action-btn {
  color: #6b7280;
  font-size: 20px;
}

/* 用户头像 */
.avatar {
  cursor: pointer;
}
</style>

<!-- src/pages/ServerListPage.vue -->
<template>
  <div class="server-list-page">
    <div class="page-header">
      <h1 class="page-title">服务器列表</h1>
      <VaButton
        icon="mdi-plus"
        @click="handleAdd"
      >
        添加服务器
      </VaButton>
    </div>

    <!-- 搜索和筛选卡片 -->
    <ServerSearchFilter />

    <!-- 服务器列表 -->
    <ServerDataTable />
  </div>
</template>

<script setup>
import { onMounted, onActivated, onDeactivated } from 'vue'
import { VaButton, useToast } from 'vuestic-ui'
import { useServerSearch } from '../../composables/useServerSearch'
import ServerSearchFilter from '../../components/ServerList/ServerSearchFilter.vue'
import ServerDataTable from '../../components/ServerList/ServerDataTable.vue'

const { init: notify } = useToast()

const {
  restoreStateFromSession,
  saveStateToSession
} = useServerSearch()

/**
 * 添加服务器
 */
const handleAdd = () => {
  notify({
    message: '添加功能开发中',
    color: 'info'
  })
}

// 组件挂载时恢复状态
onMounted(() => {
  const restored = restoreStateFromSession()
  
  if (restored) {
    console.log('已恢复页面状态')
  }
})

// 组件激活时（从详情页返回）
onActivated(() => {
  // keep-alive 激活时恢复状态
  restoreStateFromSession()
})

// 组件失活时（跳转到详情页）
onDeactivated(() => {
  // keep-alive 失活时保存状态
  saveStateToSession()
})
</script>

<style scoped>
.server-list-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
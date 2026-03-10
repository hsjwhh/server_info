<!-- src/pages/server/ServerListPage.vue -->
<template>
  <div class="server-list-page">
    <div class="page-header mb-6">
      <h1 class="page-title">服务器列表</h1>
      <VaButton
        icon="mdi-plus"
        @click="$router.push('/server/entry')"
      >
        录入服务器
      </VaButton>
    </div>

    <!-- 搜索和筛选卡片 -->
    <div class="mb-6">
      <ServerSearchFilter />
    </div>

    <!-- 服务器列表 -->
    <ServerDataTable />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { VaButton } from 'vuestic-ui'
import { useServerSearch } from '../../composables/useServerSearch'
import ServerSearchFilter from '../../components/ServerList/ServerSearchFilter.vue'
import ServerDataTable from '../../components/ServerList/ServerDataTable.vue'

const {
  restoreStateFromSession,
  saveStateToSession
} = useServerSearch()

// 组件挂载时从 Session 恢复状态
onMounted(() => {
  restoreStateFromSession()
})

// 组件卸载前保存状态
onUnmounted(() => {
  saveStateToSession()
})
</script>

<style scoped>
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
}
</style>

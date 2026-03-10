<!-- src/layouts/PageHeader.vue -->
<template>
  <div class="page-header">
    <VaButton icon="mdi-menu" flat @click="onToggleSidebar" />
    <div class="page-header-content">
      <VaBreadcrumbs color="secondary">
        <VaBreadcrumbsItem 
          v-for="(item, index) in breadcrumbs" 
          :key="index" 
          :label="item.label"
          :to="item.to"
          :active="index === breadcrumbs.length - 1"
        />
      </VaBreadcrumbs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { VaButton, VaBreadcrumbs, VaBreadcrumbsItem } from 'vuestic-ui'

defineProps<{
  onToggleSidebar: () => void
}>()

const route = useRoute()

// 自动从当前路由读取 meta.breadcrumbs
// type Breadcrumb = { label: string; to?: string }

const breadcrumbs = computed(() => {
  return (route.meta?.breadcrumbs) || [
    { label: '首页', to: '/' }
  ]
})

</script>

<style scoped>
.page-header {
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border-light);
  padding: 0 var(--space-6);
  min-height: 44px;
  display: flex;
  align-items: center;
}

.page-header-content {
  padding: 0 var(--space-6);
  width: 100%;
}
</style>

<!-- src/layouts/Sidebar.vue -->
<template>
  <nav class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <span v-if="!collapsed" class="logo">SERVER_INFO</span>
      <span v-else class="logo-mini">SI</span>
    </div>

    <ul class="menu">
      <li 
        v-for="item in menu" 
        :key="item.name" 
        :class="['menu-item', { active: isActive(item.to) }]"
        @click="navigateTo(item.to)"
      >
        <i :class="['mdi', item.icon, 'menu-icon']"></i>
        <span v-if="!collapsed" class="menu-text">{{ item.label }}</span>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

defineProps<{ 
  collapsed: boolean 
}>()

const router = useRouter()
const route = useRoute()

/**
 * 从路由配置自动生成菜单
 */
const menu = computed(() => {
  // 获取根路由的子路由
  const rootRoute = router.options.routes.find(r => r.path === '/')
  // const rootRoute = router.getRoutes().find(r => r.path === '/')
  if (!rootRoute || !rootRoute.children) {
    return []
  }

  // 过滤出需要显示在菜单中的路由
  return rootRoute.children
    .filter(route => route.meta?.showInMenu)
    .map(route => ({
      name: route.name as string,
      label: route.meta?.title || route.name as string,
      icon: route.meta?.icon || 'home',
      to: route.path === '' ? '/' : `/${route.path}`,
    }))
})

/**
 * 判断菜单项是否激活
 */
const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

/**
 * 导航到指定路由
 */
const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
/* 整体 Sidebar 样式 */
.sidebar {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: width var(--transition-slow);
  border-right: 1px solid var(--color-border-light);
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

/* 顶部 Logo 区域 */
.sidebar-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-5);
  font-weight: var(--font-weight-bold);
  font-size: var(--text-base);
  border-bottom: 1px solid var(--color-border-light);
  color: var(--sidebar-item-active-color);
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.sidebar:not(.collapsed) .sidebar-header {
  justify-content: flex-start;
  gap: var(--space-3);
}

.logo, .logo-mini {
  transition: opacity var(--transition-fast), transform var(--transition-fast), max-width var(--transition-slow);
  overflow: hidden;
  white-space: nowrap;
}

.sidebar.collapsed .logo {
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
  max-width: 0;
}

.sidebar:not(.collapsed) .logo-mini {
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
  max-width: 0;
}

/* 菜单列表 */
.menu {
  list-style: none;
  margin: 0;
  padding: var(--space-3) var(--space-2);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

/* 单个菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  padding: var(--space-3);
  cursor: pointer;
  color: var(--sidebar-item-color);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
  white-space: nowrap;
  border-radius: var(--radius-md);
}

.sidebar.collapsed .menu-item {
  padding: var(--space-3) 0;
  justify-content: center;
}

/* 图标 */
.menu-icon {
  font-size: 20px;
  color: var(--sidebar-icon-color);
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.sidebar:not(.collapsed) .menu-icon {
  margin-right: var(--space-3);
}

/* 文字 */
.menu-text {
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity var(--transition-fast);
}

.sidebar.collapsed .menu-text {
  opacity: 0;
  display: none;
}

/* Hover 效果 */
.menu-item:hover {
  background: var(--sidebar-item-hover-bg);
}

/* 选中状态 */
.menu-item.active {
  background: var(--sidebar-item-active-bg);
  color: var(--sidebar-item-active-color);
  font-weight: var(--font-weight-semibold);
}

.menu-item.active .menu-icon {
  color: var(--sidebar-item-active-color);
}
</style>

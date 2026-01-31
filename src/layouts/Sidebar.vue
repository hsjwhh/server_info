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
import type { MenuItem } from '../types'

defineProps<{ 
  collapsed: boolean 
}>()

const router = useRouter()
const route = useRoute()

/**
 * 从路由配置自动生成菜单
 */
const menu = computed<MenuItem[]>(() => {
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
  width: 240px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 64px;
}

/* 顶部 Logo 区域 */
.sidebar-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  font-weight: 600;
  font-size: 18px;
}

.sidebar.collapsed .sidebar-header {
  padding: 0;
}

.logo {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-mini {
  font-size: 16px;
  font-weight: 700;
}

/* 菜单列表 */
.menu {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

/* 单个菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  color: #374151;
  font-size: 15px;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.sidebar.collapsed .menu-item {
  padding: 12px 0;
  justify-content: center;
}

/* 图标 */
.menu-icon {
  font-size: 20px;
  color: #6b7280;
  flex-shrink: 0;
}

.sidebar:not(.collapsed) .menu-icon {
  margin-right: 12px;
}

/* 文字 */
.menu-text {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Hover 效果 */
.menu-item:hover {
  background: #f3f4f6;
}

/* 选中状态 */
.menu-item.active {
  background: #e8f0fe;
  color: #1e40af;
  font-weight: 600;
}

.menu-item.active .menu-icon {
  color: #1e40af;
}
</style>

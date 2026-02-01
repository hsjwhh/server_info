<!-- src/layouts/Layout.vue -->
<template>
  <div class="app-layout">
    <!-- 左侧 Sidebar -->
    <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <Sidebar :collapsed="isSidebarCollapsed" />
    </aside>

    <!-- 右侧主区域 -->
    <div class="main-area">
      <!-- 顶部 Header -->
      <header class="header-container">
        <Header />
      </header>

      <!-- 面包屑导航区域 -->
      <PageHeader :onToggleSidebar="toggleSidebar" />

      <!-- 内容区 -->
      <main class="content">
        <!-- router-view 渲染当前路由对应的页面组件 -->
        <router-view />
      </main>
    </div>

  </div>
</template>

<script setup>
// 引入 Element Plus 图标
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import PageHeader from './PageHeader.vue'

const isSidebarCollapsed = ref(false)
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<style scoped>
/* 整体布局：左侧固定 Sidebar + 右侧主区域 */
.app-layout {
  display: flex;
  height: 100vh;
  background: #f5f6fa;
}

/* Sidebar 占固定宽度（可折叠） */
.sidebar {
  width: 240px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 64px;
}

/* 主区域：Header + 内容 */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Header 容器 */
.header-container {
  height: 56px;
  background: #ffffff;
}

/* 内容区：滚动区域 + 企业级间距 */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 从 Header 底部开始绘制的竖向分割线 */
.main-area::before {
  content: '';
  position: absolute;
  left: 0;
  top: 56px;
  /* Header 高度 */
  bottom: 0;
  width: 1px;
  /* background: #e5e7eb; */
  z-index: 1;
}
</style>

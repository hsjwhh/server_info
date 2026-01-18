<template>
  <div class="layout">
    <!-- 顶部菜单栏 -->
    <TopBar :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    <div class="body">
      <!-- 左侧菜单栏 -->
      <Sidebar :collapsed="collapsed" />
      <!-- 右侧内容区 -->
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
// 引入 Element Plus 图标
import { ref } from 'vue'
import { House, Search } from '@element-plus/icons-vue'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue';
const collapsed = ref(false)
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.body {
  display: flex;
  flex: 1;
}

/* 右侧内容区 */
.content {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
}
</style>

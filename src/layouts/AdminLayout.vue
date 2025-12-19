<template>
  <div class="layout">
    <!-- 左侧菜单栏 -->
    <aside class="sidebar">
      <el-menu
        router
        default-active="/"
        class="el-menu-vertical-demo"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <!-- 首页 -->
        <el-menu-item index="/">
          <!-- 图标 + 文本 -->
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <!-- SN 查询 -->
        <el-menu-item index="/sn">
          <el-icon><Search /></el-icon>
          <span>SN 查询</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 右侧内容区 -->
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// 引入 Element Plus 图标
import { House, Search } from '@element-plus/icons-vue'
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

/* 左侧菜单栏 */
.sidebar {
  width: 200px;
  background-color: #001529;
  padding-top: 20px;
}

/* 右侧内容区 */
.content {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
}
</style>

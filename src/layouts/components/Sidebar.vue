<template>
  <aside class="sidebar" :class="{ collapsed }">
    <el-menu
      router
      :collapse="collapsed"
      default-active="/"
      background-color="#001529"
      text-color="#fff"
      active-text-color="#409EFF"
    >
      <el-menu-item index="/">
        <el-icon><House /></el-icon>
        <span v-if="!collapsed">首页</span>
      </el-menu-item>

      <el-menu-item index="/sn">
        <el-icon><Search /></el-icon>
        <span v-if="!collapsed">SN 查询</span>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<script setup>
import { House, Search } from '@element-plus/icons-vue'

// 接收父组件传入的折叠状态
defineProps({
  collapsed: Boolean
})
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #001529;
  padding-top: 20px;
  transition: width 0.2s;
}

.sidebar.collapsed {
  width: 64px;
}
</style>

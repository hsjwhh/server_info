<template>
  <!-- 整体布局容器 -->
  <div class="layout">
    <!-- 左侧侧边栏，用来放菜单、导航 -->
    <aside class="sidebar">
      <!-- 系统标题或 Logo 区域 -->
      <div class="logo">
        <!-- 这里简单写个文字，后续可以换成 Logo 图片 -->
        Vue3 + ElementPlus 后台
      </div>

      <!-- 导航区域：这里先用最简单的 router-link，将来可以替换成 Element Plus 的 el-menu -->
      <nav class="nav">
        <!-- 首页链接，对应子路由 path: ''（实际路径就是 '/'） -->
        <!-- 'to="/"': 点击后会跳转到根路径，渲染 Home.vue -->
        <router-link to="/">首页</router-link>

        <!-- 预留一个 SN 查询的菜单项，将来你创建 SnQuery.vue 和 '/sn' 子路由后，就能生效 -->
        <router-link to="/sn">SN 查询</router-link>
      </nav>
    </aside>

    <!-- 右侧内容区域，用来渲染具体的业务页面 -->
    <main class="content">
      <!-- 内层路由出口：
           对应 router/index.js 中 path: '/' 的 children 那一层
           根据当前子路径（''、'sn' 等），在这里渲染 Home、SnQuery 等组件 -->
      <router-view />
    </main>
  </div>
</template>

<script setup>
// 当前布局组件只负责结构和布局，不需要复杂逻辑
// 如果后面需要做：菜单高亮、折叠状态、用户信息等，可以在这里加响应式状态
</script>

<style scoped>
/* 整体布局：左右结构，左侧固定宽度，右侧自适应 */
.layout {
  display: flex;          /* 使用 flex 布局实现左右结构 */
  min-height: 100vh;      /* 高度铺满整个视口高度 */
}

/* 左侧侧边栏样式 */
.sidebar {
  width: 200px;           /* 固定宽度，后台常见侧边栏宽度 */
  background-color: #001529; /* 深色背景，类似常见后台风格 */
  color: #fff;            /* 文本白色 */
  padding: 16px;          /* 内边距，让内容不贴边 */
  box-sizing: border-box; /* 包含 padding 在内计算宽度 */
}

/* Logo / 标题区域 */
.logo {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 24px;    /* 与下面的导航区拉开距离 */
}

/* 导航区域 */
.nav {
  display: flex;
  flex-direction: column; /* 垂直排列链接 */
  gap: 8px;               /* 每个链接之间留一点间距 */
}

/* 导航中的 router-link 基础样式 */
.nav a {
  color: #fff;            /* 链接文字颜色 */
  text-decoration: none;  /* 去掉默认下划线 */
  padding: 8px 12px;      /* 点击区域更大一些 */
  border-radius: 4px;     /* 轻微圆角，显得柔和一点 */
}

/* 鼠标悬停时的高亮效果 */
.nav a:hover {
  background-color: #1890ff; /* 悬停时背景高亮 */
}

/* 右侧内容区域 */
.content {
  flex: 1;                /* 占据除了侧边栏以外的所有剩余空间 */
  padding: 16px;          /* 内边距，让内容不贴边 */
  background-color: #f5f5f5; /* 淡灰背景，让页面层次更清晰 */
  box-sizing: border-box;
}
</style>

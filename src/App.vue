<script setup>
// 当前 App.vue 不需要额外逻辑和状态，保持最简洁
// 所有页面内容、布局逻辑都交给路由和各个子组件处理
// import HelloWorld from './components/HelloWorld.vue'
</script>


<template>
  <!-- 顶层路由出口：Vue Router 会把当前匹配到的“顶层路由组件”渲染到这里 -->
  <!-- 在当前项目结构中，这里会渲染 AdminLayout 这个布局组件 -->
  <router-view />
</template>

/* 如果有全局性的简单样式（比如背景色）也可以写在这里 */
/* 目前我们保持干净，让样式分散到具体页面或布局组件中 */
<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

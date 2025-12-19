<template>
  <!-- 页面整体容器 -->
  <div>
    <!-- 标题 -->
    <h2>SN 查询</h2>

    <!-- 查询输入框 + 按钮 -->
    <el-input
      v-model="sn"
      placeholder="请输入 SN"
      style="width: 300px; margin-right: 10px"
    />

    <el-button type="primary" @click="handleSearch">
      查询
    </el-button>

    <!-- 查询结果展示区域 -->
    <div style="margin-top: 20px">
      <el-card v-if="result">
        <p>查询结果：</p>
        <pre>{{ result }}</pre>
      </el-card>
    </div>
  </div>
</template>

<script setup>
// 使用 Vue3 的组合式 API
import { ref } from 'vue'

// 输入框绑定的 SN 值
const sn = ref('')

// 查询结果
const result = ref('')

// 点击查询按钮时触发
const handleSearch = () => {
  // 这里先用 mock 数据，后面你会接入真实 API
  result.value = `你查询的 SN 是：${sn.value}`
}
</script>

<style scoped>
/* 页面级样式（可选） */
</style>

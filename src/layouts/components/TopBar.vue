<template>
    <header class="topbar">
        <div class="left">
            <el-icon class="collapse-btn" @click="$emit('toggle')">
                <Fold v-if="!collapsed" />
                <Expand v-else />
            </el-icon>
            <span class="title">SERVER_INFO</span>
        </div>

        <div class="right">
            <el-dropdown>
                <span class="user">
                    admin
                    <el-icon>
                        <ArrowDown />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>个人设置</el-dropdown-item>
                        <el-dropdown-item divided>退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </header>
</template>

<script setup>
import { ArrowDown, Fold, Expand } from '@element-plus/icons-vue'
defineProps({
    collapsed: Boolean
})
</script>

<style scoped>
.topbar {
    height: 56px;
    background: #1f2d3d;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
}

.title {
    font-size: 18px;
    font-weight: bold;
}

.user {
    cursor: pointer;
    display: flex;
    align-items: center;
}

.left {
  display: flex;
  align-items: center; /* 图标 + 文字 垂直居中 */
}

.collapse-btn {
  display: flex;        /* 让图标内部的 SVG 也居中 */
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 16px;
  cursor: pointer;
}
</style>

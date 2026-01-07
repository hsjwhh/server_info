<template>
    <div class="login-container">
        <el-card class="login-card">
            <h2 class="title">SERVER_INFO 登录</h2>

            <!-- 登录表单 -->
            <el-form :model="form" ref="formRef" label-width="80px">
                <!-- 用户名 -->
                <el-form-item label="用户名">
                    <el-input v-model="form.username" placeholder="请输入用户名" clearable />
                </el-form-item>

                <!-- 密码 -->
                <el-form-item label="密码">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password clearable />
                </el-form-item>

                <!-- 登录按钮 -->
                <el-form-item>
                    <el-button type="primary" style="width: 100%" @click="handleLogin" :loading="loading">
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
/**
 * Login.vue
 *
 * 功能：
 *   - 输入用户名/密码
 *   - 调用 /api/auth/login
 *   - 保存 accessToken / refreshToken
 *   - 登录成功跳转首页
 *
 * 注意：
 *   - 错误提示由 axios 响应拦截器统一处理
 *   - 登录成功后，路由守卫会保护其它页面
 */

import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request' // 你封装的 axios 实例

const router = useRouter()

// 登录表单数据
const form = reactive({
    username: '',
    password: ''
})

const loading = ref(false)

/**
 * 登录方法
 * 1. 调用后端 /api/auth/login
 * 2. 保存 accessToken / refreshToken
 * 3. 跳转首页
 */
const handleLogin = async () => {
    if (!form.username || !form.password) {
        return ElMessage.warning('请输入用户名和密码')
    }

    loading.value = true

    try {
        /**
         * 调用后端登录接口
         * request.post 会返回 response.data（你封装的逻辑）
         *
         * 后端返回结构：
         * {
         *   user: { id, username, role },
         *   accessToken: "...",
         *   refreshToken: "..."
         * }
         */
        const res = await request.post('/auth/login', {
            username: form.username,
            password: form.password
        })

        // 保存 token
        localStorage.setItem('accessToken', res.accessToken)
        localStorage.setItem('refreshToken', res.refreshToken)

        // 登录成功跳转首页
        router.push('/')

    } catch (err) {
        // 错误提示由 axios 拦截器处理，这里无需处理
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
/* 页面整体居中 */
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #f5f7fa;
}

/* 卡片样式 */
.login-card {
    width: 380px;
    padding: 20px;
}

/* 标题样式 */
.title {
    text-align: center;
    margin-bottom: 20px;
}
</style>

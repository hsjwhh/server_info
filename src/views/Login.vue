<template>
  <div class="login-page" @keyup.enter="handleLogin" tabindex="0">
    <div class="login-bg"></div>

    <div class="login-container">
      <el-card class="login-card" shadow="always">
        <div class="login-header">
          <div class="login-logo">
            <span class="logo-text">SI</span>
          </div>
          <div>
            <div class="system-name">控制台</div>
            <div class="system-subtitle">服务器资产管理平台</div>
          </div>
        </div>

        <el-divider />

        <!-- <h2 class="login-title">登录</h2>
        <p class="login-desc">请输入您的账号密码继续</p> -->

        <el-form :model="form" ref="formRef" label-position="top">
          <el-form-item label="用户名">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              clearable
              autofocus
            />
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
              block
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  if (!form.username || !form.password) {
    return ElMessage.warning('请输入用户名和密码')
  }

  loading.value = true

  try {
    const res = await request.post('/auth/login', {
      username: form.username,
      password: form.password
    })

    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)

    router.push('/')
  } catch (err) {
    // 错误提示由 axios 拦截器处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 整体浅色背景 */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f4f7;
}

/* 卡片容器 */
.login-container {
  width: 100%;
  max-width: 420px;
  padding: 16px;
}

/* 卡片样式 */
.login-card {
  border-radius: 14px;
  padding: 26px;
}

/* 顶部 Logo + 标题 */
.login-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}

.login-logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.system-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.system-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

/* 登录标题 */
.login-title {
  margin: 4px 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.login-desc {
  margin: 0 0 14px;
  font-size: 13px;
  color: #6b7280;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  border-radius: 8px;
  height: 38px;
}
</style>

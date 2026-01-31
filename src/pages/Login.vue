<!-- src/pages/auth/LoginPage.vue -->
<template>
  <div class="login-page" @keyup.enter="handleLogin" tabindex="0">
    <div class="login-bg"></div>

    <div class="login-container">
      <VaCard class="login-card">
        <VaCardContent>
          <div class="login-header">
            <div class="login-logo">
              <span class="logo-text">SI</span>
            </div>
            <div>
              <div class="system-name">控制台</div>
              <div class="system-subtitle">服务器资产管理平台</div>
            </div>
          </div>

          <VaDivider />

          <VaForm ref="formRef" class="login-form">
            <VaInput
              v-model="form.username"
              label="用户名"
              placeholder="请输入用户名"
              clearable
              autofocus
            >
              <template #prependInner>
                <VaIcon name="account" color="secondary" />
              </template>
            </VaInput>

            <VaInput
              v-model="form.password"
              type="password"
              label="密码"
              placeholder="请输入密码"
              clearable
            >
              <template #prependInner>
                <VaIcon name="lock" color="secondary" />
              </template>
            </VaInput>

            <VaButton
              class="login-button"
              :loading="loading"
              @click="handleLogin"
              block
            >
              登录
            </VaButton>
          </VaForm>
        </VaCardContent>
      </VaCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  VaCard, 
  VaCardContent, 
  VaDivider, 
  VaForm, 
  VaInput, 
  VaButton, 
  VaIcon,
  useToast
} from 'vuestic-ui'
import request from '../utils/request'

const router = useRouter()
const { init: notify } = useToast()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const formRef = ref()

const handleLogin = async () => {
  if (!form.username || !form.password) {
    notify({
      message: '请输入用户名和密码',
      color: 'warning'
    })
    return
  }

  loading.value = true

  try {
    const res = await request.post('/auth/login', {
      username: form.username,
      password: form.password
    })

    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)

    notify({
      message: '登录成功',
      color: 'success'
    })

    router.push('/')
  } catch (err) {
    // 错误提示由 axios 拦截器处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 背景效果 */
.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 0;
}

.login-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 登录容器 */
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 0 20px;
}

/* 登录卡片 */
.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 登录头部 */
.login-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.login-logo {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.system-name {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.system-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* 表单 */
.login-form {
  margin-top: 24px;
}

.login-form .va-input-wrapper {
  margin-bottom: 20px;
}

.login-button {
  margin-top: 8px;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 640px) {
  .login-container {
    max-width: 100%;
  }

  .system-name {
    font-size: 20px;
  }

  .login-logo {
    width: 48px;
    height: 48px;
  }

  .logo-text {
    font-size: 20px;
  }
}
</style>
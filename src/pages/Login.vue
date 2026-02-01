<!-- src/pages/Login.vue -->
<template>
  <div class="auth-page" @keyup.enter="handleLogin">
    <div class="auth-wrapper">
      <!-- 左侧装饰区 -->
      <div class="auth-decoration">
        <div class="decoration-content">
          <div class="brand-section">
            <div class="brand-logo">
              <VaIcon name="mdi-server-security" size="56px" color="#ffffff" />
            </div>
            <h1 class="brand-title">服务器资产管理平台</h1>
            <p class="brand-subtitle">专业 · 高效 · 安全</p>
          </div>

          <div class="features">
            <div class="feature-item">
              <VaIcon name="mdi-shield-check" color="#ffffff" size="24px" />
              <span>安全可靠的数据管理</span>
            </div>
            <div class="feature-item">
              <VaIcon name="mdi-lightning-bolt" color="#ffffff" size="24px" />
              <span>快速响应的查询体验</span>
            </div>
            <div class="feature-item">
              <VaIcon name="mdi-chart-line" color="#ffffff" size="24px" />
              <span>实时监控的资源状态</span>
            </div>
          </div>
        </div>

        <!-- 装饰图案 -->
        <div class="decoration-pattern">
          <div class="pattern-circle pattern-1"></div>
          <div class="pattern-circle pattern-2"></div>
          <div class="pattern-circle pattern-3"></div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="auth-form-wrapper">
        <div class="auth-form-container">
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">请登录您的账户以继续</p>
          </div>

          <VaForm ref="formRef" class="auth-form">
            <VaInput
              v-model="form.username"
              label="用户名"
              placeholder="请输入用户名"
              clearable
              :rules="[required('用户名')]"
            >
              <template #prepend>
                <VaIcon name="mdi-account" color="secondary" />
              </template>
            </VaInput>

            <VaInput
              v-model="form.password"
              type="password"
              label="密码"
              placeholder="请输入密码"
              clearable
              :rules="[required('密码')]"
            >
              <template #prepend>
                <VaIcon name="mdi-lock" color="secondary" />
              </template>
            </VaInput>

            <div class="form-options">
              <VaCheckbox v-model="rememberMe" label="记住我" />
              <VaButton preset="plain" size="small" class="forgot-password">
                忘记密码?
              </VaButton>
            </div>

            <VaButton
              class="login-button"
              :loading="loading"
              @click="handleLogin"
              block
            >
              登录
            </VaButton>

            <VaDivider class="my-4">
              <span class="divider-text">或</span>
            </VaDivider>

            <div class="social-login">
              <VaButton
                preset="secondary"
                icon="mdi-google"
                class="social-button"
              >
                Google
              </VaButton>
              <VaButton
                preset="secondary"
                icon="mdi-github"
                class="social-button"
              >
                GitHub
              </VaButton>
            </div>
          </VaForm>

          <div class="form-footer">
            <span class="footer-text">还没有账户？</span>
            <VaButton preset="plain" size="small">
              立即注册
            </VaButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  VaForm,
  VaInput,
  VaButton,
  VaIcon,
  VaCheckbox,
  VaDivider,
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
const rememberMe = ref(false)
const formRef = ref()

const required = (fieldName) => (value) => {
  return !!value || `${fieldName}不能为空`
}

const handleLogin = async () => {
  if (!formRef.value.validate()) {
    return
  }

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

    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true')
      localStorage.setItem('savedUsername', form.username)
    }

    notify({
      message: '登录成功,欢迎回来!',
      color: 'success'
    })

    router.push('/')
  } catch (err) {
    // 错误提示由 axios 拦截器处理
    console.error('登录失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.auth-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin: 2rem;
}

/* 左侧装饰区 */
.auth-decoration {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.decoration-content {
  position: relative;
  z-index: 2;
}

.brand-section {
  text-align: center;
  margin-bottom: 3rem;
}

.brand-logo {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  backdrop-filter: blur(10px);
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
}

.brand-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #ffffff;
  font-size: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

/* 装饰图案 */
.decoration-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.1;
}

.pattern-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.pattern-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation: float 20s infinite ease-in-out;
}

.pattern-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation: float 15s infinite ease-in-out reverse;
}

.pattern-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 18s infinite ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* 右侧表单区 */
.auth-form-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: #ffffff;
}

.auth-form-container {
  width: 100%;
  max-width: 420px;
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -0.5rem;
}

.forgot-password {
  color: var(--va-primary);
  font-size: 0.875rem;
}

.login-button {
  margin-top: 0.5rem;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
}

.divider-text {
  padding: 0 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.social-login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.social-button {
  height: 44px;
}

.form-footer {
  margin-top: 2rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.footer-text {
  color: #6b7280;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .auth-decoration {
    display: none;
  }

  .auth-wrapper {
    max-width: 500px;
  }
}

@media (max-width: 640px) {
  .auth-wrapper {
    margin: 1rem;
    min-height: auto;
  }

  .auth-form-wrapper {
    padding: 2rem 1.5rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .brand-title {
    font-size: 1.5rem;
  }
}
</style>

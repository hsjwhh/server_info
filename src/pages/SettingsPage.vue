<template>
  <div class="settings-page">
    <h1 class="page-title">个人设置</h1>

    <VaCard>
      <VaCardTitle>系统设置</VaCardTitle>
      <VaCardContent>
        <div class="settings-section">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">自动刷新</div>
              <div class="setting-description">自动刷新服务器列表数据</div>
            </div>
            <VaSwitch v-model="settings.autoRefresh" />
          </div>

          <VaDivider />

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">刷新间隔</div>
              <div class="setting-description">设置自动刷新的时间间隔（秒）</div>
            </div>
            <VaInput
              v-model.number="settings.refreshInterval"
              type="number"
              min="5"
              max="3600"
              :disabled="!settings.autoRefresh"
              class="interval-input"
            />
          </div>

          <VaDivider />

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">暗色模式</div>
              <div class="setting-description">启用暗色主题（预留）</div>
            </div>
            <VaSwitch v-model="settings.darkMode" />
          </div>

          <VaDivider />

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">通知</div>
              <div class="setting-description">启用系统通知</div>
            </div>
            <VaSwitch v-model="settings.notifications" />
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard class="mt-4">
      <VaCardTitle>账号安全</VaCardTitle>
      <VaCardContent>
        <div class="settings-section">
          <VaInput
            v-model="passwordForm.oldPassword"
            type="password"
            label="当前密码"
            placeholder="请输入当前密码"
            class="w-full"
          />
          <VaInput
            v-model="passwordForm.newPassword"
            type="password"
            label="新密码"
            placeholder="请输入新密码（不少于 6 位）"
            class="w-full"
          />
          <VaInput
            v-model="passwordForm.confirmPassword"
            type="password"
            label="确认新密码"
            placeholder="请再次输入新密码"
            class="w-full"
          />
          <div>
            <VaButton
              :loading="passwordLoading"
              @click="handleChangePassword"
            >
              修改密码
            </VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard class="mt-4">
      <VaCardTitle>关于</VaCardTitle>
      <VaCardContent>
        <div class="about-section">
          <div class="about-item">
            <span class="about-label">系统版本</span>
            <span class="about-value">v1.0.0</span>
          </div>
          <div class="about-item">
            <span class="about-label">技术栈</span>
            <span class="about-value">Vue 3 + Vuestic UI</span>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <div class="action-buttons mt-4">
      <VaButton @click="saveSettings">保存设置</VaButton>
      <VaButton preset="secondary" @click="resetSettings">重置为默认</VaButton>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import {
  VaCard,
  VaCardTitle,
  VaCardContent,
  VaSwitch,
  VaInput,
  VaDivider,
  VaButton,
  useToast
} from 'vuestic-ui'
import { changePassword } from '../api/users'

const SETTINGS_STORAGE_KEY = 'appSettings'

const defaultSettings = {
  autoRefresh: true,
  refreshInterval: 30,
  darkMode: false,
  notifications: true
}

const { init: notify } = useToast()

const readSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) {
      return { ...defaultSettings }
    }

    const parsed = JSON.parse(raw)
    return {
      ...defaultSettings,
      ...parsed,
    }
  } catch (error) {
    console.error('读取设置失败:', error)
    return { ...defaultSettings }
  }
}

const settings = ref(readSettings())

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordLoading = ref(false)

const handleChangePassword = async () => {
  // 前端基础校验
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    notify({ message: '请填写所有密码字段', color: 'warning' })
    return
  }
  if (passwordForm.newPassword.length < 6) {
    notify({ message: '新密码长度不能少于 6 位', color: 'warning' })
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    notify({ message: '两次输入的新密码不一致', color: 'warning' })
    return
  }

  passwordLoading.value = true
  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    notify({ message: '密码修改成功', color: 'success' })
    // 清空表单
    Object.assign(passwordForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
  } catch (err) {
    // 错误提示由 axios 拦截器处理，这里只做兜底
    const msg = err.response?.data?.message || '密码修改失败'
    notify({ message: msg, color: 'danger' })
  } finally {
    passwordLoading.value = false
  }
}

watch(
  () => settings.value.autoRefresh,
  (enabled) => {
    if (enabled && settings.value.refreshInterval < 5) {
      settings.value.refreshInterval = 5
    }
  }
)

const normalizeRefreshInterval = () => {
  const current = Number(settings.value.refreshInterval)
  if (!Number.isFinite(current)) {
    settings.value.refreshInterval = defaultSettings.refreshInterval
    return
  }

  settings.value.refreshInterval = Math.min(3600, Math.max(5, Math.round(current)))
}

const saveSettings = () => {
  normalizeRefreshInterval()

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings.value))
    notify({
      message: '设置已保存',
      color: 'success'
    })
  } catch (error) {
    console.error('保存设置失败:', error)
    notify({
      message: '保存失败，请稍后重试',
      color: 'danger'
    })
  }
}

const resetSettings = () => {
  settings.value = { ...defaultSettings }
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings.value))

  notify({
    message: '设置已重置为默认值',
    color: 'info'
  })
}
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
}

.settings-page :deep(.page-title) {
  margin-bottom: var(--space-6) !important;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) 0;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.setting-label {
  display: block;
  font-weight: 700;
  color: var(--color-text-primary);
}

.setting-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.interval-input {
  width: 120px;
}

.about-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.about-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.about-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.about-value {
  font-weight: 600;
  color: var(--color-text-primary);
}

.action-buttons {
  display: flex;
  gap: var(--space-3);
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .interval-input {
    width: 100%;
    max-width: 240px;
  }
}
</style>

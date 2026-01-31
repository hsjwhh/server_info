<!-- src/pages/SettingsPage.vue -->
<template>
  <div class="settings-page">
    <h1 class="page-title">设置</h1>

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
              :disabled="!settings.autoRefresh"
              style="width: 100px;"
            />
          </div>

          <VaDivider />

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">暗色模式</div>
              <div class="setting-description">启用暗色主题</div>
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
      <VaCardTitle>关于</VaCardTitle>
      <VaCardContent>
        <div class="about-section">
          <div class="about-item">
            <span class="about-label">系统版本：</span>
            <span class="about-value">v1.0.0</span>
          </div>
          <div class="about-item">
            <span class="about-label">构建日期：</span>
            <span class="about-value">2025-01-29</span>
          </div>
          <div class="about-item">
            <span class="about-label">技术栈：</span>
            <span class="about-value">Vue 3 + TypeScript + Vuestic UI</span>
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

<script setup lang="ts">
import { ref } from 'vue'
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

const { init: notify } = useToast()

const settings = ref({
  autoRefresh: true,
  refreshInterval: 30,
  darkMode: false,
  notifications: true
})

const saveSettings = () => {
  // TODO: 保存到本地存储或后端
  notify({
    message: '设置已保存',
    color: 'success'
  })
}

const resetSettings = () => {
  settings.value = {
    autoRefresh: true,
    refreshInterval: 30,
    darkMode: false,
    notifications: true
  }
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

.page-title {
  margin-bottom: 1.5rem;
  font-size: 32px;
  font-weight: 700;
  line-height: 2.25rem;
  color: #111827;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.setting-label {
  font-weight: 600;
  color: #111827;
}

.setting-description {
  font-size: 14px;
  color: #6b7280;
}

.about-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.about-item {
  display: flex;
  gap: 0.5rem;
}

.about-label {
  font-weight: 600;
  color: #6b7280;
  min-width: 100px;
}

.about-value {
  color: #111827;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}
</style>
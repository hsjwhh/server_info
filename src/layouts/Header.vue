<!-- src/layouts/Header.vue -->
<template>
  <header class="header">
    <div class="header-actions">
      <VaButton preset="plain" icon="mdi-bell-outline" class="action-btn" />

      <VaDropdown placement="bottom-end" :offset="[8, 0]" close-on-content-click>
        <template #anchor>
          <VaAvatar size="32px" color="primary" class="avatar">
            {{ userInitial }}
          </VaAvatar>
        </template>

        <VaDropdownContent class="user-dropdown">
          <!-- 用户信息区 -->
          <div class="user-info">
            <VaAvatar size="40px" color="primary">{{ userInitial }}</VaAvatar>
            <div class="user-meta">
              <div class="user-name">{{ username }}</div>
              <div class="user-role">管理员</div>
            </div>
          </div>

          <VaDivider class="dropdown-divider" />

          <VaMenuList :options="menuOptions" @selected="handleMenuSelect" />
        </VaDropdownContent>
      </VaDropdown>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  VaButton,
  VaAvatar,
  VaDropdown,
  VaDropdownContent,
  VaMenuList,
  VaDivider
} from 'vuestic-ui'

const router = useRouter()

// 从 localStorage 读取用户名（login 时已存）
const username = computed(() => {
  return localStorage.getItem('savedUsername') || 'Admin'
})

const userInitial = computed(() => {
  return username.value.charAt(0).toUpperCase()
})

const menuOptions = [
  { label: '个人设置', icon: 'mdi-account-cog', value: 'settings' },
  { label: '退出登录',  icon: 'mdi-logout',       value: 'logout'  },
]

const handleMenuSelect = (option) => {
  if (option.value === 'settings') {
    router.push('/settings')
  } else if (option.value === 'logout') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('savedUsername')
    localStorage.removeItem('rememberMe')
    router.push('/login')
  }
}
</script>

<style scoped>
.header {
  height: var(--header-height);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  color: var(--color-text-secondary);
  font-size: 20px;
}

.avatar {
  cursor: pointer;
}

/* 下拉面板 */
.user-dropdown {
  min-width: 200px;
  padding: var(--space-2) 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-4) var(--space-3);
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.user-name {
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--color-text-primary);
}

.user-role {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.dropdown-divider {
  margin: var(--space-1) 0;
}
</style>
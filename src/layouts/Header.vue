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

          <VaMenuList
            class="user-menu"
            text-by="label"
            value-by="value"
            icon-by="icon"
            :options="menuOptions"
            @selected="handleMenuSelect"
          />
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
  VaDivider,
  VaMenuList
} from 'vuestic-ui'
import { useAuthStore } from '../stores/auth'
import request from '../utils/request'
import { performLogout } from '../utils/logout'

const router = useRouter()
const authStore = useAuthStore()

// 用户名从 store 中读取，未登录时显示默认头像
const username = computed(() => authStore.user?.username || 'Admin')

const userInitial = computed(() => {
  return username.value.charAt(0).toUpperCase()
})

const menuOptions = [
  { label: '个人设置', icon: 'mdi-account-cog', value: 'settings' },
  { label: '退出登录',  icon: 'mdi-logout',       value: 'logout'  },
]

const handleMenuSelect = async (value, option) => {
  const selectedOption = option || menuOptions.find((item) => item.value === value)

  if (!selectedOption) {
    return
  }

  if (selectedOption.value === 'settings') {
    router.push('/settings')
  } else if (selectedOption.value === 'logout') {
    try {
      // 调用后端登出接口，并清除服务器端 HttpOnly Cookie
      await request.post('/auth/logout')
    } catch {
      // 即使请求失败也强制登出
    } finally {
      // 执行全量清理（Store 重置 + 缓存清理 + 跳转）
      performLogout()
    }
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
  width: 220px;
  background: var(--color-bg-white);
  padding: 8px 0;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-md);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4) var(--space-4);
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  font-size: var(--text-md);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.dropdown-divider {
  margin: 4px 0;
}

.user-menu {
  width: 100%;
}

.user-menu :deep(.va-menu-list) {
  width: 100%;
  min-width: 100%;
  padding: 4px;
  table-layout: auto;
}

.user-menu :deep(.va-menu-item) {
  --va-menu-item-hover-opacity: 0;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}

.user-menu :deep(.va-menu-item:hover) {
  background: var(--color-bg-hover);
}

.user-menu :deep(.va-menu-item::after) {
  display: none;
}

.user-menu :deep(.va-menu-item__cell--left) {
  padding-left: 10px;
  padding-right: 0;
  width: 32px;
}

.user-menu :deep(.va-menu-item__cell--center) {
  padding-left: 6px;
  padding-right: 10px;
}

.user-menu :deep(.va-menu-item__cell--right) {
  padding-right: 6px;
}

.user-menu :deep(.va-menu-item__left-icon) {
  font-size: 18px;
  color: var(--color-text-secondary);
}

.user-menu :deep(.va-menu-item__content) {
  display: block;
  padding: 8px 0;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  text-decoration: none;
  white-space: nowrap;
}
</style>
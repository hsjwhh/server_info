<!-- src/pages/UsersPage.vue -->
<template>
  <div class="users-page">
    <div class="page-header mb-6 flex items-center justify-between">
      <h1 class="page-title">用户管理</h1>
      <VaButton icon="mdi-account-plus" @click="openAddModal">
        新增用户
      </VaButton>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="flex justify-between items-center mb-4">
          <VaInput
            v-model="filter"
            placeholder="搜索用户名..."
            clearable
            class="w-64"
          >
            <template #prependInner>
              <VaIcon name="mdi-magnify" size="small" />
            </template>
          </VaInput>
        </div>

        <VaDataTable
          :items="users"
          :columns="columns"
          :filter="filter"
          :loading="loading"
          hoverable
          class="users-table"
        >
          <template #cell(role)="{ value }">
            <VaChip :color="value === 'admin' ? 'danger' : 'info'" size="small">
              {{ value === 'admin' ? '管理员' : '普通用户' }}
            </VaChip>
          </template>

          <template #cell(status)="{ value }">
            <VaBadge :text="Number(value) === 1 ? '启用' : '禁用'" :color="Number(value) === 1 ? 'success' : 'secondary'" />
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="flex gap-2">
              <VaButton
                preset="plain"
                icon="mdi-pencil"
                size="small"
                title="编辑用户"
                @click="openEditModal(rowData)"
              />
              <VaButton
                preset="plain"
                icon="mdi-devices"
                size="small"
                title="查看登录设备"
                @click="openSessionModal(rowData)"
              />
              <VaButton
                preset="plain"
                icon="mdi-delete"
                size="small"
                color="danger"
                title="删除用户"
                @click="confirmDelete(rowData)"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- 新增/编辑弹窗 -->
    <VaModal
      v-model="showModal"
      :title="isEdit ? '编辑用户' : '新增用户'"
      fixed-layout
      blur
      @ok="handleSubmit"
    >
      <div class="user-form flex flex-col gap-4 py-2" style="min-width: 320px;">
        <VaInput
          v-model="form.username"
          label="用户名"
          placeholder="请输入用户名"
          :readonly="isEdit"
          :rules="[(v) => !!v || '用户名必填']"
        />
        
        <VaInput
          v-if="!isEdit"
          v-model="form.password"
          type="password"
          label="初始密码"
          placeholder="请输入密码"
          :rules="[(v) => !!v || '初始密码必填']"
        />

        <VaSelect
          v-model="form.role"
          label="角色"
          :options="roleOptions"
          value-by="value"
          text-by="text"
          :disabled="isEdit && currentUserId === authStore.user?.id"
        />

        <VaSelect
          v-if="isEdit"
          v-model="form.status"
          label="账号状态"
          :options="statusOptions"
          value-by="value"
          text-by="text"
        />
      </div>
    </VaModal>

    <!-- Session 查看弹窗 -->
    <VaModal
      v-model="showSessionModal"
      title="登录设备"
      hide-default-actions
      fixed-layout
    >
      <div style="min-width: 360px; min-height: 100px;">
        <div v-if="sessionLoading" class="text-center py-6">
          <VaProgressCircle indeterminate size="small" />
        </div>

        <div v-else-if="userSessions.length === 0" class="text-secondary text-sm py-4 text-center">
          该用户当前无活跃 session
        </div>

        <div v-else>
          <div
            v-for="s in userSessions"
            :key="s.id"
            class="flex justify-between items-center py-2 border-b last:border-b-0"
          >
            <div>
              <div class="font-medium text-sm">{{ s.deviceName || '未知设备' }}</div>
              <div class="text-xs text-secondary mt-0.5">
                {{ s.ipAddress || '未知 IP' }} · {{ formatDate(s.createdAt) }}
              </div>
            </div>
            <VaButton
              preset="plain"
              color="danger"
              size="small"
              icon="mdi-logout"
              title="强制下线"
              @click="revokeUserSessionItem(currentSessionUserId, s.id)"
            />
          </div>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast, useModal } from 'vuestic-ui'
import { getUsers, createUser, updateUser, deleteUser, getUserSessions, revokeUserSession } from '../api/users'
import { useAuthStore } from '../stores/auth'

const { init: notify } = useToast()
const { confirm } = useModal()
const authStore = useAuthStore()

const users = ref([])
const loading = ref(false)
const filter = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const currentUserId = ref(null)

// Session 弹窗
const showSessionModal = ref(false)
const sessionLoading = ref(false)
const userSessions = ref([])
const currentSessionUserId = ref(null)

const columns = [
  { key: 'username', label: '用户名', sortable: true },
  { key: 'role', label: '角色' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作', align: 'center' },
]

const roleOptions = [
  { text: '普通用户', value: 'user' },
  { text: '管理员', value: 'admin' },
]

const statusOptions = [
  { text: '启用', value: 1 },
  { text: '禁用', value: 0 },
]

const form = reactive({
  username: '',
  password: '',
  role: 'user',
  status: 1
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers()
    users.value = res || []
  } catch (err) {
    notify({ message: '获取用户列表失败', color: 'danger' })
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEdit.value = false
  currentUserId.value = null
  Object.assign(form, {
    username: '',
    password: '',
    role: 'user',
    status: 1
  })
  showModal.value = true
}

const openEditModal = (user) => {
  isEdit.value = true
  currentUserId.value = user.id
  Object.assign(form, {
    username: user.username,
    role: user.role,
    status: user.status
  })
  showModal.value = true
}

const handleSubmit = async () => {
  if (!form.username) return

  try {
    if (isEdit.value) {
      await updateUser(currentUserId.value, {
        role: form.role,
        status: form.status
      })
      notify({ message: '用户信息更新成功', color: 'success' })
    } else {
      if (!form.password) return
      await createUser(form)
      notify({ message: '用户创建成功', color: 'success' })
    }
    fetchUsers()
  } catch (err) {
    notify({ message: isEdit.value ? '更新失败' : '创建失败', color: 'danger' })
  }
}

const confirmDelete = async (user) => {
  if (user.id === authStore.user?.id) {
    notify({ message: '不能删除自己的账号', color: 'warning' })
    return
  }

  const result = await confirm({
    title: '确认删除',
    message: `确定要删除用户 "${user.username}" 吗？此操作不可撤销。`,
    okText: '确定删除',
    cancelText: '取消',
    color: 'danger'
  })

  if (result) {
    try {
      await deleteUser(user.id)
      notify({ message: '用户已删除', color: 'success' })
      fetchUsers()
    } catch (err) {
      notify({ message: '删除失败', color: 'danger' })
    }
  }
}

const openSessionModal = async (user) => {
  currentSessionUserId.value = user.id
  showSessionModal.value = true
  sessionLoading.value = true
  try {
    userSessions.value = await getUserSessions(user.id)
  } catch {
    notify({ message: '获取 session 列表失败', color: 'danger' })
  } finally {
    sessionLoading.value = false
  }
}

const revokeUserSessionItem = async (userId, sessionId) => {
  try {
    await revokeUserSession(userId, sessionId)
    notify({ message: '已踢下线', color: 'success' })
    userSessions.value = await getUserSessions(userId)
  } catch {
    notify({ message: '操作失败', color: 'danger' })
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.users-table :deep(.va-data-table__table) {
  font-size: 0.9rem;
}
</style>

<!-- src/pages/ConfigPlanPage.vue -->
<template>
  <div class="config-plan-page">
    <div class="page-header mb-6 flex items-center justify-between">
      <h1 class="page-title">服务器配置方案</h1>
      <VaButton
        preset="secondary"
        border-color="danger"
        color="danger"
        icon="mdi-delete-sweep"
        @click="confirmReset"
      >
        重置方案
      </VaButton>
    </div>

    <div class="config-container">
      <!-- 左侧：硬件选择区 (带内部导航) -->
      <VaCard class="selection-panel">
        <VaCardContent class="selection-content">
          <!-- 内部锚点导航 (更精简的样式) -->
          <div class="section-nav">
            <div 
              v-for="section in sections" 
              :key="section.id"
              class="nav-item"
              :class="{ active: activeSection === section.id }"
              @click="scrollToSection(section.id)"
            >
              <VaIcon :name="section.icon" size="18px" />
              <span class="nav-label">{{ section.label }}</span>
            </div>
          </div>

          <div class="hardware-form">
            <div id="section-cpu" class="scroll-mt section-anchor">
              <CpuSelector 
                @add-cpu="handleAddNewCpu" 
                @edit-cpu="handleEditCpu"
              />
            </div>
            <VaDivider />
            <div id="section-mb" class="scroll-mt section-anchor">
              <MotherboardSelector 
                @add-mb="handleAddNewMb" 
                @edit-mb="handleEditMb"
              />
            </div>
            <VaDivider />
            <div id="section-mem" class="scroll-mt section-anchor"><MemorySelector /></div>
            <VaDivider />
            <div id="section-storage" class="scroll-mt section-anchor"><StorageSelector /></div>
            <VaDivider />
            <div id="section-expansion" class="scroll-mt section-anchor"><ExpansionSelector /></div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- 右侧：总览 + 功耗 + 兼容性 -->
      <div class="summary-panel">
        <ConfigSummary />
        <PowerAnalysis class="mt-4" />
        <CompatibilityAlert class="mt-4" />
      </div>
    </div>

    <!-- 弹窗挂载：CPU 新增/修改 -->
    <CpuAddModal
      v-model="showCpuAddModal"
      :init-data="currentEditCpu"
      @saved="onCpuSaved"
    />

    <!-- 弹窗挂载：主板 新增/修改 -->
    <MotherboardAddModal
      v-model="showMbAddModal"
      :init-data="currentEditMb"
      @saved="onMbSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { VaCard, VaCardContent, VaDivider, VaIcon, VaButton, useModal } from 'vuestic-ui'
import CpuSelector        from '../components/ConfigPlan/CpuSelector.vue'
import MotherboardSelector from '../components/ConfigPlan/MotherboardSelector.vue'
import MemorySelector     from '../components/ConfigPlan/MemorySelector.vue'
import StorageSelector    from '../components/ConfigPlan/StorageSelector.vue'
import ExpansionSelector  from '../components/ConfigPlan/ExpansionSelector.vue'
import ConfigSummary      from '../components/ConfigPlan/ConfigSummary.vue'
import PowerAnalysis      from '../components/ConfigPlan/PowerAnalysis.vue'
import CompatibilityAlert from '../components/ConfigPlan/CompatibilityAlert.vue'
import CpuAddModal        from '../components/ConfigPlan/CpuAddModal.vue'
import MotherboardAddModal from '../components/ConfigPlan/MotherboardAddModal.vue'
import { useConfigPlanStore } from '../stores/configPlan'

const store = useConfigPlanStore()
const { selectCpu, resetConfig } = store
const { confirm } = useModal()

const sections = [
  { id: 'section-cpu', label: 'CPU', icon: 'memory' },
  { id: 'section-mb', label: '主板', icon: 'developer_board' },
  { id: 'section-mem', label: '内存', icon: 'straighten' },
  { id: 'section-storage', label: '存储', icon: 'storage' },
  { id: 'section-expansion', label: '扩展', icon: 'settings_input_component' },
]

const activeSection = ref(sections[0].id)
const showCpuAddModal = ref(false)
const showMbAddModal = ref(false)
const currentEditCpu = ref(null)
const currentEditMb = ref(null)
let observer = null

/**
 * 确认重置方案
 */
const confirmReset = async () => {
  const result = await confirm({
    title: '确认重置方案？',
    message: '此操作将清空当前已选的所有硬件配置，且不可撤销。',
    okText: '确定清空',
    cancelText: '取消',
    size: 'small',
    maxWidth: '400px'
  })

  if (result) {
    resetConfig()
  }
}

/**
 * 处理新增按钮点击
 */
const handleAddNewCpu = () => {
  currentEditCpu.value = null
  showCpuAddModal.value = true
}

const handleAddNewMb = () => {
  currentEditMb.value = null
  showMbAddModal.value = true
}

/**
 * 处理编辑按钮点击
 */
const handleEditCpu = (cpu) => {
  currentEditCpu.value = cpu
  showCpuAddModal.value = true
}

const handleEditMb = (mb) => {
  currentEditMb.value = mb
  showMbAddModal.value = true
}

/**
 * 当成功新增 CPU 后的处理逻辑：自动在方案中选中该 CPU
 */
const onCpuSaved = async (newCpu) => {
  if (newCpu) {
    await selectCpu(newCpu)
  }
  showCpuAddModal.value = false
}

/**
 * 当成功新增主板后的处理逻辑：自动在方案中选中该主板
 */
const onMbSaved = (newMb) => {
  if (newMb) {
    store.selectedMotherboard = newMb.model
    // 刷新主板列表以确保新录入的项出现在当前 Socket 过滤结果中
    store.loadCompatibleMotherboards()
  }
  showMbAddModal.value = false
}

const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    // 暂时禁用观察者防止点击跳转时的抖动高亮
    observer?.disconnect()
    
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = id
    
    // 滚动完成后重新启用
    setTimeout(() => {
      initObserver()
    }, 800)
  }
}

const initObserver = () => {
  if (observer) observer.disconnect()

  const options = {
    root: null, // 监听视口
    rootMargin: '-10% 0px -70% 0px', // 重点：当元素进入视口顶部 10% 到 30% 区域时触发
    threshold: 0
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id
      }
    })
  }, options)

  sections.forEach((s) => {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  })
}

onMounted(() => {
  nextTick(() => {
    initObserver()
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.config-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-6);
  align-items: start;
}

.selection-panel {
  display: flex;
  flex-direction: column;
}

.selection-content {
  display: flex;
  gap: 0;
  padding: 0 !important;
}

/* 极简导航条 */
.section-nav {
  width: 90px;
  position: sticky;
  top: var(--space-4);
  align-self: flex-start;
  padding: var(--space-4) var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  background: var(--va-background-secondary);
  border-right: 1px solid var(--va-background-border);
  z-index: 10;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--space-2) 0;
  cursor: pointer;
  color: var(--va-secondary);
  transition: all 0.2s ease;
  border-radius: var(--va-card-border-radius);
  opacity: 0.7;
}

.nav-item:hover {
  color: var(--va-primary);
  opacity: 1;
}

.nav-item.active {
  color: var(--va-primary);
  opacity: 1;
  font-weight: bold;
  background: var(--va-primary-light);
}

.nav-label {
  font-size: 0.75rem;
  white-space: nowrap;
}

.hardware-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
  padding-bottom: var(--space-8);
  min-width: 0;
}

/* 锚点偏移 */
.scroll-mt {
  scroll-margin-top: var(--space-6);
}

.summary-panel {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: var(--space-4);
}

@media (max-width: 1280px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
  .config-container {
    grid-template-columns: 1fr;
  }
  .summary-panel {
    position: static;
  }
  .section-nav {
    display: none;
  }
}
</style>

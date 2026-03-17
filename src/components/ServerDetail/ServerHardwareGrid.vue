<!-- src/components/ServerDetail/ServerHardwareGrid.vue -->
<template>
  <div class="hardware-section">
    <h3 class="section-title">
      <VaIcon name="mdi-memory" class="mr-2" />
      硬件配置
    </h3>

    <div class="hardware-grid">
      <!-- 基础硬件 -->
      <VaCard class="hardware-card hover-lift">
        <VaCardTitle>
          <VaIcon name="mdi-inbox" class="mr-2" />
          基础配置
        </VaCardTitle>
        <VaCardContent>
          <div class="hardware-items">
            <div v-if="server.chassis" class="hardware-item">
              <span class="hw-label">机箱</span>
              <VaChip color="primary">{{ server.chassis }}</VaChip>
            </div>
            <div v-if="server.psu" class="hardware-item">
              <span class="hw-label">电源</span>
              <VaChip color="primary">{{ server.psu }}</VaChip>
            </div>
            <div v-if="server.mb" class="hardware-item">
              <span class="hw-label">主板</span>
              <VaChip color="primary">{{ server.mb }}</VaChip>
            </div>
            <div v-if="server.bmcpwd" class="hardware-item">
              <span class="hw-label">BMC密码</span>
              <VaChip color="warning">{{ server.bmcpwd }}</VaChip>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- 计算资源 -->
      <VaCard class="hardware-card hover-lift">
        <VaCardTitle>
          <VaIcon name="mdi-cpu-64-bit" class="mr-2" />
          计算资源
        </VaCardTitle>
        <VaCardContent>
          <div class="hardware-items">
            <div v-if="server.cpu" class="hardware-item">
              <span class="hw-label">CPU</span>
              <div class="hw-value-group">
                <VaChip color="success">{{ server.cpu }}</VaChip>
                <VaBadge v-if="server.cpun" :text="`x${server.cpun}`" color="success" />
              </div>
            </div>
            <div v-if="server.mem" class="hardware-item">
              <span class="hw-label">内存</span>
              <div class="hw-value-group">
                <VaChip color="success">{{ server.mem }}</VaChip>
                <VaBadge v-if="server.memn" :text="`x${server.memn}`" color="success" />
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- 存储设备 -->
      <VaCard class="hardware-card hover-lift">
        <VaCardTitle>
          <VaIcon name="mdi-harddisk" class="mr-2" />
          存储设备
        </VaCardTitle>
        <VaCardContent>
          <div class="hardware-items">
            <!-- M.2 -->
            <div v-if="server.m2" class="hardware-item" :class="{ 'item-v': server.m2.includes(';') || server.m2n === 0 }">
              <span class="hw-label">M.2</span>
              <div class="hw-values">
                <template v-if="server.m2.includes(';') || server.m2n === 0">
                  <div v-for="(it, i) in server.m2.split(';')" :key="i" class="hw-multi-row">
                    <VaChip color="info">{{ parseItem(it).model }}</VaChip>
                    <VaBadge :text="`x${parseItem(it).count}`" color="info" />
                  </div>
                </template>
                <div v-else class="hw-value-group">
                  <VaChip color="info">{{ server.m2 }}</VaChip>
                  <VaBadge v-if="server.m2n" :text="`x${server.m2n}`" color="info" />
                </div>
              </div>
            </div>

            <!-- SSD -->
            <div v-if="server.ssd" class="hardware-item" :class="{ 'item-v': server.ssd.includes(';') || server.ssdn === 0 }">
              <span class="hw-label">SSD</span>
              <div class="hw-values">
                <template v-if="server.ssd.includes(';') || server.ssdn === 0">
                  <div v-for="(it, i) in server.ssd.split(';')" :key="i" class="hw-multi-row">
                    <VaChip color="info">{{ parseItem(it).model }}</VaChip>
                    <VaBadge :text="`x${parseItem(it).count}`" color="info" />
                  </div>
                </template>
                <div v-else class="hw-value-group">
                  <VaChip color="info">{{ server.ssd }}</VaChip>
                  <VaBadge v-if="server.ssdn" :text="`x${server.ssdn}`" color="info" />
                </div>
              </div>
            </div>

            <!-- HDD -->
            <div v-if="server.hdd" class="hardware-item" :class="{ 'item-v': server.hdd.includes(';') || server.hddn === 0 }">
              <span class="hw-label">HDD</span>
              <div class="hw-values">
                <template v-if="server.hdd.includes(';') || server.hddn === 0">
                  <div v-for="(it, i) in server.hdd.split(';')" :key="i" class="hw-multi-row">
                    <VaChip color="info">{{ parseItem(it).model }}</VaChip>
                    <VaBadge :text="`x${parseItem(it).count}`" color="info" />
                  </div>
                </template>
                <div v-else class="hw-value-group">
                  <VaChip color="info">{{ server.hdd }}</VaChip>
                  <VaBadge v-if="server.hddn" :text="`x${server.hddn}`" color="info" />
                </div>
              </div>
            </div>

            <!-- 阵列卡 -->
            <div v-if="server.raid" class="hardware-item" :class="{ 'item-v': server.raid.includes(';') || server.raidn === 0 }">
              <span class="hw-label">阵列卡</span>
              <div class="hw-values">
                <template v-if="server.raid.includes(';') || server.raidn === 0">
                  <div v-for="(it, i) in server.raid.split(';')" :key="i" class="hw-multi-row">
                    <VaChip color="warning">{{ parseItem(it).model }}</VaChip>
                    <VaBadge :text="`x${parseItem(it).count}`" color="warning" />
                  </div>
                </template>
                <div v-else class="hw-value-group">
                  <VaChip color="warning">{{ server.raid }}</VaChip>
                  <VaBadge v-if="server.raidn" :text="`x${server.raidn}`" color="warning" />
                </div>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- 扩展设备 -->
      <VaCard class="hardware-card hover-lift">
        <VaCardTitle>
          <VaIcon name="mdi-expansion-card" class="mr-2" />
          扩展设备
        </VaCardTitle>
        <VaCardContent>
          <div class="hardware-items">
            <!-- 网卡 -->
            <div v-if="server.lan" class="hardware-item" :class="{ 'item-v': server.lan.includes(';') || server.lann === 0 }">
              <span class="hw-label">网卡</span>
              <div class="hw-values">
                <template v-if="server.lan.includes(';') || server.lann === 0">
                  <div v-for="(it, i) in server.lan.split(';')" :key="i" class="hw-multi-row">
                    <VaChip color="primary">{{ parseItem(it).model }}</VaChip>
                    <VaBadge :text="`x${parseItem(it).count}`" color="primary" />
                  </div>
                </template>
                <div v-else class="hw-value-group">
                  <VaChip color="primary">{{ server.lan }}</VaChip>
                  <VaBadge v-if="server.lann" :text="`x${server.lann}`" color="primary" />
                </div>
              </div>
            </div>

            <!-- 显卡 -->
            <div v-if="server.gpu" class="hardware-item" :class="{ 'item-v': server.gpu.includes(';') || server.gpun === 0 }">
              <span class="hw-label">显卡</span>
              <div class="hw-values">
                <template v-if="server.gpu.includes(';') || server.gpun === 0">
                  <div v-for="(it, i) in server.gpu.split(';')" :key="i" class="hw-multi-row">
                    <VaChip color="danger">{{ parseItem(it).model }}</VaChip>
                    <VaBadge :text="`x${parseItem(it).count}`" color="danger" />
                  </div>
                </template>
                <div v-else class="hw-value-group">
                  <VaChip color="danger">{{ server.gpu }}</VaChip>
                  <VaBadge v-if="server.gpun" :text="`x${server.gpun}`" color="danger" />
                </div>
              </div>
            </div>
            
            <div v-if="server.os" class="hardware-item">
              <span class="hw-label">OS</span>
              <VaChip color="secondary">{{ server.os }}</VaChip>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </div>
</template>

<script setup>
import {
  VaCard, VaCardTitle, VaCardContent, VaIcon, VaChip, VaBadge
} from 'vuestic-ui'

const props = defineProps({
  server: { type: Object, required: true }
})

/**
 * 解析合并字符串格式： "型号 * 数量"
 */
const parseItem = (str) => {
  if (!str) return { model: '-', count: 0 }
  
  // 支持 * 或 x 作为分隔符
  const parts = str.split(/\s*[\*xX]\s*/)
  if (parts.length >= 2) {
    return {
      model: parts[0].trim(),
      count: parts[1].trim()
    }
  }
  return { model: str.trim(), count: 1 }
}
</script>

<style scoped>
.hardware-section { margin-top: var(--space-6); margin-bottom: var(--space-6); }
.section-title { display: flex; align-items: center; font-size: var(--text-lg); font-weight: 600; margin-bottom: var(--space-4); color: var(--color-text-primary); }
.hardware-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6); }
.hardware-items { display: flex; flex-direction: column; gap: var(--space-4); }

.hardware-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-md);
  min-height: 52px;
}

/* 垂直布局适配：当有多型号时 */
.item-v {
  flex-direction: row; /* 保持水平排列以让 label 和 values 左右分布 */
  align-items: center; /* 关键：确保左侧的 label 在整个容器内垂直居中 */
}

.hw-values {
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 右侧内容垂直靠右 */
  gap: var(--space-2);
  flex: 1; /* 占据剩余空间 */
}

.hw-multi-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  width: 100%;
}

.hw-label { 
  font-size: var(--text-sm); 
  font-weight: 600; 
  color: #374151;
  min-width: 60px; /* 给分类标题预留稳定空间 */
}

.hw-value-group { display: flex; align-items: center; gap: var(--space-2); }

@media (max-width: 768px) {
  .hardware-grid { grid-template-columns: 1fr; }
}
</style>

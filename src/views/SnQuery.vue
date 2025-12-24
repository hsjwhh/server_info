<template>
  <div class="sn-query-page">

    <!-- SN 输入框（自动补全） -->
    <el-autocomplete v-model="sn" :fetch-suggestions="handleAutocomplete" placeholder="请输入 SN" clearable
      @select="handleSearch" style="width: 300px" />

    <!-- <el-button type="primary" @click="handleSearch" style="margin-left: 10px">
      查询
    </el-button> -->

    <!-- SN 详情卡片 -->
    <el-card v-if="info" class="detail-card" shadow="hover" width="800">

      <!-- 基本信息 -->
      <div class="section-title">基本信息</div>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="日期" width="100">{{ fullDate }}</el-descriptions-item>
        <el-descriptions-item label="出机客户" width="100">{{ info.出机客户 }}</el-descriptions-item>
        <el-descriptions-item label="业务" width="100">{{ info.业务 }}</el-descriptions-item>

        <el-descriptions-item label="SN">{{ info.SN }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ info.数量 }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ info.备注 }}</el-descriptions-item>
      </el-descriptions>

      <!-- 硬件配置 -->
      <div class="section-title" style="margin-top: 20px;">硬件配置</div>

      <el-table :data="hardwareList" border style="width: 100%" header-cell-class-name="hardware-header">
        <el-table-column prop="name" label="硬件" width="120" />
        <el-table-column label="型号" min-width="200" :formatter="(row) => info[row.model]" />
        <el-table-column label="数量" width="100" :formatter="(row) => row.count ? info[row.count] : ''" />
      </el-table>

    </el-card>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import debounce from 'lodash.debounce'
import { getSn, searchSn } from '../api/sn'

const sn = ref('')

// 页面真正要展示的数据
const info = ref(null)

// 你定义的硬件配置表（根据你的字段名调整）
const hardwareList = [
  { name: "机箱", model: "机箱", count: "" },
  { name: "电源", model: "电源", count: "" },
  { name: "主板", model: "主板", count: "" },
  { name: "BMC密码", model: "BMC密码", count: "" },
  { name: "CPU", model: "CPU", count: "CPU数量" },
  { name: "内存", model: "内存", count: "内存数量" },
  { name: "M.2", model: "M2", count: "M2数量" },
  { name: "SSD", model: "SSD", count: "SSD数量" },
  { name: "HDD", model: "HDD", count: "HDD数量" },
  { name: "阵列卡", model: "阵列卡", count: "阵列卡数量" },
  { name: "网卡", model: "网卡", count: "网卡数量" },
  { name: "显卡", model: "显卡", count: "显卡数量" },
  { name: "系统", model: "系统", count: "" }
]

// 日期格式化
const fullDate = computed(() => {
  if (!info.value) return ''

  const y = info.value.年份
  const m = String(info.value.月份).padStart(2, '0')
  const d = String(info.value.日期).padStart(2, '0')

  return `${y}-${m}-${d}`
})


// 自动补全
const fetchSuggestions = async (query, cb) => {
  if (!query) return cb([])
  const list = await searchSn(query)
  cb(list.map(item => ({ value: item })))
}

const handleAutocomplete = debounce(fetchSuggestions, 500)

// 自动补全选择
// 点击查询按钮
const handleSearch = async () => {
  if (!sn.value) return
  const res = await getSn(sn.value)
  info.value = res?.data || null
}

</script>


<style scoped>
.sn-query-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.detail-card {
  margin: 20px auto;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}


:deep(.hardware-header) {
  font-weight: 700 !important;
  background-color: #f5f7fa !important;
  color: #333 !important;
}
</style>

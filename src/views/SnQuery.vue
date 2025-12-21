<template>
  <div class="sn-query-page">

    <!-- SN 输入框（自动补全） -->
    <el-autocomplete v-model="sn" :fetch-suggestions="handleAutocomplete" placeholder="请输入 SN" clearable
      @select="handleSelect" style="width: 300px" />

    <el-button type="primary" @click="handleSearch" style="margin-left: 10px">
      查询
    </el-button>

    <!-- SN 详情卡片 -->
    <el-card v-if="info" class="detail-card" shadow="hover">

      <!-- 基本信息 -->
      <div class="section-title">基本信息</div>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="日期">{{ fullDate }}</el-descriptions-item>
        <el-descriptions-item label="出机客户">{{ info.出机客户 }}</el-descriptions-item>
        <el-descriptions-item label="业务">{{ info.业务 }}</el-descriptions-item>

        <el-descriptions-item label="SN">{{ info.SN }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ info.数量 }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ info.备注 }}</el-descriptions-item>
      </el-descriptions>

      <!-- 硬件配置 -->
      <div class="section-title" style="margin-top: 20px;">硬件配置</div>

      <el-table :data="hardwareList" border style="width: 100%">
        <el-table-column prop="name" label="硬件" width="180" />
        <el-table-column label="型号" width="200" :formatter="(row) => info[row.model]" />
        <el-table-column label="数量" width="120" :formatter="(row) => row.count ? info[row.count] : ''" />
      </el-table>

    </el-card>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import debounce from 'lodash.debounce'
import { getSn, searchSn, getSnDetail } from '../api/sn'

const sn = ref('')
const tableData = ref([])

// ✅ 原始自动补全逻辑
const fetchSuggestions = async (query, cb) => {
  if (!query) return cb([])

  const list = await searchSn(query)

  if (!Array.isArray(list)) return cb([])

  cb(list.map(item => ({ value: item })))
}

// ✅ 加防抖（300ms）
const handleAutocomplete = debounce(fetchSuggestions, 1000)

// ✅ 自动补全选择
const handleSelect = async (item) => {
  const res = await getSnDetail(item.value)
  tableData.value = res ? [res] : []
}

// ✅ 点击查询按钮
const handleSearch = async () => {
  if (!sn.value) return

  const res = await getSn(sn.value)
  tableData.value = res?.data ? [res.data] : []
}
</script>


<style scoped>
.sn-query-page {
  padding: 20px;
}
</style>

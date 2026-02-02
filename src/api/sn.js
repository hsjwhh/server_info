// src/api/sn.js
/**

- SN 查询模块前端 API 封装
- 
- 所有 SN 相关接口统一从这里调用
- - 自动带 token（因为 utils/request.js 已经处理）
- - 自动刷新 token（401 时自动处理）
    */

import request from '../utils/request'

/**

- SN 搜索（支持筛选条件）
- 
- @param {string} keyword - 搜索关键字（SN、主机名、IP等）
- @param {Object} filters - 筛选条件（可选）
- @param {string} filters.customer - 客户名称
- @param {string} filters.business - 业务类型
- @param {Object} filters.dateRange - 日期范围 { start: Date, end: Date }
- @returns {Promise<Array>} 服务器对象数组
- 
- 后端需要返回完整的服务器对象数组，包含所有字段:
- [
- {
- ```
  SN: "R730-001",
  ```
- ```
  年份: 2024,
  ```
- ```
  月份: 1,
  ```
- ```
  日期: 15,
  ```
- ```
  出机客户: "阿里云",
  ```
- ```
  业务: "云计算",
  ```
- ```
  数量: 10,
  ```
- ```
  备注: "备注",
  ```
- ```
  机箱: "2U机箱",
  ```
- ```
  CPU: "Intel Xeon E5-2680 v4",
  ```
- ```
  CPU数量: 2,
  ```
- ```
  内存: "32GB DDR4",
  ```
- ```
  内存数量: 8,
  ```
- ```
  // ... 其他硬件字段
  ```
- }
- ]
- 
- 示例:
- searchSn('R730')
- → GET /api/sn?keyword=R730
- 
- searchSn('R730', { customer: '阿里云', business: '云计算' })
- → GET /api/sn?keyword=R730&customer=阿里云&business=云计算
  */
export function searchSn(keyword = '', filters = {}) {
  const params = { keyword }

  // 添加筛选条件
  if (filters.customer) {
    params.customer = filters.customer
  }

  if (filters.business) {
    params.business = filters.business
  }

  // 日期范围处理
  if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
    // 转换为 YYYY-MM-DD 格式
    params.dateStart = formatDate(filters.dateRange.start)
    params.dateEnd = formatDate(filters.dateRange.end)
  }

  return request.get('/sn', { params })
}

/**

- SN 详情查询
- 
- @param {string} sn - SN 编号
- @returns {Promise<Object>} 服务器详情对象
- 
- 后端返回完整的服务器对象:
- {
- SN: “R730-001”,
- 年份: 2024,
- 月份: 1,
- 日期: 15,
- 出机客户: “阿里云”,
- 业务: “云计算”,
- 数量: 10,
- 备注: “备注信息”,
- 机箱: “2U机箱”,
- 电源: “800W冗余电源”,
- 主板: “Dell PowerEdge R730”,
- BMC密码: “admin123”,
- CPU: “Intel Xeon E5-2680 v4”,
- CPU数量: 2,
- 内存: “32GB DDR4”,
- 内存数量: 8,
- M2: “512GB NVMe”,
- M2数量: 1,
- SSD: “1TB SATA”,
- SSD数量: 2,
- HDD: “4TB SATA”,
- HDD数量: 4,
- 阵列卡: “LSI 9361-8i”,
- 阵列卡数量: 1,
- 网卡: “Intel X540 10GbE”,
- 网卡数量: 2,
- 显卡: “NVIDIA Tesla P40”,
- 显卡数量: 2,
- 系统: “Ubuntu 20.04 LTS”
- }
- 
- 示例:
- getSnDetail('R730-001')
- → GET /api/sn/R730-001
  */
export function getSnDetail(sn) {
  return request.get(`/sn/${sn}`)
}

/**

- 辅助函数：格式化日期为 YYYY-MM-DD
  */
function formatDate(date) {
  if (!date) return ''

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
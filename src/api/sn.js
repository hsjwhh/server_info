// src/api/sn.js
/**
 * SN 查询模块 API 封装。
 * 所有 SN 相关请求统一从这里发起：
 * 1. 自动带 token（由 utils/request.js 处理）
 * 2. 401 自动刷新 token（由 utils/request.js 处理）
 */

import request from '../utils/request'

/**
 * SN 搜索（支持筛选条件）。
 * @param {string} keyword - 搜索关键字（SN、主机名、IP 等）
 * @param {Object} filters - 筛选条件（可选）
 * @param {string} filters.customer - 客户名称
 * @param {string} filters.business - 业务类型
 * @param {Object} filters.dateRange - 日期范围 { start, end }
 * @returns {Promise<Array>} 服务器对象数组（字段命名以当前后端返回为准）
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
 * SN 详情查询。
 * @param {string} sn - SN 编号
 * @returns {Promise<Object|null>} 服务器详情对象
 */
export function getSnDetail(sn) {
  return request.get(`/sn/${sn}`)
}

/**
 * 辅助函数：格式化日期为 YYYY-MM-DD
 */
function formatDate(date) {
  if (!date) return ''

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

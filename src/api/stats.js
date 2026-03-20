// src/api/stats.js
import request from '../utils/request'

/**
 * 获取仪表盘汇总统计数据
 * 包含：核心统计、最近记录、OS 分布
 * @returns {Promise<Object>}
 */
export function getDashboardStats() {
  return request.get('/stats/dashboard')
}

//  rc/api/sn.js
/**
 *
 * SN 查询模块前端 API 封装：
 *   - 所有 SN 相关接口统一从这里调用
 *   - 自动带 token（因为 utils/request.js 已经处理）
 *   - 自动刷新 token（401 时自动处理）
 *
 * 后端接口：
 *   GET /api/sn?keyword=xxx     → SN 搜索（自动补全）
 *   GET /api/sn/:sn             → SN 详情查询
 */

import request from '../utils/request'

/**
 * SN 搜索（自动补全）
 *
 * @param {string} keyword - 搜索关键字，可为空
 * @returns {Promise<Array>}
 *
 * 示例：
 *   searchSn('R730')
 *   → GET /api/sn?keyword=R730
 */
export function searchSn(keyword = '') {
  return request.get('/sn', {
    params: { keyword }
  })
}

/**
 * SN 详情查询
 *
 * @param {string} sn - SN 编号
 * @returns {Promise<Object>}
 *
 * 示例：
 *   getSnDetail('R730-001')
 *   → GET /api/sn/R730-001
 */
export function getSnDetail(sn) {
  return request.get(`/sn/${sn}`)
}

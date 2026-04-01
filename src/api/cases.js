// src/api/cases.js
import request from '../utils/request'

/** 查询工单列表（分页 + 筛选） */
export function getCases(params = {}) {
  return request.get('/cases', { params })
}

/** 获取工单详情 */
export function getCaseDetail(id) {
  return request.get(`/cases/${id}`)
}

/** 新建工单 */
export function createCase(data) {
  return request.post('/cases', data)
}

/** 更新工单（status / solution / handler_id） */
export function updateCase(id, data) {
  return request.put(`/cases/${id}`, data)
}

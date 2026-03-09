// src/api/server.js
import request from '../utils/request'

/**
 * 录入新的服务器信息
 * @param {Object} data - 服务器表单数据
 */
export function createServer(data) {
  return request.post('/server/entry', data)
}

/**
 * 检查 SN 唯一性
 * @param {string} sn - 序列号
 */
export function checkSnUnique(sn) {
  return request.get(`/server/check-sn/${sn}`)
}

// src/api/filters.js
/**
 * 筛选相关 API 封装，用于获取筛选器选项列表。
 */

import request from '../utils/request'

/**
 * 获取客户列表。
 * @returns {Promise<Array>} 客户列表
 */
export function getCustomerList() {
  return request.get('/filters/customers')
}

/**
 * 获取业务类型列表。
 * @returns {Promise<Array>} 业务类型列表
 */
export function getBusinessList() {
  return request.get('/filters/businesses')
}

/**
 * 获取机房列表（预留）。
 * @returns {Promise<Array>} 机房列表
 */
export function getIdcList() {
  return request.get('/filters/idcs')
}

/**
 * 获取所有筛选选项（一次性获取，减少请求）。
 * @returns {Promise<Object>} 所有筛选选项
 */
export function getAllFilters() {
  return request.get('/filters/all')
}

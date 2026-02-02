// src/api/filters.js
/**

- 筛选相关 API 封装
- 
- 用于获取筛选器的选项列表
  */

import request from '../utils/request'

/**

- 获取客户列表
- 
- @returns {Promise<Array>} 客户列表
- 
- 后端返回格式示例:
- [
- { name: “阿里云”, value: “阿里云” },
- { name: “腾讯云”, value: “腾讯云” },
- { name: “华为云”, value: “华为云” }
- ]
- 
- 或简化格式:
- [“阿里云”, “腾讯云”, “华为云”]
  */
  export function getCustomerList() {
  return request.get('/filters/customers')
  }

/**

- 获取业务类型列表
- 
- @returns {Promise<Array>} 业务类型列表
- 
- 后端返回格式示例:
- [
- { name: “云计算”, value: “云计算” },
- { name: “大数据”, value: “大数据” },
- { name: “AI训练”, value: “AI训练” }
- ]
- 
- 或简化格式:
- [“云计算”, “大数据”, “AI训练”]
  */
  export function getBusinessList() {
  return request.get('/filters/businesses')
  }

/**

- 获取机房列表（预留）
- 
- @returns {Promise<Array>} 机房列表
  */
  export function getIdcList() {
  return request.get('/filters/idcs')
  }

/**

- 获取所有筛选选项（一次性获取，减少请求）
- 
- @returns {Promise<Object>} 所有筛选选项
- 
- 返回格式:
- {
- customers: [“阿里云”, “腾讯云”],
- businesses: [“云计算”, “大数据”],
- idcs: [“LAX-DC-1”, “LAX-DC-2”]
- }
  */
  export function getAllFilters() {
  return request.get('/filters/all')
  }
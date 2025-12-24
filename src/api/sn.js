// src/api/sn.js
// SN 模块前端 API 封装
// 使用统一的 axios 实例（src/utils/request.js）

import request from '../utils/request'

// ✅ 1. 查询详情（RESTful）
// GET /api/sn/:sn
export function getSn(sn) {
  return request.get(`/sn/${sn}`)
}

// ✅ 2. 自动补全（模糊搜索）
// GET /api/sn/search?keyword=xxx
export function searchSn(keyword) {
  return request.get('/sn', {
    params: { keyword }
  })
}

// ✅ 3. 查询详情（Query 版本）
// GET /api/sn/detail?sn=xxx
// export function getSnDetail(sn) {
//   return request.get('/sn/detail', {
//     params: { sn }
//   })
// }


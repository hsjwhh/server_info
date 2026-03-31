// src/api/users.js
import request from '../utils/request'

/**
 * 获取所有用户列表
 */
export function getUsers() {
  return request.get('/users')
}

/**
 * 创建新用户
 * @param {Object} data - { username, password, role }
 */
export function createUser(data) {
  return request.post('/users', data)
}

/**
 * 更新用户信息
 * @param {string} userId - 用户 ID (HashID)
 * @param {Object} data - { role, status }
 */
export function updateUser(userId, data) {
  return request.put(`/users/${userId}`, data)
}

/**
 * 删除用户
 * @param {string} userId - 用户 ID (HashID)
 */
export function deleteUser(userId) {
  return request.delete(`/users/${userId}`)
}

/**
 * 修改个人密码
 * @param {Object} data - { oldPassword, newPassword }
 */
export function changePassword(data) {
  return request.post('/auth/change-password', data)
}

// ==================== Session 管理 ====================

/**
 * 获取自己的活跃 session 列表
 */
export function getMySessions() {
  return request.get('/auth/sessions')
}

/**
 * 踢掉自己的指定 session
 * @param {string} sessionId - HashID
 */
export function revokeMySession(sessionId) {
  return request.delete(`/auth/sessions/${sessionId}`)
}

/**
 * 踢掉自己所有其他 session（保留当前）
 */
export function revokeOtherSessions() {
  return request.delete('/auth/sessions')
}

/**
 * Admin 查看指定用户的 session 列表
 * @param {string} userId - HashID
 */
export function getUserSessions(userId) {
  return request.get(`/users/${userId}/sessions`)
}

/**
 * Admin 踢掉指定用户的某个 session
 * @param {string} userId - HashID
 * @param {string} sessionId - HashID
 */
export function revokeUserSession(userId, sessionId) {
  return request.delete(`/users/${userId}/sessions/${sessionId}`)
}

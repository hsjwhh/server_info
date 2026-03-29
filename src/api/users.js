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

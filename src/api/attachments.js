// src/api/attachments.js
import request from '../utils/request'

/**
 * 上传附件
 * @param {File} file - 文件对象
 * @param {string} entityType - 关联业务类型，如 'server'
 * @param {string} entityId - 关联业务 ID（混淆值）
 */
export function uploadAttachment(file, entityType, entityId) {
  const formData = new FormData()
  formData.append('file', file)
  if (entityType) formData.append('entity_type', entityType)
  if (entityId) formData.append('entity_id', entityId)

  return request.post('/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 查询附件列表
 * @param {string} entityType
 * @param {string} entityId - 混淆值
 */
export function getAttachments(entityType, entityId) {
  return request.get('/attachments', {
    params: { entity_type: entityType, entity_id: entityId }
  })
}

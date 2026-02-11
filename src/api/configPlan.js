// src/api/configPlan.js
/**
 * 硬件配置方案 API 封装
 * 
 * 功能：
 *   - CPU 搜索和匹配
 *   - 主板兼容性查询
 *   - 配置方案保存和加载
 */

import request from '../utils/request'

/**
 * 搜索 CPU（自动补全）
 * 
 * @param {string} keyword - CPU 型号关键字
 * @returns {Promise<Array>} CPU 列表
 * 
 * 返回格式示例：
 * [
 *   {
 *     id: 123,  // 👈 数据库自增 ID（主键）
 *     cpu_short_name: "Intel Xeon E5-2680 v4",
 *     cores: 14,
 *     threads: 28,
 *     base_freq: 2.4,
 *     turbo_freq: 3.3,
 *     tdp: 120,
 *     memory_type: "DDR4",
 *     max_memory_speed: 2400,
 *     socket: "LGA2011-3"
 *   }
 * ]
 */
export function searchCpu(keyword) {
  return request.get('/hw/cpu', {
    params: { keyword }
  })
}

/**
 * 获取 CPU 详细信息
 * 
 * @param {number} cpuId - CPU ID（数据库主键）
 * @returns {Promise<Object>} CPU 详细信息
 * 
 * 示例：
 *   getCpuDetail(123)
 *   → GET /api/hw/cpu/123
 */
export function getCpuDetail(cpuId) {
  return request.get(`/hw/cpu/${cpuId}`)
}

/**
 * 获取兼容的主板列表
 * 
 * @param {number} cpuId - CPU ID（数据库主键）
 * @returns {Promise<Array>} 兼容主板列表
 * 
 * 返回格式示例：
 * [
 *   {
 *     id: 456,  // 👈 主板 ID
 *     model: "Supermicro X10DRi",
 *     chipset: "Intel C612",
 *     socket: "LGA2011-3",
 *     cpu_support: ["E5-2600 v3", "E5-2600 v4"],
 *     memory_slots: 16,
 *     memory_type: "DDR4",
 *     max_memory: 512,
 *     pcie_slots: "3 × PCIe 3.0 x16",
 *     power: 50
 *   }
 * ]
 * 
 * 示例：
 *   getCompatibleMotherboards(123)
 *   → GET /api/hw/motherboard/compatible?cpu_id=123
 */
export function getCompatibleMotherboards(cpuId) {
  return request.get('/hw/motherboard/compatible', {
    params: { cpu_id: cpuId }
  })
}

/**
 * 搜索主板
 * 
 * @param {string} keyword - 主板型号关键字
 * @returns {Promise<Array>} 主板列表
 */
export function searchMotherboard(keyword) {
  return request.get('/hw/motherboard/search', {
    params: { keyword }
  })
}

/**
 * 保存配置方案
 * 
 * @param {Object} config - 配置数据
 * @returns {Promise<Object>} 保存结果
 */
export function saveConfig(config) {
  return request.post('/config-plan', config)
}

/**
 * 获取配置方案列表
 * 
 * @returns {Promise<Array>} 配置方案列表
 */
export function getConfigList() {
  return request.get('/config-plan')
}

/**
 * 获取配置方案详情
 * 
 * @param {string} configId - 配置方案 ID
 * @returns {Promise<Object>} 配置详情
 */
export function getConfigDetail(configId) {
  return request.get(`/config-plan/${configId}`)
}

/**
 * 删除配置方案
 * 
 * @param {string} configId - 配置方案 ID
 * @returns {Promise<Object>} 删除结果
 */
export function deleteConfig(configId) {
  return request.delete(`/config-plan/${configId}`)
}

/**
 * 计算功耗（可选，如果后端有专门的计算接口）
 * 
 * @param {Object} hw - 硬件配置
 * @returns {Promise<Object>} 功耗计算结果
 */
export function calculatePower(hw) {
  return request.post('/hw/power-calculation', hw)
}

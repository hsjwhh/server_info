// src/stores/configPlanValidation.js
// ConfigPlan 统一校验入口：集中维护所有"可阻断/可提示"的规则。

const parsePositiveInt = (value) => {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10)
  return Number.isFinite(num) && num > 0 ? num : null
}

/**
 * 标准化 Socket 名称，统一两端格式后再比较：
 *   FCLGA4677  → LGA4677
 *   LGA-4677   → LGA4677
 * 只处理已知的 Intel FCLGA 前缀，避免 /^FC/ 误伤其他封装（如 FC-BGA）
 */
const normalizeSocket = (value) => {
  return String(value || '')
    .toUpperCase()
    .replace(/^FCLGA(\d+)$/, 'LGA$1')  // 仅处理 FCLGA → LGA，精确匹配
    .replace(/[^A-Z0-9]/g, '')
}

/**
 * DEV 环境：检查调用方是否误传了 ref 而不是 .value
 * 仅开发时运行，生产构建会被 tree-shake 掉
 */
const warnIfRef = (input) => {
  if (!import.meta.env.DEV) return
  for (const [key, val] of Object.entries(input)) {
    if (val !== null && typeof val === 'object' && '__v_isRef' in val) {
      console.warn(`[validateConfig] 参数 "${key}" 疑似传入了 ref，应传 .value`)
    }
  }
}

export function validateConfig(rawInput) {
  warnIfRef(rawInput)

  const result = {
    blockers: [],
    warnings: [],
    // infos：用于无问题时的正向反馈，或低优先级的配置建议
    infos: []
  }

  const {
    selectedCpu,
    selectedMotherboard,
    selectedMotherboardDetail,
    formattedSocket,
    totalMemory,
    memoryCount,
    maxMemorySlots,
    totalPower,
    recommendedPSU
  } = rawInput

  if (!selectedCpu) return result

  if (!selectedMotherboard) {
    result.warnings.push('已选择 CPU，但尚未选择主板')
  }

  // CPU / 主板 socket 一致性校验
  if (selectedMotherboardDetail && formattedSocket) {
    const mbSocket = selectedMotherboardDetail.sockets || selectedMotherboardDetail.socket
    if (mbSocket && normalizeSocket(mbSocket) !== normalizeSocket(formattedSocket)) {
      result.blockers.push(`主板 socket (${mbSocket}) 与 CPU socket (${formattedSocket}) 不兼容`)
    }
  }

  const maxMemory = parsePositiveInt(selectedMotherboardDetail?.max_memory)
  if (maxMemory && totalMemory > maxMemory) {
    result.blockers.push(`内存总容量 ${totalMemory}GB 超过主板最大支持 ${maxMemory}GB`)
  }

  if (memoryCount > maxMemorySlots) {
    result.blockers.push(`内存条数量 ${memoryCount} 超过主板插槽数 ${maxMemorySlots}`)
  }

  if (recommendedPSU > 0) {
    const powerRatio = totalPower / recommendedPSU
    if (powerRatio > 1) {
      result.blockers.push(`系统总功耗 ${totalPower}W 已超过建议电源 ${recommendedPSU}W`)
    } else if (powerRatio > 0.85) {
      result.warnings.push('系统功耗接近电源理论上限，建议添加更多冗余')
    } else if (powerRatio > 0.7) {
      result.infos.push(`当前功耗负载 ${Math.round(powerRatio * 100)}%，电源余量充足`)
    }
  }

  // 全部通过时给出正向反馈
  if (result.blockers.length === 0 && result.warnings.length === 0 && selectedMotherboard) {
    result.infos.push('当前配置兼容性检查通过')
  }

  return result
}

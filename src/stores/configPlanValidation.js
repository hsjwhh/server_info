// src/stores/configPlanValidation.js
// ConfigPlan 统一校验入口：集中维护所有“可阻断/可提示”的规则。

const parsePositiveInt = (value) => {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10)
  return Number.isFinite(num) && num > 0 ? num : null
}

const normalizeSocket = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '')

export function validateConfig(input) {
  const result = {
    blockers: [],
    warnings: [],
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
  } = input

  if (!selectedCpu) return result

  if (!selectedMotherboard) {
    result.warnings.push('已选择 CPU，但尚未选择主板')
  }

  // CPU / 主板 socket 一致性校验（即使下拉已按 socket 过滤，这里仍做最终兜底）
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
    } else if (powerRatio > 0.9) {
      result.warnings.push('系统功耗接近电源理论上限，建议添加更多冗余')
    }
  }

  return result
}

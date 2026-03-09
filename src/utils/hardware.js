// src/utils/hardware.js
// 硬件相关的公共工具函数，供 configPlan store 和各录入/查询页面共用

/**
 * 格式化 CPU Socket 名称，统一 cpu_info 和 mb_info 两张表的字段值，
 * 确保 getMbBySocket() 的参数与主板表中存储的格式一致。
 *
 * 背景：
 *   Intel 在 cpu_info 表中使用 FCLGA 前缀（FC = Flip-Chip 封装工艺），
 *   但 mb_info 表中对应字段存的是业界通用的 LGA-xxxx 格式，
 *   因此查询时必须先做转换，否则匹配不到任何主板。
 *
 *   AMD（SP3、SP5、AM4、AM5、TR4、sTRX40 等）两表格式一致，原样传递即可。
 *
 * 转换规则：
 *   FCLGA4677  → LGA-4677   (Intel Xeon Sapphire Rapids)
 *   FCLGA3647  → LGA-3647   (Intel Xeon Skylake/Cascade Lake)
 *   FCLGA4189  → LGA-4189   (Intel Xeon Ice Lake)
 *   SP5        → SP5        (AMD EPYC Genoa，原样)
 *   SP3        → SP3        (AMD EPYC Naples/Rome，原样)
 *   AM5        → AM5        (AMD Ryzen 7000，原样)
 *
 * @param {string|undefined} socket - cpu_info 表中的原始 socket 字段值
 * @returns {string|undefined} mb_info 表中对应的 socket 值
 */
export function formatSocket(socket) {
  if (!socket) return socket
  if (socket.startsWith('FCLGA')) {
    return socket.replace(/^FCLGA(\d+)$/, 'LGA-$1')
  }
  return socket
}

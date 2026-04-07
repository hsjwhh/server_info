export const CASE_STATUS_OPTIONS = [
  { text: '全部', value: '' },
  { text: '待处理', value: 'open' },
  { text: '处理中', value: 'processing' },
  { text: '已解决', value: 'resolved' },
  { text: '已关闭', value: 'closed' },
]

const CASE_STATUS_COLOR = {
  open: 'warning',
  processing: 'info',
  resolved: 'success',
  closed: 'secondary',
}

export function getCaseStatusColor(status) {
  return CASE_STATUS_COLOR[status] || 'primary'
}

export function getCaseStatusLabel(status) {
  const option = CASE_STATUS_OPTIONS.find((item) => item.value === status)
  return option ? option.text : status
}

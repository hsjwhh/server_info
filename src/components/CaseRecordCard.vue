<template>
  <article class="case-record">
    <div class="case-record__rail">
      <div class="case-record__dot" :class="`case-record__dot--${caseItem.status}`"></div>
    </div>

    <div class="case-record__body">
      <div class="case-record__header">
        <div class="case-record__header-main">
          <div class="case-record__title-row">
            <span class="case-record__case-no">{{ caseItem.case_no }}</span>
            <VaChip :color="getCaseStatusColor(caseItem.status)" size="small" class="case-record__status-chip">
              {{ getCaseStatusLabel(caseItem.status) }}
            </VaChip>
            <span class="case-record__time">{{ formatDate(caseItem.created_at) }}</span>
          </div>
          <div class="case-record__meta-row">
            <span class="case-record__creator-label">创建人</span>
            <span class="case-record__creator-name">{{ caseItem.created_by_name || '-' }}</span>
          </div>
        </div>

        <VaButton
          v-if="actionLabel"
          preset="plain"
          icon="mdi-pencil-outline"
          size="small"
          class="case-record__detail-button"
          @click="$emit('action', caseItem)"
        >
          {{ actionLabel }}
        </VaButton>
      </div>

      <div class="case-record__grid">
        <div v-for="field in infoFields" :key="field.label" class="case-info">
          <div class="case-info__label">{{ field.label }}</div>
          <div class="case-info__value">{{ field.value }}</div>
        </div>
      </div>

      <div class="case-section">
        <div class="case-section__label">{{ descriptionLabel }}</div>
        <div class="case-section__content">{{ caseItem.description || '-' }}</div>
      </div>

      <div v-if="caseItem.solution" class="case-section">
        <div class="case-section__label">{{ solutionLabel }}</div>
        <div class="case-section__content case-section__content--secondary">{{ caseItem.solution }}</div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { VaButton, VaChip } from 'vuestic-ui'
import { getCaseStatusColor, getCaseStatusLabel } from '../utils/caseStatus'

const props = defineProps({
  caseItem: { type: Object, required: true },
  formatDate: { type: Function, required: true },
  actionLabel: { type: String, default: '' },
  descriptionLabel: { type: String, default: '问题描述' },
  solutionLabel: { type: String, default: '处理结果' },
  serverSn: { type: String, default: '' },
  fields: { type: Array, default: null },
})

defineEmits(['action'])

const infoFields = computed(() => {
  if (Array.isArray(props.fields) && props.fields.length > 0) {
    return props.fields
  }

  return [
    { label: '服务器 SN', value: props.caseItem.sn || props.serverSn || '-' },
    { label: '问题类型', value: props.caseItem.issue_type || '未分类' },
    { label: '报修人/联系方式', value: props.caseItem.reporter_contact || '-' },
    { label: '状态', value: getCaseStatusLabel(props.caseItem.status) },
  ]
})
</script>

<style scoped>
.case-record {
  display: flex;
  gap: 16px;
}

.case-record__rail {
  position: relative;
  width: 18px;
  flex: 0 0 18px;
}

.case-record__rail::after {
  content: '';
  position: absolute;
  top: 16px;
  bottom: -16px;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: rgba(148, 163, 184, 0.26);
}

.case-record:last-child .case-record__rail::after {
  display: none;
}

.case-record__dot {
  position: relative;
  z-index: 1;
  width: 12px;
  height: 12px;
  margin-top: 10px;
  border-radius: 50%;
  background: var(--va-primary);
  box-shadow: 0 0 0 4px var(--va-background-primary);
}

.case-record__dot--open { background: var(--va-warning); }
.case-record__dot--processing { background: var(--va-info); }
.case-record__dot--resolved { background: var(--va-success); }
.case-record__dot--closed { background: var(--va-secondary); }

.case-record__body {
  flex: 1;
  min-width: 0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.case-record__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  background: #f2f4f6;
}

.case-record__header-main {
  flex: 1;
  min-width: 0;
}

.case-record__title-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex-wrap: wrap;
}

.case-record__case-no {
  font-size: 1rem;
  font-weight: 700;
  color: #2356c9;
  font-family: Manrope, sans-serif;
  letter-spacing: 0.02em;
}

.case-record__meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.case-record__time {
  font-size: 12px;
  color: #667085;
  margin-left: auto;
}

.case-record__status-chip {
  flex-shrink: 0;
}

.case-record__creator-label {
  font-size: 12px;
  color: #98a2b3;
}

.case-record__creator-name {
  font-size: 12px;
  font-weight: 600;
  color: #344054;
}

.case-record__detail-button {
  color: #2356c9;
}

.case-record__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  padding: 24px 24px 0;
}

.case-info {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.case-info__label,
.case-section__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--va-text-secondary);
}

.case-info__value {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
  word-break: break-word;
}

.case-section {
  margin-top: 18px;
  padding: 0 24px 24px;
}

.case-section__content {
  margin-top: 6px;
  line-height: 1.7;
  color: var(--va-text-primary);
  word-break: break-word;
}

.case-section__content--secondary {
  color: var(--va-text-secondary);
}

@media (max-width: 768px) {
  .case-record__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .case-record__title-row {
    flex-wrap: wrap;
  }

  .case-record__time {
    margin-left: 0;
  }

  .case-record__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .case-record__grid {
    grid-template-columns: 1fr;
  }
}
</style>
